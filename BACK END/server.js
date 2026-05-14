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

// Middleware rápido para verificar se é admin via header x-user-login
function checkAdmin(req, res, next) {
    const login = req.headers['x-user-login'];
    if (!login) {
        return res.status(401).json({ error: 'Cabeçalho x-user-login ausente' });
    }

    db.get('SELECT role FROM usuarios WHERE login = ?', [login], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
        if (user.role !== 'admin') return res.status(403).json({ error: 'Acesso restrito a administradores' });
        next(); // segue para a rota
    });
}


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

//deleta informação das tabelas, util para testes
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


//dropa  as tabelas, util para testes
app.delete('/dropTabelas', (req, res) => {

    db.serialize(() => {

        db.run('DROP TABLE locais_features');
        db.run('DROP TABLE locais');
        db.run('DROP TABLE features');
        db.run('DROP TABLE usuarios');
    });

    res.json({
        mensagem: 'Banco dropado completamente'
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

// Rota de Login 
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

        const valid = await comparePassword(senha, user.password_hash);

        if (valid) {
            res.json({ success: true, user: { nome: user.nome, role: user.role, login: user.login } });
        } else {
            res.status(401).json({ success: false, message: "Senha incorreta" });
        }
    });
});

//Validar admin
app.get('/auth/me', (req, res) => {
    const login = req.headers['x-user-login'];
    if (!login) return res.status(401).json({ success: false, error: 'Não autorizado' });

    db.get('SELECT nome, role FROM usuarios WHERE login = ?', [login], (err, user) => {
        if (err || !user) return res.status(401).json({ success: false, error: 'Usuário não encontrado' });
        res.json({ success: true, user: { nome: user.nome, login: user.login, role: user.role } });
    });
});

//Promover a Admin
app.patch('/auth/promover', checkAdmin, (req, res) => {
    const { login } = req.body;

    if (!login) return res.status(400).json({ error: 'Login é obrigatório' });

    db.get('SELECT * FROM usuarios WHERE login = ?', [login], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
        if (user.role === 'admin') return res.status(400).json({ error: 'Usuário já é administrador' });

        db.run('UPDATE usuarios SET role = ? WHERE login = ?', ['admin', login], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: `${login} agora é administrador!` });
        });
    });
});

app.patch('/auth/demote', checkAdmin, (req, res) => {
    const { login } = req.body;          // login do usuário a ser rebaixado
    const adminLogin = req.user.login;    // login do admin que está fazendo a requisição

    if (!login) return res.status(400).json({ error: 'Login é obrigatório' });

    if (login === adminLogin) {
        return res.status(400).json({ error: 'Você não pode remover seu próprio acesso de administrador.' });
    }

    db.get('SELECT * FROM usuarios WHERE login = ?', [login], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
        if (user.role !== 'admin') return res.status(400).json({ error: 'O usuário já é comum' });

        db.run('UPDATE usuarios SET role = ? WHERE login = ?', ['user', login], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: `✅ ${login} agora é um usuário comum.` });
        });
    });
});


app.get('/debug/users', checkAdmin, (req, res) => {
    const sql = `SELECT id, nome, login, role, created_at FROM usuarios`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar usuários:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.get('/debug/users/:login', checkAdmin, (req, res) => {
    const { login } = req.params;
    const sql = `SELECT id, nome, login, role, created_at FROM usuarios WHERE login = ?`;
    db.get(sql, [login], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
        res.json(user);
    });
});

// Cria local completo com features vinculadas (transação serializada)
app.post('/locais/completo', checkAdmin, (req, res) => {
    const {
        nome, tipo, localizacao, descricao,
        imagem_url, visitas, dificuldade, duracao, preco,
        features // array de { tipo, valor }
    } = req.body;

    if (!nome || !tipo || !localizacao || !descricao || !dificuldade || !duracao || preco === undefined) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    const sqlLocal = `
        INSERT INTO locais (tipo, nome, localizacao, descricao, imagem_url, visitas, dificuldade, duracao, preco)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.serialize(() => {
        db.run(sqlLocal,
            [tipo, nome, localizacao, descricao, imagem_url || '', visitas || 0, dificuldade, duracao, preco],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });

                const localId = this.lastID;

                // Se não veio nenhuma feature, já retorna
                if (!features || features.length === 0) {
                    return res.status(201).json({ id: localId, nome, features: [] });
                }

                const sqlFeature = 'INSERT INTO features (tipo, valor) VALUES (?, ?)';
                const sqlVinculo = 'INSERT INTO locais_features (locais_id, feature_id) VALUES (?, ?)';
                const featuresCriadas = [];
                let processadas = 0;

                features.forEach(({ tipo: fTipo, valor: fValor }) => {
                    if (!fTipo || !fValor) {
                        processadas++;
                        if (processadas === features.length) {
                            res.status(201).json({ id: localId, nome, features: featuresCriadas });
                        }
                        return;
                    }

                    db.run(sqlFeature, [fTipo, fValor], function (err) {
                        if (err) return res.status(500).json({ error: 'Erro ao criar feature: ' + err.message });

                        const featureId = this.lastID;

                        db.run(sqlVinculo, [localId, featureId], function (err) {
                            if (err) return res.status(500).json({ error: 'Erro ao vincular feature: ' + err.message });

                            featuresCriadas.push({ id: featureId, tipo: fTipo, valor: fValor });
                            processadas++;

                            if (processadas === features.length) {
                                res.status(201).json({ id: localId, nome, features: featuresCriadas });
                            }
                        });
                    });
                });
            }
        );
    });
});