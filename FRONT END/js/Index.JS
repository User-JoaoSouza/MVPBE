// --- FUNÇÕES DE INTERFACE E NAVEGAÇÃO ---

/**
 * Adiciona evento de clique na logo para redirecionar à Home
 */
function addLogoClickEvent() {
    const logos = document.querySelectorAll('.logo_Dedo_Deus, .nav-logo img, .nav_logo img');

    logos.forEach(logo => {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', function () {
            const currentPath = window.location.pathname;
            const isSubProject = currentPath.includes('Sub_Projects');
            window.location.href = isSubProject ? '../Index.html' : 'Index.html';
        });
    });
}

/**
 * Formata as labels das features com ícones
 */
function formatarFeature(feature) {
    switch (feature.tipo) {
        case 'distancia': return `🥾 ${feature.valor}`;
        case 'cachoeira': return `💦 ${feature.valor}`;
        case 'esforco': return `🏋🏻 ${feature.valor}`;
        case 'vista': return `🔭 ${feature.valor}`;
        default: return feature.valor;
    }
}

/**
 * Cria o elemento HTML do card (Trilha ou Cachoeira)
 */
function criarCard(local) {
    const card = document.createElement('div');
    card.classList.add('trilhas_card');

    // 📸 Imagem
    const imageDiv = document.createElement('div');
    imageDiv.classList.add('trilhas_image');
    const img = document.createElement('img');
    img.src = local.imagem_url;
    img.alt = local.nome;
    imageDiv.appendChild(img);

    // 📄 Info
    const infoDiv = document.createElement('div');
    infoDiv.classList.add('trilhas_info');

    const titulo = document.createElement('h3');
    titulo.textContent = local.nome;

    const location = document.createElement('p');
    location.classList.add('trilhas_location');
    location.textContent = `📍 ${local.localizacao}`;

    const descricao = document.createElement('p');
    descricao.classList.add('trilhas_description');
    descricao.textContent = local.descricao;

    // 🏷️ Features
    const featuresDiv = document.createElement('div');
    featuresDiv.classList.add('trilhas_features');
    if (local.features) {
        local.features.forEach(f => {
            const span = document.createElement('span');
            span.classList.add('feature');
            span.textContent = formatarFeature(f);
            featuresDiv.appendChild(span);
        });
    }

    // 🔗 Botão detalhes
    const linkDetalhes = document.createElement('a');
    linkDetalhes.href = `./Sub_Projects/Detalhes.html?id=${local.id}`;
    const btnDetalhes = document.createElement('button');
    btnDetalhes.classList.add('trilhas_button');
    btnDetalhes.textContent = 'Ver Detalhes';
    linkDetalhes.appendChild(btnDetalhes);

    // 📅 Botão agendar
    const linkAgenda = document.createElement('a');
    linkAgenda.href = './Sub_Projects/Agenda.html';
    const btnAgenda = document.createElement('button');
    btnAgenda.classList.add('trilhas_button');
    btnAgenda.textContent = 'Agendar Trilha';
    btnAgenda.style.background = '#4caf50';
    btnAgenda.style.marginTop = '.5rem';
    linkAgenda.appendChild(btnAgenda);

    infoDiv.append(titulo, location, descricao, featuresDiv, linkDetalhes, linkAgenda);
    card.append(imageDiv, infoDiv);

    return card;
}

// --- SISTEMA DE LOGIN (BACKEND) ---

/**
 * Envia credenciais para o servidor e processa a resposta
 */
async function handleLogin(e) {
    e.preventDefault();

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    if (!usernameInput || !passwordInput) return;

    const credentials = {
        loginOrEmail: usernameInput.value,
        senha: passwordInput.value
    };

    try {
        const response = await fetch('http://localhost:3000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        const result = await response.json();

        if (result.success) {
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(result.user));

            if (result.user.role === 'admin') {
                localStorage.setItem('adminLoggedIn', 'true');
                alert(`Bem-vindo, Administrador ${result.user.nome}!`);
            } else {
                alert(`Bem-vindo, ${result.user.nome}!`);
            }

            // Funções de atualização de UI (esperadas no Auth.js)
            if (typeof toggleAdminLink === 'function') toggleAdminLink();
            if (typeof updateLoginInterface === 'function') updateLoginInterface();
        } else {
            alert('Credenciais inválidas!');
        }
    } catch (err) {
        console.error('Erro no login:', err);
        alert('Erro ao conectar com o servidor.');
    }
}

// --- CARREGAMENTO DE DADOS ---

function carregarCards(endpoint, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    fetch(`http://localhost:3000${endpoint}`)
        .then(res => res.json())
        .then(dados => {
            container.innerHTML = '';
            dados.forEach(item => {
                container.appendChild(criarCard(item));
            });
        })
        .catch(err => console.error(`Erro ao buscar ${endpoint}:`, err));
}

// --- INICIALIZAÇÃO ---

document.addEventListener('DOMContentLoaded', function () {
    // Menu Mobile
    const navToggle = document.getElementById('nav_toggle');
    const navContent = document.getElementById('nav_content');

    if (navToggle && navContent) {
        navToggle.addEventListener('click', () => {
            navContent.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Comportamento dos links do menu
    document.querySelectorAll('.nav_menu a').forEach(link => {
        link.addEventListener('click', function () {
            if (navContent) navContent.classList.remove('active');
            if (navToggle) navToggle.classList.remove('active');
            document.querySelectorAll('.nav_menu a').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    addLogoClickEvent();

    // Eventos de Login
    document.addEventListener('click', async function (e) {
        if (e.target && e.target.matches('.login_button')) {
            e.preventDefault();

            // Pega os elementos de input
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');

            // VALIDAÇÃO: Verifica se os campos existem e não estão vazios
            if (!usernameInput || !passwordInput || !usernameInput.value || !passwordInput.value) {
                alert("Por favor, preencha todos os campos.");
                return;
            }

            // LIMPEZA: Remove espaços extras que o usuário possa ter digitado sem querer
            const userValue = usernameInput.value.trim();
            const passValue = passwordInput.value.trim();

            console.log("Enviando para o login:", userValue, passValue); // Para você conferir no F12

            // CHAMA A FUNÇÃO LOGIN (que está no Auth.js)
            // Note que passamos apenas as STRINGS, não um objeto
            const result = await login(userValue, passValue);

            if (result.success) {
                alert(`Bem-vindo, ${result.user.nome}!`);
                window.location.reload();
            } else {
                alert(result.message || 'Usuário ou senha incorretos!');
            }
        }
    });

    // Impede o refresh da página no form de login
    document.addEventListener('submit', function (e) {
        if (e.target && e.target.id === 'login-form') {
            e.preventDefault();
        }
    });

    // Carregar conteúdo do Banco de Dados
    carregarCards('/locais/trilhas', 'trilhas-container');
    carregarCards('/locais/cachoeiras', 'cachoeiras-container');
});