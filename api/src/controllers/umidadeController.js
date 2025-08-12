const umidadeService = require('../services/umidadeService');
const serialportService = require('../services/serialportService');

exports.getUmidade = (req, res) => {
  res.json(umidadeService.getUltimoValor());
};

exports.setUmidade = (req, res) => {
  const { umidade, temperatura } = req.body;
  if (umidade !== undefined && temperatura !== undefined) {
    umidadeService.setUltimoValor({ umidade, temperatura });
    res.status(200).send('Valores atualizados com sucesso!');
  } else {
    res.status(400).send('Umidade e temperatura são obrigatórios.');
  }
};

exports.setRelayState = (req, res) => {
  const { state } = req.body; // 'on' or 'off'
  if (state === 'on') {
    serialportService.turnRelayOn();
    res.status(200).send('Comando para ligar relé enviado.');
  } else if (state === 'off') {
    serialportService.turnRelayOff();
    res.status(200).send('Comando para desligar relé enviado.');
  } else {
    res.status(400).send('Estado do relé inválido. Use "on" ou "off".');
  }
};
