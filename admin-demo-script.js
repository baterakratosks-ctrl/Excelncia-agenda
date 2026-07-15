// Estado global
let mesAtual = new Date().getMonth() + 1;
let anoAtual = new Date().getFullYear();
let colaboradores = JSON.parse(localStorage.getItem('colaboradores') || '[]');
let escalas = JSON.parse(localStorage.getItem('escalas') || '[]');
let departamentos = JSON.parse(localStorage.getItem('departamentos') || '[]');
let funcoes = JSON.parse(localStorage.getItem('funcoes') || '[]');
let colaboradorEditandoId = null;

// Verificar autenticação
const user = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
if (!user || user.tipo !== 'admin') {
    window.location.href = 'index.html';
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderizarColaboradores();
    renderizarDepartamentos();
    renderizarFuncoes();
    carregarEscalas();
    renderizarCalendario();
    setupEventListeners();
});

function fazerLogout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'index.html';
}

// Navegação entre abas
function setupEventListeners() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.onclick) return;
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        });
    });

    document.getElementById('prevMes').addEventListener('click', () => {
        mesAtual--;
        if (mesAtual < 1) { mesAtual = 12; anoAtual--; }
        renderizarCalendario();
        carregarEscalas();
    });

    document.getElementById('nextMes').addEventListener('click', () => {
        mesAtual++;
        if (mesAtual > 12) { mesAtual = 1; anoAtual++; }
        renderizarCalendario();
        carregarEscalas();
    });

    document.getElementById('hojeBtn').addEventListener('click', () => {
        mesAtual = new Date().getMonth() + 1;
        anoAtual = new Date().getFullYear();
        renderizarCalendario();
        carregarEscalas();
    });

    document.getElementById('btnNovoColab').addEventListener('click', () => {
        carregarDepartamentosNoSelect();
        carregarFuncoesNoSelect();
        document.getElementById('modalColab').classList.remove('hidden');
    });

    document.getElementById('btnNovoDepartamento').addEventListener('click', () => {
        document.getElementById('modalDepartamento').classList.remove('hidden');
    });

    document.getElementById('btnNovaFuncao').addEventListener('click', () => {
        document.getElementById('modalFuncao').classList.remove('hidden');
    });

    document.getElementById('formColab').addEventListener('submit', salvarColaborador);
    document.getElementById('formEscala').addEventListener('submit', salvarEscala);
    document.getElementById('formDepartamento').addEventListener('submit', salvarDepartamento);
    document.getElementById('formFuncao').addEventListener('submit', salvarFuncao);
}

// Calendário
function renderizarCalendario() {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    document.getElementById('mesAno').textContent = `${meses[mesAtual - 1]} ${anoAtual}`;

    const primeiroDia = new Date(anoAtual, mesAtual - 1, 1).getDay();
    const ultimoDia = new Date(anoAtual, mesAtual, 0).getDate();
    const diasMesAnterior = new Date(anoAtual, mesAtual - 1, 0).getDate();

    const container = document.getElementById('calendarDays');
    container.innerHTML = '';

    const hoje = new Date();
    const diaHoje = hoje.getDate();
    const mesHoje = hoje.getMonth() + 1;
    const anoHoje = hoje.getFullYear();

    // Dias do mês anterior
    for (let i = primeiroDia - 1; i >= 0; i--) {
        const dia = diasMesAnterior - i;
        const cell = criarCelulaDia(dia, true);
        container.appendChild(cell);
    }

    // Dias do mês atual
    for (let dia = 1; dia <= ultimoDia; dia++) {
        const isToday = dia === diaHoje && mesAtual === mesHoje && anoAtual === anoHoje;
        const cell = criarCelulaDia(dia, false, isToday);
        container.appendChild(cell);
    }

    // Dias do próximo mês
    const totalCelulas = container.children.length;
    const restante = 42 - totalCelulas;
    for (let dia = 1; dia <= restante; dia++) {
        const cell = criarCelulaDia(dia, true);
        container.appendChild(cell);
    }
}

function criarCelulaDia(dia, otherMonth, isToday = false) {
    const cell = document.createElement('div');
    cell.className = 'day-cell' + (otherMonth ? ' other-month' : '') + (isToday ? ' today' : '');

    const numDiv = document.createElement('div');
    numDiv.className = 'day-number';
    numDiv.textContent = dia;
    cell.appendChild(numDiv);

    if (!otherMonth) {
        const dataStr = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        cell.dataset.data = dataStr;

        const escalasDoDia = escalas.filter(e => e.data === dataStr);
        escalasDoDia.forEach(escala => {
            const item = document.createElement('div');
            item.className = 'escala-item';
            item.style.borderLeftColor = escala.cor;
            let texto = '';
            if (escala.hora_inicio) texto += escala.hora_inicio + ' ';
            texto += escala.nome;
            if (escala.funcao) texto += ' - ' + escala.funcao;
            item.textContent = texto;
            cell.appendChild(item);
        });

        cell.addEventListener('click', () => {
            if (escalasDoDia.length > 0) {
                abrirDetalhes(dataStr);
            } else {
                abrirModalEscala(dataStr);
            }
        });
    }

    return cell;
}

