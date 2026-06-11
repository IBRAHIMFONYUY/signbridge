/**
 * Maps English words → gesture identifiers recognized by the avatar.
 * Covers common ASL-inspired gestures plus sensible fallbacks.
 */

export const WORD_TO_GESTURE: Record<string, string> = {
  // Greetings
  hello: "HELLO",
  hi: "HELLO",
  hey: "HELLO",
  greetings: "HELLO",
  howdy: "HELLO",
  goodbye: "HELLO",
  bye: "HELLO",
  wave: "HELLO",

  // Affirmations
  yes: "YES",
  yeah: "YES",
  yep: "YES",
  yup: "YES",
  ok: "YES",
  okay: "YES",
  sure: "YES",
  correct: "YES",
  right: "YES",
  alright: "YES",

  // Negation
  no: "I",
  nope: "I",
  not: "I",
  never: "I",
  none: "I",

  // Help / point
  help: "HELP",
  point: "HELP",
  look: "HELP",
  see: "HELP",
  watch: "HELP",
  there: "HELP",
  this: "HELP",
  that: "HELP",
  you: "HELP",
  your: "HELP",

  // Peace / 2
  peace: "PEACE",
  two: "PEACE",
  second: "PEACE",
  please: "PEACE",
  sign: "PEACE",

  // Thumbs up / good
  good: "GOOD",
  great: "GOOD",
  awesome: "GOOD",
  excellent: "GOOD",
  perfect: "GOOD",
  nice: "GOOD",
  fine: "GOOD",
  wonderful: "GOOD",
  fantastic: "GOOD",
  up: "GOOD",
  thumbs: "GOOD",

  // Love / ILY
  love: "LOVE",
  adore: "LOVE",
  ily: "LOVE",
  care: "LOVE",

  // Call me / shaka
  call: "CALL",
  phone: "CALL",
  text: "CALL",
  hang: "CALL",

  // Numbers
  one: "HELP", // point
  three: "THREE",
  four: "FOUR",
  five: "HELLO", // open hand

  // I / me
  i: "I",
  me: "I",
  my: "I",
  mine: "I",
  myself: "I",

  // Thanks
  thank: "HELLO",
  thanks: "HELLO",

  // Sorry / fist
  sorry: "YES",
  apologize: "YES",

  // How / what / etc (help gesture)
  how: "HELP",
  what: "HELP",
  where: "HELP",
  when: "HELP",
  who: "HELP",
  why: "HELP",

  // Common fillers → open hand / HELLO
  are: "HELLO",
  we: "HELLO",
  today: "HELLO",
  can: "HELLO",
  would: "HELLO",
  could: "HELLO",
};

const FALLBACK: string[] = ["HELLO", "HELP", "GOOD", "PEACE"];

/**
 * Convert a free-form sentence to an ordered list of gesture keys.
 * Consecutive duplicates are removed for natural flow.
 */
export function textToGestureSequence(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s']/g, "")
    .split(/\s+/)
    .filter(Boolean);

  const gestures = words.map(
    (w) => WORD_TO_GESTURE[w] ?? FALLBACK[w.charCodeAt(0) % FALLBACK.length]
  );

  // De-duplicate consecutive same gestures
  return gestures.filter((g, i) => i === 0 || g !== gestures[i - 1]);
}

/** Human-readable label for a gesture key */
export const GESTURE_DISPLAY_LABELS: Record<string, string> = {
  HELLO: "Hello / Open Hand",
  YES: "Yes / Fist",
  HELP: "Point / Help",
  PEACE: "Peace / 2",
  GOOD: "Thumbs Up / Good",
  LOVE: "ILY / Love",
  CALL: "Call Me",
  I: "Letter I / Pinky",
  THREE: "Three",
  FOUR: "Four",
};

export function gestureToLabel(g: string): string {
  return GESTURE_DISPLAY_LABELS[g] ?? g;
}
