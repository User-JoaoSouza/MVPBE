const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const db = require('./db');
const { encrypt, decrypt } = require('./Crypt');
const { hashPassword, comparePassword } = require('./Auth_Backend');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/teste', (req, res) => {
    res.json({ mensagem: 'Backend funcionando' });
});

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});


//Cria locais

app.post('/locais', (req, res) => {
    const { nome, tipo, localizacao, descricao, imagem_url, visitas } = req.body;

    const sql = `
    INSERT INTO locais (nome, tipo, localizacao, descricao, imagem_url, visitas)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

    db.run(sql, [nome, tipo, localizacao, descricao, imagem_url, visitas], function (err) {
        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            id: this.lastID,
            nome,
            tipo,
            localizacao,
            descricao,
            imagem_url,
            visitas
        });
    });
});

//Cria features
app.post('/features', (req, res) => {
    const { tipo, valor } = req.body;

    if (!tipo || !valor) {
        return res.status(400).json({
            erro: 'tipo e valor sao obrigatórios'
        });
    }

    const sql = 'INSERT INTO features (tipo, valor) VALUES (?, ?)';

    db.run(sql, [tipo, valor], function (err) {
        if (err) {
            return res.status(500).json(err);
        }

        res.status(201).json({
            id: this.lastID,
            tipo,
            valor
        });
    });
});


// Associa feature a trilha
app.post('/locais_features', (req, res) => {
    const { locais_id, feature_id } = req.body;

    if (!locais_id || !feature_id) {
        return res.status(400).json({
            erro: 'locais_id e feature_id são obrigatórios'
        });
    }

    const sql = `
        INSERT INTO locais_features (locais_id, feature_id)
        VALUES (?, ?)
    `;

    db.run(sql, [locais_id, feature_id], function (err) {
        if (err) {
            return res.status(500).json(err);
        }

        res.status(201).json({
            locais_id,
            feature_id
        });
    });
});

//Traz as informações de todas os locais
app.get('/locais', (req, res) => {
    const sql = `
    SELECT
      t.id AS locais_id,
      t.tipo AS tipo_local,
      t.nome,
      t.localizacao,
      t.descricao,
      t.imagem_url,
      t.visitas,
      f.tipo,
      f.valor
    FROM locais t
    LEFT JOIN locais_features tf ON tf.locais_id = t.id
    LEFT JOIN features f ON f.id = tf.feature_id
    ORDER BY t.id
  `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json(err);
        }

        const locaisMap = {};

        rows.forEach(row => {
            if (!locaisMap[row.locais_id]) {
                locaisMap[row.locais_id] = {
                    id: row.locais_id,
                    nome: row.nome,
                    tipo: row.tipo_local,
                    localizacao: row.localizacao,
                    descricao: row.descricao,
                    imagem_url: row.imagem_url,
                    visitas: row.visitas,
                    features: []
                };
            }

            if (row.tipo) {
                locaisMap[row.locais_id].features.push({
                    tipo: row.tipo,
                    valor: row.valor
                });
            }
        });

        res.json(Object.values(locaisMap));
    });
});

//Traz informações das cachoeiras
app.get('/locais/cachoeiras', (req, res) => {
    const { id } = req.params;

    const sql = `
    SELECT
      t.id AS locais_id,
      t.nome,
      t.tipo AS locais_tipo,
      t.localizacao,
      t.descricao,
      t.imagem_url,
      t.visitas,
      f.tipo,
      f.valor
    FROM locais t
    LEFT JOIN locais_features tf ON tf.locais_id = t.id
    LEFT JOIN features f ON f.id = tf.feature_id
    WHERE t.tipo = 'cachoeira'
  `;

    db.all(sql, [id], (err, rows) => {
        if (err) {
            return res.status(500).json(err);
        }

        // se não tiver nada no banco
        if (rows.length === 0) {
            return res.json([]);
        }

        const locaisMap = {};

        rows.forEach(row => {
            if (!locaisMap[row.locais_id]) {
                locaisMap[row.locais_id] = {
                    id: row.locais_id,
                    nome: row.nome,
                    tipo: row.tipo_local,
                    localizacao: row.localizacao,
                    descricao: row.descricao,
                    imagem_url: row.imagem_url,
                    visitas: row.visitas,
                    features: []
                };
            }

            if (row.tipo) {
                locaisMap[row.locais_id].features.push({
                    tipo: row.tipo,
                    valor: row.valor
                });
            }
        });


        res.json(Object.values(locaisMap));
    });
});


//Traz informações da trilhas
app.get('/locais/trilhas', (req, res) => {
    const { id } = req.params;

    const sql = `
    SELECT
      t.id AS locais_id,
      t.nome,
      t.tipo AS locais_tipo,
      t.localizacao,
      t.descricao,
      t.imagem_url,
      t.visitas,
      f.tipo,
      f.valor
    FROM locais t
    LEFT JOIN locais_features tf ON tf.locais_id = t.id
    LEFT JOIN features f ON f.id = tf.feature_id
    WHERE t.tipo = 'trilha'
  `;

    db.all(sql, [id], (err, rows) => {
        if (err) {
            return res.status(500).json(err);
        }

        // se não tiver nada no banco
        if (rows.length === 0) {
            return res.json([]);
        }

        const locaisMap = {};

        rows.forEach(row => {
            if (!locaisMap[row.locais_id]) {
                locaisMap[row.locais_id] = {
                    id: row.locais_id,
                    nome: row.nome,
                    tipo: row.tipo_local,
                    localizacao: row.localizacao,
                    descricao: row.descricao,
                    imagem_url: row.imagem_url,
                    visitas: row.visitas,
                    features: []
                };
            }

            if (row.tipo) {
                locaisMap[row.locais_id].features.push({
                    tipo: row.tipo,
                    valor: row.valor
                });
            }
        });


        res.json(Object.values(locaisMap));
    });
});


//Traz informações dos locais por ID
app.get('/locais/:id', (req, res) => {
    const { id } = req.params;

    const sql = `
    SELECT
      t.id AS locais_id,
      t.nome,
      t.tipo AS locais_tipo,
      t.localizacao,
      t.descricao,
      t.imagem_url,
      t.visitas,
      f.tipo,
      f.valor
    FROM locais t
    LEFT JOIN locais_features tf ON tf.locais_id = t.id
    LEFT JOIN features f ON f.id = tf.feature_id
    WHERE t.id = ?
  `;

    db.all(sql, [id], (err, rows) => {
        if (err) {
            return res.status(500).json(err);
        }

        // se não tiver nada no banco
        if (rows.length === 0) {
            return res.json([]);
        }

        // monta o objeto final
        const locais = {
            id: rows[0].locais_id,
            nome: rows[0].nome,
            tipo: rows[0].locais_tipo,
            localizacao: rows[0].localizacao,
            descricao: rows[0].descricao,
            imagem_url: rows[0].imagem_url,
            visitas: rows[0].visitas,
            features: []
        };

        rows.forEach(row => {
            if (row.tipo) {
                locais.features.push({
                    tipo: row.tipo,
                    valor: row.valor
                });
            }
        });

        res.json(locais);
    });
});





// Listar todas as features
app.get('/features', (req, res) => {
    const sql = 'SELECT * FROM features';

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json(rows);
    });
});

//deleta informação das 3 tabelas, util para testes
app.delete('/resetcompleto', (req, res) => {

    db.serialize(() => {

        db.run('DELETE FROM locais_features');
        db.run('DELETE FROM locais');
        db.run('DELETE FROM features');
        db.run('DELETE FROM usuarios');

        db.run('DELETE FROM sqlite_sequence WHERE name="locais"');
        db.run('DELETE FROM sqlite_sequence WHERE name="locais_features"');
        db.run('DELETE FROM sqlite_sequence WHERE name="features"');
        db.run('DELETE FROM sqlite_sequence WHERE name="usuarios"');
    });

    res.json({
        mensagem: 'Banco resetado completamente'
    });
});

// Rota de Registro (Cadastro)
app.post('/auth/register', async (req, res) => {
    // 1. Pegamos a role do body. Se não vier nada, definimos como 'user'
    const { nome, email, login, senha, telefone, role } = req.body;
    const userRole = role || 'user';

    try {
        const emailEncrypted = encrypt(email);
        const emailHash = crypto.createHash('sha256').update(email).digest('hex');
        const telEncrypted = telefone ? encrypt(telefone) : null;
        const passwordHash = await hashPassword(senha);

        const sql = `INSERT INTO usuarios (nome, email_hash, email_encrypted, login, telefone_encrypted, password_hash, role) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;

        // 2. Substituímos o 'user' fixo pela variável userRole
        db.run(sql, [nome, emailHash, emailEncrypted, login, telEncrypted, passwordHash, userRole], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: "Login ou Email já cadastrado!" });
                }
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, id: this.lastID, role: userRole });
        });
    } catch (err) {
        res.status(500).json({ error: "Erro ao processar cadastro" });
    }
});