// Modal de escala
function abrirModalEscala(data) {
    document.getElementById('escalaData').value = data;
    const dataFormatada = data.split('-').reverse().join('/');
    document.getElementById('modalData').textContent = dataFormatada;
    document.getElementById('modalEscala').classList.remove('hidden');
}

function fecharModal() {
    document.getElementById('modalEscala').classList.add('hidden');
    document.getElementById('formEscala').reset();
}

function abrirDetalhes(data) {
    const dataFormatada = data.split('-').reverse().join('/');
    document.getElementById('detalhesData').textContent = dataFormatada;

    const lista = document.getElementById('detalhesLista');
    lista.innerHTML = '';

    const escalasDoDia = escalas.filter(e => e.data === data);
    if (escalasDoDia.length === 0) {
        lista.innerHTML = '<p style="color:rgba(255,255,255,0.5);">Nenhuma escala neste dia.</p>';
    } else {
        escalasDoDia.forEach(escala => {
            const div = document.createElement('div');
            div.className = 'escala-detalhe';
            div.style.borderLeftColor = escala.cor;
            div.innerHTML = `
                <div class="escala-detalhe-header">
                    <strong>${escala.nome}</strong>
                    <button class="btn-delete-sm" onclick="deletarEscala('${escala.id}')">Excluir</button>
                </div>
                <div class="escala-detalhe-time">
                    ${escala.hora_inicio ? escala.hora_inicio + ' - ' + (escala.hora_fim || '?') : 'Horário não definido'}
                </div>
                ${escala.funcao ? `<div class="escala-detalhe-funcao">Função: ${escala.funcao}</div>` : ''}
                ${escala.observacao ? `<div class="escala-detalhe-funcao">Obs: ${escala.observacao}</div>` : ''}
            `;
            lista.appendChild(div);
        });
    }

    document.getElementById('modalDetalhes').classList.remove('hidden');
}

function fecharDetalhes() {
    document.getElementById('modalDetalhes').classList.add('hidden');
}

// Colaboradores
function renderizarColaboradores() {
    const container = document.getElementById('listaColaboradores');
    container.innerHTML = '';

    if (colaboradores.length === 0) {
        container.innerHTML = '<p style="color:rgba(255,255,255,0.5);">Nenhum colaborador cadastrado. Clique em "+ Novo Colaborador" para começar.</p>';
        return;
    }

    colaboradores.forEach(colab => {
        const card = document.createElement('div');
        card.className = 'colab-card';
        const tipoTexto = colab.tipo === 'admin' ? 'Administrador' : 'Usuário';
        const tipoBadge = colab.tipo === 'admin' ? 'style="background:#ff5252"' : 'style="background:#4caf50"';

        // Buscar departamento
        const dept = departamentos.find(d => d.id === colab.departamento);
        const deptBadge = dept ? `<span class="dept-badge" style="background:${dept.cor}">${dept.nome}</span>` : '';

        card.innerHTML = `
            <div class="colab-header">
                <div class="colab-color" style="background:${colab.cor}"></div>
                <div class="colab-info">
                    <h4>${colab.nome}</h4>
                    <p>${colab.email}</p>
                    <p>${colab.cargo || 'Sem cargo'}</p>
                    <span class="tipo-badge" ${tipoBadge}>${tipoTexto}</span>
                    ${deptBadge}
                </div>
            </div>
            <div class="colab-actions">
                <button class="btn-edit" onclick="editarColaborador('${colab.id}')">Editar</button>
                <button class="btn-delete" onclick="deletarColaborador('${colab.id}')">Excluir</button>
            </div>
        `;
        container.appendChild(card);
    });

    atualizarSelectColaboradores();
}

function atualizarSelectColaboradores() {
    const select = document.getElementById('escalaColaborador');
    select.innerHTML = '<option value="">Selecione um colaborador...</option>';
    colaboradores.forEach(colab => {
        const opt = document.createElement('option');
        opt.value = colab.id;
        opt.textContent = `${colab.nome} (${colab.email})`;
        opt.dataset.email = colab.email;
        opt.dataset.cor = colab.cor;
        select.appendChild(opt);
    });
}

