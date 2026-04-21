// Auth_Backend.js
const bcrypt = require('bcrypt');

/**
 * Gera um hash seguro para a senha
 */
async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

/**
 * Compara a senha digitada com o hash do banco
 */
async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

module.exports = { hashPassword, comparePassword };