//Faz login
// Rota de Login Corrigida
app.post('/auth/login', async (req, res) => {
    const { loginOrEmail, senha } = req.body;

    // Gerar o hash do email para busca (se você salvou assim no db.js)
    const emailHash = crypto.createHash('sha256').update(loginOrEmail).digest('hex');

    const sql = `SELECT * FROM usuarios WHERE login = ? OR email_hash = ?`;

    db.get(sql, [loginOrEmail, emailHash], async (err, user) => {
        if (err) {
            console.error("ERRO DETALHADO DO SQLITE:", err.message); // Isso vai aparecer no seu terminal
            return res.status(500).json({ error: err.message });     // Isso vai aparecer no Postman
        }
        if (!user) return res.status(401).json({ success: false, message: "Usuário não encontrado" });

        // Compara a senha digitada com o hash salvo no banco
        console.log(" Usuário encontrado:", user.login);
        console.log(" Senha digitada (texto puro):", senha);
        console.log(" Hash salvo no banco:", user.password_hash);

        const valid = await comparePassword(senha, user.password_hash);
        console.log(" Resultado da comparação:", valid);

        if (valid) {
            res.json({ success: true, user: { nome: user.nome, role: user.role } });
        } else {
            res.status(401).json({ success: false, message: "Senha incorreta" });
        }
    });
});


app.get('/debug/users', (req, res) => {
    // O '*' seleciona todas as colunas definidas no seu CREATE TABLE
    const sql = `SELECT * FROM usuarios`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar usuários:", err.message);
            return res.status(500).json({ error: err.message });
        }

        // Retorna a lista completa para o Postman
        res.json(rows);
    });
});