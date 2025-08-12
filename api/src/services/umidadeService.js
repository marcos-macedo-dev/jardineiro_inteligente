const serialportService = require('./serialportService'); // Import serialportService

let ultimoValor = { umidade: 0, temperatura: 0, umidadeAr: 0 };
let isRelayOn = false; // Track relay state

// Define thresholds (adjust as needed)
const UMIDADE_MINIMA_PARA_LIGAR_RELE = 30; // If humidity drops below this, turn relay ON
const UMIDADE_MAXIMA_PARA_DESLIGAR_RELE = 60; // If humidity goes above this, turn relay OFF

exports.getUltimoValor = () => ultimoValor;

exports.setUltimoValor = (novoValor) => {
  ultimoValor = { ...ultimoValor, ...novoValor };

  // Automatic watering logic
  if (ultimoValor.umidade < UMIDADE_MINIMA_PARA_LIGAR_RELE && !isRelayOn) {
    serialportService.turnRelayOn();
    isRelayOn = true;
    console.log('Umidade muito baixa. Relé LIGADO para regar.');
  } else if (ultimoValor.umidade >= UMIDADE_MAXIMA_PARA_DESLIGAR_RELE && isRelayOn) {
    serialportService.turnRelayOff();
    isRelayOn = false;
    console.log('Umidade suficiente. Relé DESLIGADO.');
  }
};