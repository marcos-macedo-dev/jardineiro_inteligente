require('dotenv').config();
require('./services/serialportService');
const app = require('./app');
const websocketService = require('./services/websocketService');

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

websocketService.init(server);