// Soft candy-sky scenery behind the title screen: clouds along the bottom, twinkles, and bubbles that
// drift up slowly (still under reduce motion). Purely decorative and behind everything.
const TWINKLES = [[8, 14, 1], [88, 10, 0.8], [18, 42, 0.6], [80, 36, 0.9], [50, 6, 0.7], [94, 58, 0.6], [4, 66, 0.8]]
const BUBBLES = [[12, 0], [30, 3], [70, 1.5], [86, 4.5], [52, 6]]

export default function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[34%] w-full">
        <path d="M0 62q10-14 22-6 8-14 22-6 10-12 24-2 10-12 22-2 8-4 10 2V100H0z" fill="#fff" opacity="0.55" />
        <path d="M0 78q12-12 26-4 10-10 22-2 12-10 26 0 12-8 26 2V100H0z" fill="#fff" opacity="0.8" />
      </svg>
      {TWINKLES.map(([x, y, s], i) => (
        <svg key={i} viewBox="-10 -10 20 20" className="absolute size-6" style={{ left: `${x}%`, top: `${y}%`, transform: `scale(${s})` }}>
          <path d="M0-8C1-2 2-1 8 0 2 1 1 2 0 8-1 2-2 1-8 0-2-1-1-2 0-8z" fill={['#ffd84d', '#ffffff', '#d4bfff'][i % 3]} opacity="0.85" />
        </svg>
      ))}
      {BUBBLES.map(([x, delay], i) => (
        <span
          key={i}
          className="backdrop-bubble absolute bottom-[-3rem] size-8 rounded-full border-2 border-white/80 bg-white/25"
          style={{ left: `${x}%`, animationDelay: `${delay}s` }}
        />
      ))}
    </div>
  )
}
