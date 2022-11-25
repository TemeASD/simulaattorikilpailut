exports.padZero = function (string) {
  if (string.length < 2) {
    return `0${string}`
  }
  else return string
}

exports.simNameNormalizer = function (simulator) {
  switch (simulator.toLowerCase()) {
    //Assetto Corsa
    case "assetto corsa":
      return "AC";
    case "assettocorsa":
      return "AC";
    case "assetto-corsa":
      return "AC";
    //Assetto Corsa Competizione
    case "assetto corsa competizione":
      return "ACC";
    case "assettocorsa competizione":
      return "ACC";
    case "assetto-corsa-competizione":
      return "ACC";
    //Automobilista
    case "ams":
      return "Automobilista";
    //Automobilista 2
    case "ams2":
      return "Automobilista 2";
    case "ams 2":
      return "Automobilista 2";
    case "automobilista2":
      return "Automobilista 2";
    // Dirt Rally 2.0
    case "dr2":
      return "Dirt Rally 2.0";
    case "dirtrally2":
      return "Dirt Rally 2.0";
    case "dirtrally2.0":
      return "Dirt Rally 2.0";
    case "dirt rally 2":
      return "Dirt Rally 2.0";
    default:
      return simulator;
  }
}

console.log(this.simNameNormalizer("assetto corsa"))