// Sistema de Autenticação para Excelência

// Inicializar banco de dados de usuários
function initDB() {
    if (!localStorage.getItem('usuarios')) {
        // Criar admin padrão
        const usuarios = [{
            id: 1,
            nome: 'Administrador',
            email: 'admin@excelencia.com',
            senha: 'admin123',
            tipo: 'admin',
            dataCriacao: new Date().toISOString()
        }];
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
}

// Mostrar formulário de cadastro
function mostrarCadastro() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('cadastroForm').classList.add('active');
    limparMensagens();
}

// Mostrar formulário de login
function mostrarLogin() {
    document.getElementById('cadastroForm').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');
    limparMensagens();
}

// Limpar mensagens de erro/sucesso
function limparMensagens() {
    document.getElementById('loginMsg').textContent = '';
    document.getElementById('cadastroMsg').textContent = '';
}

// Fazer login
function fazerLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const senha = document.getElementById('loginSenha').value;
    const msg = document.getElementById('loginMsg');

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);

    if (usuario) {
        // Login bem-sucedido
        localStorage.setItem('usuarioLogado', JSON.stringify(usuario));

        // Redirecionar baseado no tipo de usuário
        if (usuario.tipo === 'admin') {
            window.location.href = 'admin-demo.html';
        } else {
            window.location.href = 'agenda-demo.html';
        }
    } else {
        msg.textContent = 'Email ou senha incorretos';
        msg.className = 'msg error';
    }
}

// Fazer cadastro
function fazerCadastro(event) {
    event.preventDefault();

    const nome = document.getElementById('cadastroNome').value.trim();
    const email = document.getElementById('cadastroEmail').value.trim();
    const senha = document.getElementById('cadastroSenha').value;
    const tipo = document.getElementById('cadastroTipo').value;
    const msg = document.getElementById('cadastroMsg');

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');

    // Verificar se email já existe
    if (usuarios.find(u => u.email === email)) {
        msg.textContent = 'Este email já está cadastrado';
        msg.className = 'msg error';
        return;
    }

    // Criar novo usuário
    const novoUsuario = {
        id: usuarios.length + 1,
        nome: nome,
        email: email,
        senha: senha,
        tipo: tipo,
        dataCriacao: new Date().toISOString()
    };

    usuarios.push(novoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    msg.textContent = 'Cadastro realizado com sucesso! Faça login.';
    msg.className = 'msg success';

    // Limpar formulário e voltar para login após 2 segundos
    setTimeout(() => {
        document.getElementById('cadastroEmail').value = '';
        document.getElementById('cadastroSenha').value = '';
        document.getElementById('cadastroNome').value = '';
        mostrarLogin();
        document.getElementById('loginEmail').value = email;
    }, 2000);
}

// Verificar se está logado
function verificarLogin() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
    if (!usuario) {
        window.location.href = 'index.html';
        return null;
    }
    return usuario;
}

// Verificar se é admin
function verificarAdmin() {
    const usuario = verificarLogin();
    if (!usuario) return false;
    if (usuario.tipo !== 'admin') {
        alert('Acesso restrito a administradores');
        window.location.href = 'agenda-demo.html';
        return false;
    }
    return true;
}

// Logout
function logout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'index.html';
}

// Inicializar banco de dados ao carregar
initDB();
