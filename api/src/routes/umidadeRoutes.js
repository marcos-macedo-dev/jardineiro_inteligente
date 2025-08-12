const express = require('express');
const router = express.Router();
const umidadeController = require('../controllers/umidadeController');

router.get('/umidade', umidadeController.getUmidade);
router.post('/umidade', umidadeController.setUmidade);
router.post('/relay', umidadeController.setRelayState);

module.exports = router;
