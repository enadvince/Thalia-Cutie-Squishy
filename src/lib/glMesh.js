// Minimal WebGL renderer for the soft-body squishy: draws a picture stretched over a bendable grid,
// plus small textured quads (the add-ons floating inside). Returns null if WebGL isn't available.
const VERT = `
attribute vec2 a_pos;
attribute vec2 a_uv;
attribute float a_shade;
uniform vec2 u_scale;
varying vec2 v_uv;
varying float v_shade;
void main() {
  v_uv = a_uv;
  v_shade = a_shade;
  gl_Position = vec4((a_pos.x - 0.5) * u_scale.x, (0.5 - a_pos.y) * u_scale.y, 0.0, 1.0);
}`
const FRAG = `
precision mediump float;
uniform sampler2D u_tex;
uniform bool u_cut;
varying vec2 v_uv;
varying float v_shade;
void main() {
  vec4 c = texture2D(u_tex, v_uv);
  if (u_cut && c.a < 0.5) discard;
  gl_FragColor = vec4(c.rgb * v_shade, c.a);
}`

export function createRenderer(canvas) {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: true, stencil: true })
  if (!gl) return null

  const shader = (type, src) => {
    const s = gl.createShader(type)
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return s
  }
  const program = gl.createProgram()
  gl.attachShader(program, shader(gl.VERTEX_SHADER, VERT))
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)

  const loc = {
    pos: gl.getAttribLocation(program, 'a_pos'),
    uv: gl.getAttribLocation(program, 'a_uv'),
    shade: gl.getAttribLocation(program, 'a_shade'),
    cut: gl.getUniformLocation(program, 'u_cut'),
    scale: gl.getUniformLocation(program, 'u_scale'),
  }
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA) // premultiplied alpha
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)

  const buffers = { pos: gl.createBuffer(), uv: gl.createBuffer(), shade: gl.createBuffer(), index: gl.createBuffer() }
  const textures = {}

  const bind = (buffer, location, size, data) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW)
    gl.enableVertexAttribArray(location)
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0)
  }
  const draw = (name, pos, uv, shade, index) => {
    if (!textures[name]) return
    gl.bindTexture(gl.TEXTURE_2D, textures[name])
    bind(buffers.pos, loc.pos, 2, pos)
    bind(buffers.uv, loc.uv, 2, uv)
    bind(buffers.shade, loc.shade, 1, shade)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.DYNAMIC_DRAW)
    gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0)
  }

  // Triangle indices for an (n+1)×(n+1) grid.
  const gridIndex = (n) => {
    const idx = new Uint16Array(n * n * 6)
    let k = 0
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const a = j * (n + 1) + i
        idx.set([a, a + 1, a + n + 1, a + 1, a + n + 2, a + n + 1], k)
        k += 6
      }
    }
    return idx
  }
  let meshIndex = null

  return {
    setTexture(name, source) {
      const tex = textures[name] ?? gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      textures[name] = tex
    },
    // The squishy is drawn as a centered square, `side` pixels wide, leaving room around it to stretch.
    resize(width, height, side) {
      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)
      gl.uniform2f(loc.scale, (2 * side) / width, (2 * side) / height)
    },
    clear() {
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT)
    },
    // Limit the next draws to where this layer is solid (keeps add-ons inside the squishy).
    maskFrom(name, body) {
      gl.enable(gl.STENCIL_TEST)
      gl.stencilFunc(gl.ALWAYS, 1, 0xff)
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE)
      gl.colorMask(false, false, false, false)
      gl.uniform1i(loc.cut, 1)
      this.drawMesh(name, body)
      gl.uniform1i(loc.cut, 0)
      gl.colorMask(true, true, true, true)
      gl.stencilFunc(gl.EQUAL, 1, 0xff)
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP)
    },
    unmask() {
      gl.disable(gl.STENCIL_TEST)
    },
    // body: a SoftBody (positions, texture coords from its home grid, and shading).
    drawMesh(name, body) {
      meshIndex ??= gridIndex(body.n)
      draw(name, body.pos, body.home, body.shade, meshIndex)
    },
    // quads: [{ corners: [x0,y0, x1,y1, x2,y2, x3,y3], uv: [u0, v0, u1, v1] }]
    drawQuads(name, quads) {
      if (!quads.length) return
      const pos = new Float32Array(quads.length * 8)
      const uv = new Float32Array(quads.length * 8)
      const index = new Uint16Array(quads.length * 6)
      quads.forEach((q, i) => {
        pos.set(q.corners, i * 8)
        const [u0, v0, u1, v1] = q.uv
        uv.set([u0, v0, u1, v0, u1, v1, u0, v1], i * 8)
        const b = i * 4
        index.set([b, b + 1, b + 2, b, b + 2, b + 3], i * 6)
      })
      draw(name, pos, uv, new Float32Array(quads.length * 4).fill(1), index)
    },
  }
}