function salvarColaborador(e) {
    e.preventDefault();
    const nome = document.getElementById('colabNome').value;
    const email = document.getElementById('colabEmail').value;
    const cargo = document.getElementById('colabCargo').value;
    const funcao = document.getElementById('colabFuncao').value;
    const tipo = document.getElementById('colabTipo').value;
    const departamento = document.getElementById('colabDepartamento').value;

    if (colaboradorEditandoId) {
        // Atualizar colaborador existente
        const index = colaboradores.findIndex(c => c.id === colaboradorEditandoId);
        if (index !== -1) {
            colaboradores[index] = {
                ...colaboradores[index],
                nome,
                email,
                cargo,
                funcao,
                tipo,
                departamento
            };
        }
        colaboradorEditandoId = null;
        localStorage.setItem('colaboradores', JSON.stringify(colaboradores));
        fecharModalColab();
        renderizarColaboradores();
        alert('Colaborador atualizado com sucesso!');
    } else {
        // Criar novo colaborador
        const novoColaborador = {
            id: Date.now().toString(),
            nome,
            email,
            cargo,
            funcao,
            tipo,
            departamento
        };

        colaboradores.push(novoColaborador);
        localStorage.setItem('colaboradores', JSON.stringify(colaboradores));

        fecharModalColab();
        renderizarColaboradores();
        alert('Colaborador cadastrado com sucesso!');
    }
}

function editarColaborador(id) {
    const colab = colaboradores.find(c => c.id === id);
    if (!colab) return;

    colaboradorEditandoId = id;
    carregarDepartamentosNoSelect();
    carregarFuncoesNoSelect();

    // Preencher formulário com dados do colaborador
    document.getElementById('colabNome').value = colab.nome;
    document.getElementById('colabEmail').value = colab.email;
    document.getElementById('colabCargo').value = colab.cargo || '';
    document.getElementById('colabFuncao').value = colab.funcao || '';
    document.getElementById('colabTipo').value = colab.tipo;
    document.getElementById('colabDepartamento').value = colab.departamento || '';

    // Mudar título do modal
    document.querySelector('#modalColab h3').textContent = 'Editar Colaborador';

    // Abrir modal
    document.getElementById('modalColab').classList.remove('hidden');
}

function deletarColaborador(id) {
    if (!confirm('Excluir este colaborador?')) return;
    colaboradores = colaboradores.filter(c => c.id !== id);
    localStorage.setItem('colaboradores', JSON.stringify(colaboradores));
    renderizarColaboradores();
}

function fecharModalColab() {
    document.getElementById('modalColab').classList.add('hidden');
    document.getElementById('formColab').reset();
    document.querySelector('#modalColab h3').textContent = 'Novo Colaborador';
    colaboradorEditandoId = null;
}

// Escalas
function carregarEscalas() {
    escalas = JSON.parse(localStorage.getItem('escalas') || '[]');
    renderizarCalendario();
}

function salvarEscala(e) {
    e.preventDefault();
    const select = document.getElementById('escalaColaborador');
    const colaboradorId = select.value;
    const selectedOption = select.options[select.selectedIndex];

    if (!colaboradorId) {
        alert('Selecione um colaborador');
        return;
    }

    const data = document.getElementById('escalaData').value;
    const hora_inicio = document.getElementById('escalaInicio').value;
    const hora_fim = document.getElementById('escalaFim').value;
    const funcao = document.getElementById('escalaFuncao').value;
    const observacao = document.getElementById('escalaObs').value;

    const novaEscala = {
        id: Date.now().toString(),
        colaborador_id: colaboradorId,
        nome: selectedOption.text.split(' (')[0],
        email: selectedOption.dataset.email,
        cor: selectedOption.dataset.cor,
        data: data,
        hora_inicio: hora_inicio,
        hora_fim: hora_fim,
        funcao: funcao,
        observacao: observacao
    };

    escalas.push(novaEscala);
    localStorage.setItem('escalas', JSON.stringify(escalas));

    fecharModal();
    carregarEscalas();
    alert('Escala salva com sucesso!');
}

function deletarEscala(id) {
    if (!confirm('Excluir esta escala?')) return;
    escalas = escalas.filter(e => e.id !== id);
    localStorage.setItem('escalas', JSON.stringify(escalas));
    fecharDetalhes();
    carregarEscalas();
}

