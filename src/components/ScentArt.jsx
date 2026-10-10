// Little floating scent bubbles, centered on (0,0) in a ~24-unit box.
const ART = {
  watermelon: (
    <>
      <path d="M-8 -2A8 8 0 008 -2Z" fill="#ff6f91" stroke="#5bd350" strokeWidth="2" />
      <circle cx="-3" cy="1" r="0.8" fill="#3b2a4a" />
      <circle cx="0" cy="2.6" r="0.8" fill="#3b2a4a" />
      <circle cx="3" cy="1" r="0.8" fill="#3b2a4a" />
    </>
  ),
  bubble: (
    <>
      <circle r="7" fill="#ff9fd2" fillOpacity="0.5" stroke="#ff7eb6" strokeWidth="1" />
      <circle cx="-2.5" cy="-2.5" r="1.6" fill="#fff" />
    </>
  ),
  strawberry: (
    <>
      <path d="M0 8C-6 4-7-1-5-4c2-2 8-2 10 0 2 3 1 8-5 12z" fill="#ff5a7a" />
      <path d="M-4 -4L0 -7L4 -4L0 -5Z" fill="#5bd350" />
      <circle cx="-2" cy="0" r="0.6" fill="#fff8d6" />
      <circle cx="2" cy="1" r="0.6" fill="#fff8d6" />
      <circle cx="0" cy="4" r="0.6" fill="#fff8d6" />
    </>
  ),
  fizz: (
    <>
      <circle cx="-3" cy="2" r="3.5" fill="#fff" fillOpacity="0.4" stroke="#8a4b2a" strokeWidth="1" />
      <circle cx="3" cy="-3" r="2.5" fill="#fff" fillOpacity="0.4" stroke="#8a4b2a" strokeWidth="1" />
      <circle cx="4" cy="4" r="1.6" fill="#fff" fillOpacity="0.4" stroke="#8a4b2a" strokeWidth="0.8" />
    </>
  ),
  blueberry: (
    <>
      <circle r="6.5" fill="#5b7bea" />
      <path d="M-2 -6L0 -4L2 -6" fill="none" stroke="#3b2a4a" strokeWidth="1" strokeLinecap="round" />
      <circle cx="-2.4" cy="-1" r="1.4" fill="#fff" opacity="0.6" />
    </>
  ),
  blackberry: (
    <>
      {[[-3, -2], [0, -4], [3, -2], [-3, 2], [0, 0], [3, 2], [0, 4]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.4" fill="#4b2a5e" stroke="#7b4fd6" strokeWidth="0.4" />
      ))}
      <path d="M-3 -6L0 -5L3 -6" fill="none" stroke="#5bd350" strokeWidth="1.2" />
    </>
  ),
  raspberry: (
    <>
      {[[-3, -2], [0, -4], [3, -2], [-3, 2], [0, 0], [3, 2], [0, 4]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.4" fill="#e0306b" stroke="#ff9fd2" strokeWidth="0.4" />
      ))}
      <path d="M-3 -6L0 -5L3 -6" fill="none" stroke="#5bd350" strokeWidth="1.2" />
    </>
  ),
  cake: (
    <>
      <path d="M-7 6V-1L5 -5L7 -1V6Z" fill="#f6c48a" />
      <path d="M-7 -1L5 -5L7 -1Z" fill="#fff" />
      <path d="M-7 2H7" stroke="#ff9fd2" strokeWidth="1.6" />
      <circle cx="4" cy="-6" r="1.6" fill="#ff5a7a" />
    </>
  ),
  orangeFizz: (
    <>
      <circle cx="-3" cy="2" r="3.6" fill="#ffb37a" fillOpacity="0.55" stroke="#f37114" strokeWidth="1" />
      <circle cx="3" cy="-3" r="2.6" fill="#ffd8b0" fillOpacity="0.6" stroke="#f37114" strokeWidth="1" />
      <circle cx="4" cy="4" r="1.6" fill="#ffb37a" fillOpacity="0.6" stroke="#f37114" strokeWidth="0.8" />
      <circle cx="-4" cy="0.5" r="1" fill="#fff" />
    </>
  ),
}

export default function ScentArt({ particle }) {
  return ART[particle]
}
