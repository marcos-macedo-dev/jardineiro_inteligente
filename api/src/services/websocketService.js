const { WebSocketServer } = require('ws');
const umidadeService = require('./umidadeService');

let wss;

// Função que inicia o servidor WebSocket
exports.iniciar = (servidor) => {
  wss = new WebSocketServer({ server: servidor });

  // Evento disparado quando um cliente se conecta ao servidor WebSocket
  wss.on('connection', (ws) => {
    console.log('Cliente WebSocket conectado');
    // Envia o último valor de umidade para o cliente que acabou de se conectar
    ws.send(JSON.stringify(umidadeService.obterUltimoValor()));

    // Evento disparado quando um cliente se desconecta
    ws.on('close', () => {
      console.log('Cliente WebSocket desconectado');
    });

    // Evento disparado quando ocorre um erro no cliente WebSocket
    ws.on('error', (error) => {
      console.error('Erro no cliente WebSocket:', error);
    });
  });
};

// Função que transmite os dados para todos os clientes conectados
exports.transmitir = (dados) => {
  if (!wss) return;
  console.log('Transmitindo dados via WebSocket:', dados);

  wss.clients.forEach((cliente) => {
    if (cliente.readyState === 1) { // 1 = OPEN (Conexão aberta)
      cliente.send(JSON.stringify(dados));
    }
  });
};
