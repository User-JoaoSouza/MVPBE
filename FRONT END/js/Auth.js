// --- CONFIGURAÇÕES E ESTADO ---
const API_URL = 'http://localhost:3000';

/**
 * Função principal de login que se comunica com o Servidor
 */
async function login(username, password) {
    try {
        const response = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                loginOrEmail: username,
                senha: password
            })
        });

        const result = await response.json();

        // --- O SEGREDO ESTÁ AQUI ---
        if (result.success && result.user) {
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(result.user));
        }
        // ---------------------------

        return result;
    } catch (error) {
        console.error("Erro na conexão:", error);
        return { success: false, message: "Erro ao conectar com o servidor" };
    }
}

/**
 * Função de Cadastro (Envia para o Banco de Dados)
 */
async function createUser(nome, email, login, telefone, senha) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, login, telefone, senha })
        });

        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        return false;
    }
}

// --- UTILITÁRIOS DE SESSÃO ---

function isUserLoggedIn() {
    return localStorage.getItem('userLoggedIn') === 'true';
}

function isAdminLoggedIn() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return isUserLoggedIn() && (user.role === 'admin' || localStorage.getItem('adminLoggedIn') === 'true');
}

function logoutUser() {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.reload(); // Recarrega para limpar a interface
}

// Global para os botões de "Sair"
window.logoutUser = logoutUser;
window.logoutAdmin = logoutUser;

// --- INTERFACE (DOM) ---

function toggleAdminLink() {
    const adminLink = document.getElementById('admin-link');
    if (adminLink) {
        adminLink.style.display = isAdminLoggedIn() ? 'block' : 'none';
    }
}

function updateLoginInterface() {
    const navLogin = document.querySelector('.nav_login');
    if (!navLogin) return;

    if (isUserLoggedIn()) {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const isAdmin = isAdminLoggedIn();

        // Estilização dinâmica baseada no Role
        const themeColor = isAdmin ? '#10b981' : '#ff6b35';
        const label = isAdmin ? 'Administrador' : (user.nome || 'Usuário');
        const gradient = isAdmin
            ? 'linear-gradient(135deg, rgba(56, 161, 105, 0.15), rgba(167, 243, 208, 0.1))'
            : 'linear-gradient(135deg, rgba(255, 107, 53, 0.15), rgba(255, 165, 0, 0.1))';

        navLogin.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; background: ${gradient}; padding: 8px 16px; border-radius: 25px; border: 1px solid rgba(255,255,255,0.1);">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <div style="width: 8px; height: 8px; background: ${themeColor}; border-radius: 50%; box-shadow: 0 0 6px ${themeColor};"></div>
                    <span style="color: ${themeColor}; font-weight: 700; font-size: 0.9rem;">${label}</span>
                </div>
                <button onclick="logoutUser()" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 15px; font-size: 0.8rem; cursor: pointer;">Sair</button>
            </div>
        `;
    } else {
        // Renderiza o formulário de login caso deslogado
        const currentPath = window.location.pathname;
        const createAccountPath = currentPath.includes('Sub_Projects') ? 'CriarConta.html' : 'Sub_Projects/CriarConta.html';

        navLogin.innerHTML = `
            <form class="login_form" id="login-form">
                <input type="text" placeholder="Login ou Email" class="login_input" id="username">
                <input type="password" placeholder="Senha" class="login_input" id="password">
                <button type="submit" class="login_button">Entrar</button>
                <button type="button" class="create_account_button" onclick="window.location.href='${createAccountPath}'">Criar Conta</button>
            </form>
        `;
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function () {
    toggleAdminLink();
    updateLoginInterface();
});