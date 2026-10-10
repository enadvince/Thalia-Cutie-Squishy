// Casing shapes, drawn in a 260×260 box. A shape is a union of simple parts:
//   { c: [cx, cy, r] }                   circle
//   { e: [cx, cy, rx, ry, rotate?] }     ellipse
//   { r: [x, y, w, h, radius] }          rounded rect
//   { d: 'svg path' }                    path
// face: where the cute face goes ({ x, y, s: scale, pixel?: square eyes }), or null.
// decor: extra details drawn on top (see ShapeDecor in SquishyView.jsx).
// attach: where a keychain / clip / necklace connects (top of the shape).
export const SHAPES = [
  {
    id: 'dumpling', attach: [130, 66], name: 'Dumpling',
    parts: [{ d: 'M28 182C28 112 78 66 130 66s102 46 102 116c0 26-46 36-102 36S28 208 28 182z' }],
    face: { x: 130, y: 166, s: 1 }, decor: 'pleats',
  },
  { id: 'cube', attach: [130, 52], name: 'Cube', parts: [{ r: [48, 52, 164, 164, 42] }], face: { x: 130, y: 142, s: 1 } },
  { id: 'ball', attach: [130, 42], name: 'Ball', parts: [{ c: [130, 136, 94] }], face: { x: 130, y: 146, s: 1 } },
  {
    id: 'jellyfish', attach: [130, 40], name: 'Jellyfish',
    parts: [{ d: 'M36 150C36 84 80 40 130 40s94 44 94 110c-12 12-24 12-36 0-12 12-24 12-36 0-12 12-32 12-44 0-12 12-24 12-36 0-12 12-24 12-36 0z' }],
    face: { x: 130, y: 112, s: 0.9 }, decor: 'tentacles',
  },
  {
    id: 'blocky-buddy', attach: [130, 30], name: 'Blocky Buddy',
    parts: [
      { r: [70, 30, 120, 104, 8] }, { r: [86, 130, 88, 66, 6] },
      { r: [54, 136, 34, 50, 6] }, { r: [172, 136, 34, 50, 6] },
      { r: [90, 192, 34, 36, 4] }, { r: [136, 192, 34, 36, 4] },
    ],
    face: { x: 130, y: 86, s: 0.9, pixel: true },
  },
  {
    id: 'axolotl', attach: [130, 72], name: 'Axolotl',
    parts: [{ e: [130, 146, 94, 74] }, { e: [80, 214, 22, 14] }, { e: [180, 214, 22, 14] }],
    face: { x: 130, y: 150, s: 1 }, decor: 'gills',
  },
  {
    id: 'butter', attach: [130, 98], name: 'Butter',
    parts: [{ d: 'M14 124L38 98H246V186L222 212H14Z' }],
    face: { x: 118, y: 168, s: 0.85 }, decor: 'butterEdges',
  },
  { id: 'rectangle', attach: [130, 64], name: 'Rectangle', parts: [{ r: [18, 64, 224, 152, 30] }], face: { x: 130, y: 144, s: 1 } },
  {
    id: 'heart', attach: [130, 78], name: 'Heart',
    parts: [{ d: 'M130 226C130 226 26 162 26 96a54 54 0 01104-20 54 54 0 01104 20c0 66-104 130-104 130z' }],
    face: { x: 130, y: 128, s: 0.9 },
  },
  {
    id: 'bread', attach: [130, 58], name: 'Bread',
    parts: [{ d: 'M36 204V132C36 88 64 70 96 76c10-22 58-22 68 0 32-6 60 12 60 56v72q0 16-16 16H52q-16 0-16-16z' }],
    face: { x: 130, y: 156, s: 1 }, decor: 'crust',
  },
  {
    id: 'star', attach: [130, 28], name: 'Star',
    parts: [{ d: 'M130 26L159 92L230 99L176 146L192 216L130 179L68 216L84 146L30 99L101 92Z' }],
    face: { x: 130, y: 142, s: 0.75 },
  },
  {
    id: 'pillow-pal', attach: [130, 72], name: 'Pillow Pal',
    parts: [{ d: 'M40 58Q130 84 220 58Q196 140 220 222Q130 196 40 222Q64 140 40 58Z' }],
    face: { x: 130, y: 144, s: 1 },
  },
  {
    id: 'puppy', attach: [130, 64], name: 'Puppy',
    parts: [{ c: [130, 144, 80] }, { e: [44, 150, 26, 50, 22] }, { e: [216, 150, 26, 50, -22] }],
    face: { x: 130, y: 150, s: 1 }, decor: 'snout',
  },
  {
    id: 'paw-print', attach: [130, 112], name: 'Paw Print',
    parts: [{ e: [130, 170, 74, 58] }, { c: [60, 98, 27] }, { c: [104, 64, 27] }, { c: [156, 64, 27] }, { c: [200, 98, 27] }],
    face: { x: 130, y: 174, s: 0.75 },
  },
  {
    id: 'kitty', attach: [130, 74], name: 'Kitty',
    parts: [{ e: [130, 150, 94, 76] }, { d: 'M48 118L58 38L114 82Z' }, { d: 'M212 118L202 38L146 82Z' }],
    face: { x: 130, y: 154, s: 1 }, decor: 'whiskers',
  },
  {
    id: 'gummy-bear', attach: [130, 22], name: 'Gummy Bear',
    parts: [
      { c: [88, 40, 20] }, { c: [172, 40, 20] }, { c: [130, 76, 54] }, { e: [130, 170, 66, 58] },
      { e: [70, 150, 20, 32, -30] }, { e: [190, 150, 20, 32, 30] }, { c: [94, 222, 26] }, { c: [166, 222, 26] },
    ],
    face: { x: 130, y: 82, s: 0.62 },
  },
]

export const shapeById = (id) => SHAPES.find((s) => s.id === id) ?? SHAPES[0]
