const servicoSerial = require('./serialportService');

// Variável que armazena o último valor de umidade, temperatura e umidade do ar
let ultimoValor = { umidade: 0, temperatura: 0, umidadeAr: 0 };
// Variável que controla o estado do relé (ligado/desligado)
let releLigado = false;

// Limites de umidade para ligar e desligar o relé
const UMIDADE_MINIMA_LIGAR_RELE = 30; // Se a umidade for menor que esse valor, o relé liga
const UMIDADE_MAXIMA_DESLIGAR_RELE = 60; // Se a umidade for maior que esse valor, o relé desliga

// Função que retorna o último valor de umidade, temperatura e umidade do ar
exports.obterUltimoValor = () => ultimoValor;

// Função que define o último valor de umidade, temperatura e umidade do ar
exports.definirUltimoValor = (novoValor) => {
  ultimoValor = { ...ultimoValor, ...novoValor };

  // Lógica para ligar e desligar o relé automaticamente
  if (ultimoValor.umidade < UMIDADE_MINIMA_LIGAR_RELE && !releLigado) {
    servicoSerial.ligarRele();
    releLigado = true;
    console.log('Umidade baixa, ligando o relé.');
  } else if (ultimoValor.umidade >= UMIDADE_MAXIMA_DESLIGAR_RELE && releLigado) {
    servicoSerial.desligarRele();
    releLigado = false;
    console.log('Umidade suficiente, desligando o relé.');
  }
};