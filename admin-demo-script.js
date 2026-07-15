// Estado global
let mesAtual = new Date().getMonth() + 1;
let anoAtual = new Date().getFullYear();
let colaboradores = JSON.parse(localStorage.getItem('colaboradores') || '[]');
let escalas = JSON.parse(localStorage.getItem('escalas') || '[]');

// Verificar autenticação
const user = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
if (!user || user.tipo !== 'admin') {
    window.location.href = 'index.html';
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderizarColaboradores();
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
        document.getElementById('modalColab').classList.remove('hidden');
    });

    document.getElementById('formColab').addEventListener('submit', salvarColaborador);
    document.getElementById('formEscala').addEventListener('submit', salvarEscala);
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
        card.innerHTML = `
            <div class="colab-color" style="background:${colab.cor}"></div>
            <div class="colab-info">
                <h4>${colab.nome}</h4>
                <p>${colab.email}</p>
                <p>${colab.cargo || 'Sem cargo'}</p>
            </div>
            <button class="btn-delete" onclick="deletarColaborador('${colab.id}')">Excluir</button>
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
    const cor = document.getElementById('colabCor').value;

    const novoColaborador = {
        id: Date.now().toString(),
        nome,
        email,
        cargo,
        cor
    };

    colaboradores.push(novoColaborador);
    localStorage.setItem('colaboradores', JSON.stringify(colaboradores));

    fecharModalColab();
    renderizarColaboradores();
    alert('Colaborador cadastrado com sucesso!');
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
