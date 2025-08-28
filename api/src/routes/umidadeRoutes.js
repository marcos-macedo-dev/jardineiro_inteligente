const express = require('express');
const router = express.Router();
const umidadeController = require('../controllers/umidadeController');

// Rota para obter o último valor de umidade, temperatura e umidade do ar
router.get('/umidade', umidadeController.obterUmidade);
// Rota para definir um novo valor de umidade and temperatura
router.post('/umidade', umidadeController.definirUmidade);
// Rota para ligar ou desligar o relé
router.post('/rele', umidadeController.definirEstadoRele);
// Rota para reativar o modo automático
router.post('/rele/auto', umidadeController.definirModoAutomatico);

module.exports = router;
