const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.resolve(__dirname, 'data.db'));

// Cria a tabela se não existir
db.prepare(`
  CREATE TABLE IF NOT EXISTS emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL
  )
`).run();

module.exports = db;
