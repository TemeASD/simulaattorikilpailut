exports.padZero = function (string) {
  if (string.length < 2) {
    return `0${string}`
  }
  else return string
}
