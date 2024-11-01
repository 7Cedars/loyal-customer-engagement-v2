// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
export function getRandomBigInt(max: number) {
  return BigInt(Math.floor(Math.random() * max));
}
