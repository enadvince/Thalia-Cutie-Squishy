// Parent gate: a 3-second hold, then a multiplication problem written in words
// ("What is twenty-three times four?"), new every time. Hard for a 10-year-old, easy for a grown-up.
export const HOLD_SECONDS = 3

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

export function numberWords(n) {
  if (n < 20) return ONES[n]
  const tens = TENS[Math.floor(n / 10)]
  return n % 10 ? `${tens}-${ONES[n % 10]}` : tens
}

// A two-digit number (not a round ten or an easy eleven-multiple) times 3–9.
export function makeProblem(rand = Math.random) {
  let a
  do a = 13 + Math.floor(rand() * 85) // 13–97
  while (a % 10 === 0 || a % 11 === 0)
  const b = 3 + Math.floor(rand() * 7) // 3–9
  return { question: `What is ${numberWords(a)} times ${numberWords(b)}?`, answer: a * b }
}
