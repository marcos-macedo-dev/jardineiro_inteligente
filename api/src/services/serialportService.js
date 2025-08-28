const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const umidadeService = require('./umidadeService');
const websocketService = require('./websocketService');

// Configuração da porta serial
const porta = new SerialPort({
  path: '/dev/ttyUSB0', // Caminho para a porta serial do Arduino
  baudRate: 115200, // Taxa de transmissão de dados
});

// Evento disparado quando a porta serial é aberta
porta.on('open', () => {
  console.log('Arduino conectado na porta serial.');
});

// Evento disparado quando ocorre um erro na porta serial
porta.on('error', (err) => {
  console.error('Erro na porta serial:', err.message);
});

// Parser para ler os dados da porta serial linha por linha
const parser = porta.pipe(new ReadlineParser({ delimiter: '\n' }));

// Evento disparado quando chegam novos dados da porta serial
parser.on('data', (linha) => {
  console.log('Dados brutos da serial:', linha);
  linha = linha.trim(); // Remove espaços em branco no início e no fim da linha
  const ultimoValor = umidadeService.obterUltimoValor();
  let novoValor = { ...ultimoValor };

  // Verifica se a linha contém a umidade do solo
  if (linha.includes('Umidade do solo:')) {
    try {
      const percentual = parseInt(linha.split(':')[1].replace('%', '').trim());
      if (!isNaN(percentual) && percentual !== ultimoValor.umidade) {
        novoValor.umidade = percentual;
        umidadeService.definirUltimoValor(novoValor);
        console.log('Nova umidade:', percentual);
        websocketService.transmitir(novoValor);
      }
    } catch (error) {
      console.error('Erro ao processar linha da serial (umidade):', error);
    }
  } else if (linha.includes('Temperatura:')) {
    try {
      const temperatura = parseFloat(linha.split(':')[1].replace('C', '').trim());
      if (!isNaN(temperatura) && temperatura !== ultimoValor.temperatura) {
        novoValor.temperatura = temperatura;
        umidadeService.definirUltimoValor(novoValor);
        console.log('Nova temperatura:', temperatura);
        websocketService.transmitir(novoValor);
      }
    } catch (error) {
      console.error('Erro ao processar linha da serial (temperatura):', error);
    }
  } else if (linha.includes('Umidade do ar:')) { // Adiciona este bloco
    try {
      const umidadeAr = parseInt(linha.split(':')[1].replace('%', '').trim());
      if (!isNaN(umidadeAr) && umidadeAr !== ultimoValor.umidadeAr) { // Assumindo que umidadeAr será um novo campo em ultimoValor
        novoValor.umidadeAr = umidadeAr;
        umidadeService.definirUltimoValor(novoValor);
        console.log('Nova umidade do ar:', umidadeAr);
        websocketService.transmitir(novoValor);
      }
    } catch (error) {
      console.error('Erro ao processar linha da serial (umidade do ar):', error);
    }
  }
});

// Função para ligar o relé
exports.ligarRele = () => {
  return new Promise((resolve, reject) => {
    if (porta.isOpen) {
      porta.write('RELAY_ON\n', (err) => {
        if (err) {
          console.error('Erro ao escrever na porta serial (RELAY_ON):', err.message);
          return reject(new Error('Erro ao escrever na porta serial.'));
        }
        console.log('Comando RELAY_ON enviado para o Arduino.');
        resolve();
      });
    } else {
      console.warn('Porta serial não está aberta para enviar RELAY_ON.');
      reject(new Error('A porta serial não está aberta.'));
    }
  });
};

// Função para desligar o relé
exports.desligarRele = () => {
  return new Promise((resolve, reject) => {
    if (porta.isOpen) {
      porta.write('RELAY_OFF\n', (err) => {
        if (err) {
          console.error('Erro ao escrever na porta serial (RELAY_OFF):', err.message);
          return reject(new Error('Erro ao escrever na porta serial.'));
        }
        console.log('Comando RELAY_OFF enviado para o Arduino.');
        resolve();
      });
    } else {
      console.warn('Porta serial não está aberta para enviar RELAY_OFF.');
      reject(new Error('A porta serial não está aberta.'));
    }
  });
};

// Função para reativar o modo automático
exports.ativarModoAutomatico = () => {
  return new Promise((resolve, reject) => {
    if (porta.isOpen) {
      porta.write('AUTO\n', (err) => {
        if (err) {
          console.error('Erro ao escrever na porta serial (AUTO):', err.message);
          return reject(new Error('Erro ao escrever na porta serial.'));
        }
        console.log('Comando AUTO enviado para o Arduino.');
        resolve();
      });
    } else {
      console.warn('Porta serial não está aberta para enviar AUTO.');
      reject(new Error('A porta serial não está aberta.'));
    }
  });
};




