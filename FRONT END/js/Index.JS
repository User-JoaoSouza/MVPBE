// Função para adicionar evento de clique na logo
function addLogoClickEvent() {
    const logos = document.querySelectorAll('.logo_Dedo_Deus, .nav-logo img, .nav_logo img');
    
    logos.forEach(logo => {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', function() {
            const currentPath = window.location.pathname;
            const isSubProject = currentPath.includes('Sub_Projects');
            
            if (isSubProject) {
                window.location.href = '../Index.html';
            } else {
                window.location.href = 'Index.html';
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav_toggle');
    const navContent = document.getElementById('nav_content');
    
    if (navToggle && navContent) {
        navToggle.addEventListener('click', () => {
            navContent.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
    
    // Fechar menu ao clicar em um link
    document.querySelectorAll('.nav_menu a').forEach(link => {
        link.addEventListener('click', () => {
            if (navContent) navContent.classList.remove('active');
            if (navToggle) navToggle.classList.remove('active');
        });
    });
    
    // Controlar active nos links de navegação
    document.querySelectorAll('.nav_menu a').forEach(link => {
        link.addEventListener('click', function() {
            document.querySelectorAll('.nav_menu a').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Adicionar evento de clique na logo
    addLogoClickEvent();
});
/* marca D'agua Fnsso F4jiga */
// Sistema de login
document.addEventListener('click', function(e) {
    if (e.target && e.target.matches('.login_button')) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const result = login(username, password);
        if (result.success) {
            if (result.type === 'admin') {
                alert('Login de administrador realizado com sucesso!');
            } else {
                alert(`Bem-vindo, ${result.user.nome}!`);
            }
            toggleAdminLink();
            updateLoginInterface();
        } else {
            alert('Credenciais inválidas!');
        }
    }
});

// Prevenir submit do formulário
document.addEventListener('submit', function(e) {
    if (e.target && e.target.matches('#login-form')) {
        e.preventDefault();
    }
});

//Testar conexão com o back
fetch('http://localhost:3000/teste')
    .then(res => res.json())
    .then(data => console.log('Resposta do backend:', data))
    .catch(err => console.error('Erro:', err));

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

    local.features.forEach(f => {
        const span = document.createElement('span');
        span.classList.add('feature');
        span.textContent = formatarFeature(f);
        featuresDiv.appendChild(span);
    });

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

    // 🧩 Montando tudo
    infoDiv.appendChild(titulo);
    infoDiv.appendChild(location);
    infoDiv.appendChild(descricao);
    infoDiv.appendChild(featuresDiv);
    infoDiv.appendChild(linkDetalhes);
    infoDiv.appendChild(linkAgenda);

    card.appendChild(imageDiv);
    card.appendChild(infoDiv);

    return card;
}

function formatarFeature(feature) {
    switch (feature.tipo) {
        case 'distancia':
            return `🥾 ${feature.valor}`;
        case 'cachoeira':
            return `💦 ${feature.valor}`;
        case 'esforco':
            return `🏋🏻 ${feature.valor}`;
        case 'vista':
            return `🔭 ${feature.valor}`;
        default:
            return feature.valor;
    }
}

fetch('http://localhost:3000/locais/trilhas')
    .then(res => res.json())
    .then(trilhas => {
        const container = document.getElementById('trilhas-container');

        trilhas.forEach(trilha => {
            const card = criarCard(trilha);
            container.appendChild(card);
        });
    })
    .catch(err => console.error(err));

fetch('http://localhost:3000/locais/cachoeiras')
    .then(res => res.json())
    .then(cachoeiras => {
        const container = document.getElementById('cachoeiras-container');

        cachoeiras.forEach(cachoeira => {
            const card = criarCard(cachoeira);
            container.appendChild(card);
        });
    })
    .catch(err => console.error(err));