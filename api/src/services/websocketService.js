const { WebSocketServer } = require('ws');
const umidadeService = require('./umidadeService');

let wss;

exports.init = (server) => {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('Cliente WebSocket conectado');
    ws.send(JSON.stringify(umidadeService.getUltimoValor()));

    ws.on('close', () => {
      console.log('Cliente WebSocket desconectado');
    });

    ws.on('error', (error) => {
      console.error('Erro no cliente WebSocket:', error);
    });
  });
};

exports.broadcast = (data) => {
  if (!wss) return;
  console.log('Transmitindo dados via WebSocket:', data);

  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // 1 = OPEN
      client.send(JSON.stringify(data));
    }
  });
};