// Departamentos
function renderizarDepartamentos() {
    const container = document.getElementById('listaDepartamentos');
    container.innerHTML = '';

    if (departamentos.length === 0) {
        container.innerHTML = '<p style="color:rgba(255,255,255,0.5);">Nenhum departamento cadastrado. Clique em "+ Novo Departamento" para começar.</p>';
        return;
    }

    departamentos.forEach(dept => {
        const card = document.createElement('div');
        card.className = 'dept-card';
        const qtdColaboradores = colaboradores.filter(c => c.departamento === dept.id).length;
        card.innerHTML = `
            <div class="dept-color" style="background:${dept.cor}"></div>
            <div class="dept-info">
                <h4>${dept.nome}</h4>
                <p>${dept.descricao || 'Sem descrição'}</p>
                <p style="font-size:0.75rem;opacity:0.7;">${qtdColaboradores} colaborador(es)</p>
            </div>
            <button class="btn-delete" onclick="deletarDepartamento('${dept.id}')">Excluir</button>
        `;
        container.appendChild(card);
    });
}

function salvarDepartamento(e) {
    e.preventDefault();
    const nome = document.getElementById('deptNome').value;
    const descricao = document.getElementById('deptDescricao').value;
    const cor = document.getElementById('deptCor').value;

    const novoDepartamento = {
        id: Date.now().toString(),
        nome,
        descricao,
        cor
    };

    departamentos.push(novoDepartamento);
    localStorage.setItem('departamentos', JSON.stringify(departamentos));

    fecharModalDepartamento();
    renderizarDepartamentos();
    alert('Departamento cadastrado com sucesso!');
}

function deletarDepartamento(id) {
    if (!confirm('Excluir este departamento? Os colaboradores associados ficarão sem departamento.')) return;
    departamentos = departamentos.filter(d => d.id !== id);
    localStorage.setItem('departamentos', JSON.stringify(departamentos));

    // Remover associação dos colaboradores
    colaboradores.forEach(c => {
        if (c.departamento === id) {
            c.departamento = '';
        }
    });
    localStorage.setItem('colaboradores', JSON.stringify(colaboradores));

    renderizarDepartamentos();
    renderizarColaboradores();
}

function fecharModalDepartamento() {
    document.getElementById('modalDepartamento').classList.add('hidden');
    document.getElementById('formDepartamento').reset();
}

function carregarDepartamentosNoSelect() {
    const select = document.getElementById('colabDepartamento');
    select.innerHTML = '<option value="">Selecione um departamento</option>';
    departamentos.forEach(dept => {
        const opt = document.createElement('option');
        opt.value = dept.id;
        opt.textContent = dept.nome;
        select.appendChild(opt);
    });
}

// Funções
function renderizarFuncoes() {
    const container = document.getElementById('listaFuncoes');
    container.innerHTML = '';

    if (funcoes.length === 0) {
        container.innerHTML = '<p style="color:rgba(255,255,255,0.5);">Nenhuma função cadastrada. Clique em "+ Nova Função" para começar.</p>';
        return;
    }

    funcoes.forEach(funcao => {
        const card = document.createElement('div');
        card.className = 'funcao-card';
        const qtdColaboradores = colaboradores.filter(c => c.funcao === funcao.id).length;
        card.innerHTML = `
            <div class="funcao-info">
                <h4>${funcao.nome}</h4>
                <p>${funcao.descricao || 'Sem descrição'}</p>
                <p style="font-size:0.75rem;opacity:0.7;">${qtdColaboradores} colaborador(es)</p>
            </div>
            <button class="btn-delete" onclick="deletarFuncao('${funcao.id}')">Excluir</button>
        `;
        container.appendChild(card);
    });
}

function salvarFuncao(e) {
    e.preventDefault();
    const nome = document.getElementById('funcaoNome').value;
    const descricao = document.getElementById('funcaoDescricao').value;

    const novaFuncao = {
        id: Date.now().toString(),
        nome,
        descricao
    };

    funcoes.push(novaFuncao);
    localStorage.setItem('funcoes', JSON.stringify(funcoes));

    fecharModalFuncao();
    renderizarFuncoes();
    alert('Função cadastrada com sucesso!');
}

function deletarFuncao(id) {
    if (!confirm('Excluir esta função?')) return;
    funcoes = funcoes.filter(f => f.id !== id);
    localStorage.setItem('funcoes', JSON.stringify(funcoes));

    // Remover associação dos colaboradores
    colaboradores.forEach(c => {
        if (c.funcao === id) {
            c.funcao = '';
        }
    });
    localStorage.setItem('colaboradores', JSON.stringify(colaboradores));

    renderizarFuncoes();
    renderizarColaboradores();
}

function fecharModalFuncao() {
    document.getElementById('modalFuncao').classList.add('hidden');
    document.getElementById('formFuncao').reset();
}

function carregarFuncoesNoSelect() {
    const select = document.getElementById('colabFuncao');
    select.innerHTML = '<option value="">Selecione uma função</option>';
    funcoes.forEach(funcao => {
        const opt = document.createElement('option');
        opt.value = funcao.id;
        opt.textContent = funcao.nome;
        select.appendChild(opt);
    });
}
