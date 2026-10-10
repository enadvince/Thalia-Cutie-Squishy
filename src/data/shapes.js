// Casing shapes, drawn in a 260×260 box. A shape is a union of simple parts:
//   { c: [cx, cy, r] }                   circle
//   { e: [cx, cy, rx, ry, rotate?] }     ellipse
//   { r: [x, y, w, h, radius] }          rounded rect
//   { d: 'svg path' }                    path (add evenodd: true for holes, like a donut)
// face: where the cute face goes ({ x, y, s: scale, pixel?: square eyes }), or null.
// decor: extra details drawn on top (see ShapeDecor in SquishyView.jsx).
// attach: where a keychain / clip / necklace connects (top of the shape).
// label: where printed words go ([x, y, width, max font size]); default is just under the face.
export const SHAPES = [
  {
    id: 'dumpling', attach: [130, 66], label: [130, 116, 150, 28], name: 'Dumpling',
    parts: [{ d: 'M28 182C28 112 78 66 130 66s102 46 102 116c0 26-46 36-102 36S28 208 28 182z' }],
    face: { x: 130, y: 166, s: 1 }, decor: 'pleats',
  },
  { id: 'cube', attach: [130, 52], name: 'Cube', parts: [{ r: [48, 52, 164, 164, 42] }], face: { x: 130, y: 142, s: 1 } },
  { id: 'ball', attach: [130, 42], name: 'Ball', parts: [{ c: [130, 136, 94] }], face: { x: 130, y: 146, s: 1 } },
  {
    id: 'jellyfish', attach: [130, 40], label: [130, 70, 110, 24], name: 'Jellyfish',
    parts: [{ d: 'M36 150C36 84 80 40 130 40s94 44 94 110c-12 12-24 12-36 0-12 12-24 12-36 0-12 12-32 12-44 0-12 12-24 12-36 0-12 12-24 12-36 0z' }],
    face: { x: 130, y: 112, s: 0.9 }, decor: 'tentacles',
  },
  {
    id: 'blocky-buddy', attach: [130, 30], label: [130, 160, 80, 22], name: 'Blocky Buddy',
    parts: [
      { r: [70, 30, 120, 104, 8] }, { r: [86, 130, 88, 66, 6] },
      { r: [54, 136, 34, 50, 6] }, { r: [172, 136, 34, 50, 6] },
      { r: [90, 192, 34, 36, 4] }, { r: [136, 192, 34, 36, 4] },
    ],
    face: { x: 130, y: 86, s: 0.9, pixel: true },
  },
  {
    id: 'axolotl', attach: [130, 72], label: [130, 194, 120, 26], name: 'Axolotl',
    parts: [{ e: [130, 146, 94, 74] }, { e: [80, 214, 22, 14] }, { e: [180, 214, 22, 14] }],
    face: { x: 130, y: 150, s: 1 }, decor: 'gills',
  },
  {
    id: 'butter', attach: [130, 98], label: [134, 140, 160, 22], name: 'Butter',
    parts: [{ d: 'M14 124L38 98H246V186L222 212H14Z' }],
    face: { x: 118, y: 168, s: 0.85 }, decor: 'butterEdges',
  },
  { id: 'rectangle', attach: [130, 64], name: 'Rectangle', parts: [{ r: [18, 64, 224, 152, 30] }], face: { x: 130, y: 144, s: 1 } },
  {
    id: 'heart', attach: [130, 78], label: [130, 168, 96, 22], name: 'Heart',
    parts: [{ d: 'M130 226C130 226 26 162 26 96a54 54 0 01104-20 54 54 0 01104 20c0 66-104 130-104 130z' }],
    face: { x: 130, y: 128, s: 0.9 },
  },
  {
    id: 'bread', attach: [130, 58], name: 'Bread',
    parts: [{ d: 'M36 204V132C36 88 64 70 96 76c10-22 58-22 68 0 32-6 60 12 60 56v72q0 16-16 16H52q-16 0-16-16z' }],
    face: { x: 130, y: 156, s: 1 }, decor: 'crust',
  },
  {
    id: 'star', attach: [130, 28], label: [130, 182, 80, 22], name: 'Star',
    parts: [{ d: 'M130 26L159 92L230 99L176 146L192 216L130 179L68 216L84 146L30 99L101 92Z' }],
    face: { x: 130, y: 142, s: 0.75 },
  },
  {
    id: 'pillow-pal', attach: [130, 72], name: 'Pillow Pal',
    parts: [{ d: 'M40 58Q130 84 220 58Q196 140 220 222Q130 196 40 222Q64 140 40 58Z' }],
    face: { x: 130, y: 144, s: 1 },
  },
  {
    id: 'puppy', attach: [130, 64], label: [130, 192, 108, 22], name: 'Puppy',
    parts: [{ c: [130, 144, 80] }, { e: [44, 150, 26, 50, 22] }, { e: [216, 150, 26, 50, -22] }],
    face: { x: 130, y: 150, s: 1 }, decor: 'snout',
  },
  {
    id: 'paw-print', attach: [130, 112], label: [130, 146, 110, 22], name: 'Paw Print',
    parts: [{ e: [130, 170, 74, 58] }, { c: [60, 98, 27] }, { c: [104, 64, 27] }, { c: [156, 64, 27] }, { c: [200, 98, 27] }],
    face: { x: 130, y: 174, s: 0.75 },
  },
  {
    id: 'kitty', attach: [130, 74], label: [130, 198, 118, 24], name: 'Kitty',
    parts: [{ e: [130, 150, 94, 76] }, { d: 'M48 118L58 38L114 82Z' }, { d: 'M212 118L202 38L146 82Z' }],
    face: { x: 130, y: 154, s: 1 }, decor: 'whiskers',
  },
  {
    id: 'gummy-bear', attach: [130, 22], label: [130, 160, 84, 22], name: 'Gummy Bear',
    parts: [
      { c: [88, 40, 20] }, { c: [172, 40, 20] }, { c: [130, 76, 54] }, { e: [130, 170, 66, 58] },
      { e: [70, 150, 20, 32, -30] }, { e: [190, 150, 20, 32, 30] }, { c: [94, 222, 26] }, { c: [166, 222, 26] },
    ],
    face: { x: 130, y: 82, s: 0.62 },
  },
  {
    id: 'diamond', attach: [130, 40], label: [130, 72, 150, 24], name: 'Diamond',
    parts: [{ d: 'M72 40H188L236 98L130 232L24 98Z' }],
    face: { x: 130, y: 126, s: 0.75 }, decor: 'facets',
  },
  {
    id: 'donut', attach: [130, 38], label: [130, 72, 120, 26], name: 'Donut',
    parts: [{ d: 'M28 140a102 102 0 1 0 204 0a102 102 0 1 0 -204 0ZM96 140a34 34 0 1 0 68 0a34 34 0 1 0 -68 0Z', evenodd: true }],
    face: { x: 130, y: 207, s: 0.55 }, decor: 'icing',
  },
  {
    id: 'boba', attach: [130, 52], label: [130, 118, 100, 24], name: 'Boba',
    parts: [{ d: 'M66 96H194L181 234Q179 246 167 246H93Q81 246 79 234Z' }, { r: [56, 78, 148, 24, 12] }, { d: 'M68 82Q130 22 192 82Z' }],
    face: { x: 130, y: 156, s: 0.8 }, decor: 'boba',
  },
  {
    id: 'gumdrop', attach: [130, 52], name: 'Gumdrop',
    parts: [{ d: 'M34 216C34 130 72 52 130 52s96 78 96 164c0 10-34 16-96 16S34 226 34 216z' }],
    face: { x: 130, y: 166, s: 0.9 }, decor: 'sugarCoat',
  },
  {
    // A big gooey splat (like a spoonful dropped on the table) with a few drops around it.
    id: 'spoon-splat', attach: [130, 50], label: [130, 186, 108, 22], name: 'Spoon Splat',
    parts: [
      { d: 'M117 64Q130 48 144 62Q157 75 172 78Q188 80 189 96Q189 111 213 118Q236 125 224 140Q211 155 211 170Q211 184 194 188Q176 191 170 210Q165 228 147 220Q130 212 115 214Q100 216 93 202Q87 188 63 189Q38 190 44 172Q51 155 45 141Q39 128 54 119Q69 111 68 92Q67 74 86 77Q105 79 117 64Z' },
      { c: [30, 92, 9] }, { c: [232, 212, 8] }, { c: [222, 66, 6] },
    ],
    face: { x: 130, y: 146, s: 0.85 },
  },
]

export const shapeById = (id) => SHAPES.find((s) => s.id === id) ?? SHAPES[0]
