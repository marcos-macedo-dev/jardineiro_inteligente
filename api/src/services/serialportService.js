const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const umidadeService = require('./umidadeService');
const websocketService = require('./websocketService');

const port = new SerialPort({
  path: '/dev/ttyUSB0',
  baudRate: 115200,
});

port.on('open', () => {
  console.log('Arduino conectado na porta serial.');
});

port.on('error', (err) => {
  console.error('Erro na porta serial:', err.message);
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

parser.on('data', (line) => {
  console.log('Dados brutos da serial:', line);
  line = line.trim();
  const ultimoValor = umidadeService.getUltimoValor();
  let novoValor = { ...ultimoValor };

  if (line.includes('Umidade do solo:')) {
    try {
      const percentual = parseInt(line.split(':')[1].replace('%', '').trim());
      if (!isNaN(percentual) && percentual !== ultimoValor.umidade) {
        novoValor.umidade = percentual;
        umidadeService.setUltimoValor(novoValor);
        console.log('Nova umidade:', percentual);
        websocketService.broadcast(novoValor);
      }
    } catch (error) {
      console.error('Erro ao processar linha da serial (umidade):', error);
    }
  } else if (line.includes('Temperatura:')) {
    try {
      const temperatura = parseFloat(line.split(':')[1].replace('C', '').trim());
      if (!isNaN(temperatura) && temperatura !== ultimoValor.temperatura) {
        novoValor.temperatura = temperatura;
        umidadeService.setUltimoValor(novoValor);
        console.log('Nova temperatura:', temperatura);
        websocketService.broadcast(novoValor);
      }
    } catch (error) {
      console.error('Erro ao processar linha da serial (temperatura):', error);
    }
  } else if (line.includes('Umidade do ar:')) { // Add this block
    try {
      const umidadeAr = parseInt(line.split(':')[1].replace('%', '').trim());
      if (!isNaN(umidadeAr) && umidadeAr !== ultimoValor.umidadeAr) { // Assuming umidadeAr will be a new field in ultimoValor
        novoValor.umidadeAr = umidadeAr;
        umidadeService.setUltimoValor(novoValor);
        console.log('Nova umidade do ar:', umidadeAr);
        websocketService.broadcast(novoValor);
      }
    } catch (error) {
      console.error('Erro ao processar linha da serial (umidade do ar):', error);
    }
  }
});

exports.turnRelayOn = () => {
  if (port.isOpen) {
    port.write('RELAY_ON\n', (err) => {
      if (err) {
        return console.error('Erro ao escrever na porta serial (RELAY_ON):', err.message);
      }
      console.log('Comando RELAY_ON enviado para o Arduino.');
    });
  } else {
    console.warn('Porta serial não está aberta para enviar RELAY_ON.');
  }
};

exports.turnRelayOff = () => {
  if (port.isOpen) {
    port.write('RELAY_OFF\n', (err) => {
      if (err) {
        return console.error('Erro ao escrever na porta serial (RELAY_OFF):', err.message);
      }
      console.log('Comando RELAY_OFF enviado para o Arduino.');
    });
  } else {
    console.warn('Porta serial não está aberta para enviar RELAY_OFF.');
  }
};
