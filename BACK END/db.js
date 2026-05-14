const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Erro ao abrir banco', err.message);
    } else {
        console.log('SQLite conectado');
    }
});

module.exports = db;

db.run(`
  CREATE TABLE IF NOT EXISTS locais (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT NOT NULL,
  nome TEXT NOT NULL,
  localizacao TEXT NOT NULL,
  descricao TEXT NOT NULL,
  imagem_url TEXT NOT NULL,
  visitas INTEGER NOT NULL,
  dificuldade TEXT NOT NULL,
  duracao TEXT NOT NULL,
  preco TEXT NOT NULL
)
`);


db.run(`
  CREATE TABLE IF NOT EXISTS features (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT NOT NULL,
  valor TEXT NOT NULL
)
`);


db.run(`
  CREATE TABLE IF NOT EXISTS locais_features (
  locais_id INTEGER NOT NULL,
  feature_id INTEGER NOT NULL,
  FOREIGN KEY (locais_id) REFERENCES locais(id),
  FOREIGN KEY (feature_id) REFERENCES features(id)
)
`);

db.run(`
  CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email_hash TEXT NOT NULL UNIQUE,
  email_encrypted TEXT NOT NULL,
  login TEXT NOT NULL UNIQUE,
  telefone_encrypted TEXT,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin','user')) DEFAULT 'user',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

