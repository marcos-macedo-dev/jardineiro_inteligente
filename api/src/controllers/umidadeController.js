const umidadeService = require('../services/umidadeService');
const servicoSerial = require('../services/serialportService');

// Função que obtém o último valor de umidade, temperatura e umidade do ar
exports.obterUmidade = (req, res) => {
  res.json(umidadeService.obterUltimoValor());
};

// Função que define um novo valor de umidade e temperatura
exports.definirUmidade = (req, res) => {
  const { umidade, temperatura } = req.body;
  if (umidade !== undefined && temperatura !== undefined) {
    umidadeService.definirUltimoValor({ umidade, temperatura });
    res.status(200).send('Valores atualizados com sucesso!');
  } else {
    res.status(400).send('Umidade e temperatura são obrigatórios.');
  }
};

exports.definirEstadoRele = async (req, res) => {
  const { estado } = req.body;

  if (!estado || (estado.trim() !== 'ligar' && estado.trim() !== 'desligar')) {
    return res.status(400).send('Estado do relé inválido. Use "ligar" ou "desligar".');
  }

  try {
    if (estado.trim() === 'ligar') {
      await servicoSerial.ligarRele();
      res.status(200).send('Comando para ligar o relé enviado com sucesso.');
    } else {
      await servicoSerial.desligarRele();
      res.status(200).send('Comando para desligar o relé enviado com sucesso.');
    }
  } catch (error) {
    // O erro da camada de serviço (serialport) agora é propagado para o cliente.
    console.error('Falha ao executar comando no relé:', error.message);
    res.status(500).send(`Falha ao comunicar com o dispositivo: ${error.message}`);
  }
};

exports.definirModoAutomatico = async (req, res) => {
  try {
    await servicoSerial.ativarModoAutomatico();
    res.status(200).send('Comando para reativar o modo automático enviado com sucesso.');
  } catch (error) {
    console.error('Falha ao ativar modo automático:', error.message);
    res.status(500).send(`Falha ao comunicar com o dispositivo: ${error.message}`);
  }
};
