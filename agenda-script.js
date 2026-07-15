// Estado global
let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();
let colaboradores = [];
let escalas = [];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarColaboradores();
    carregarEscalas();
    renderizarCalendario();
    setupEventListeners();
});

// Navegação entre abas
function setupEventListeners() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        });
    });

    document.getElementById('prevMes').addEventListener('click', () => {
        mesAtual--;
        if (mesAtual < 0) {
            mesAtual = 11;
            anoAtual--;
        }
        renderizarCalendario();
        carregarEscalas();
    });

    document.getElementById('nextMes').addEventListener('click', () => {
        mesAtual++;
        if (mesAtual > 11) {
            mesAtual = 0;
            anoAtual++;
        }
        renderizarCalendario();
        carregarEscalas();
    });

    document.getElementById('hojeBtn').addEventListener('click', () => {
        mesAtual = new Date().getMonth();
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
    document.getElementById('mesAno').textContent = `${meses[mesAtual]} ${anoAtual}`;

    const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay();
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0).getDate();
    const diasMesAnterior = new Date(anoAtual, mesAtual, 0).getDate();

    const container = document.getElementById('calendarDays');
    container.innerHTML = '';

    const hoje = new Date();
    const diaHoje = hoje.getDate();
    const mesHoje = hoje.getMonth();
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
        const dataStr = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        cell.dataset.data = dataStr;

        const escalasDoDia = escalas.filter(e => e.data === dataStr);
        escalasDoDia.forEach(escala => {
            const item = document.createElement('div');
            item.className = 'escala-item';
            item.style.borderLeftColor = escala.cor;
            item.textContent = `${escala.hora_inicio || ''} ${escala.nome}`;
            cell.appendChild(item);
        });

        cell.addEventListener('click', () => abrirModalEscala(dataStr));
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

function fecharDetalhes() {
    document.getElementById('modalDetalhes').classList.add('hidden');
}

// Colaboradores
function carregarColaboradores() {
    fetch('agenda-api.php?action=colaboradores')
        .then(res => res.json())
        .then(data => {
            colaboradores = data;
            renderizarColaboradores();
            atualizarSelectColaboradores();
        });
}

function renderizarColaboradores() {
    const container = document.getElementById('listaColaboradores');
    container.innerHTML = '';

    if (colaboradores.length === 0) {
        container.innerHTML = '<p style="color:rgba(255,255,255,0.5);">Nenhum colaborador cadastrado.</p>';
        return;
    }

    colaboradores.forEach(colab => {
        const card = document.createElement('div');
        card.className = 'colab-card';
        card.innerHTML = `
            <div class="colab-color" style="background:${colab.cor}"></div>
            <div class="colab-info">
                <h4>${colab.nome}</h4>
                <p>${colab.cargo || 'Sem cargo'}</p>
            </div>
            <button class="btn-delete" onclick="deletarColaborador(${colab.id})">Excluir</button>
        `;
        container.appendChild(card);
    });
}

function atualizarSelectColaboradores() {
    const select = document.getElementById('escalaColaborador');
    select.innerHTML = '<option value="">Selecione...</option>';
    colaboradores.forEach(colab => {
        const opt = document.createElement('option');
        opt.value = colab.id;
        opt.textContent = colab.nome;
        select.appendChild(opt);
    });
}

function salvarColaborador(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('nome', document.getElementById('colabNome').value);
    formData.append('cargo', document.getElementById('colabCargo').value);
    formData.append('cor', document.getElementById('colabCor').value);

    fetch('agenda-api.php?action=colaborador', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(() => {
            fecharModalColab();
            carregarColaboradores();
        });
}

function deletarColaborador(id) {
    if (!confirm('Excluir este colaborador?')) return;
    const formData = new FormData();
    formData.append('id', id);
    fetch('agenda-api.php?action=colaborador_delete', { method: 'POST', body: formData })
        .then(() => {
            carregarColaboradores();
            carregarEscalas();
        });
}

function fecharModalColab() {
    document.getElementById('modalColab').classList.add('hidden');
    document.getElementById('formColab').reset();
}

// Escalas
function carregarEscalas() {
    fetch(`agenda-api.php?action=escalas&mes=${mesAtual + 1}&ano=${anoAtual}`)
        .then(res => res.json())
        .then(data => {
            escalas = data;
            renderizarCalendario();
        });
}

function salvarEscala(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('colaborador_id', document.getElementById('escalaColaborador').value);
    formData.append('data', document.getElementById('escalaData').value);
    formData.append('hora_inicio', document.getElementById('escalaInicio').value);
    formData.append('hora_fim', document.getElementById('escalaFim').value);
    formData.append('funcao', document.getElementById('escalaFuncao').value);
    formData.append('observacao', document.getElementById('escalaObs').value);

    fetch('agenda-api.php?action=escala', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(() => {
            fecharModal();
            carregarEscalas();
        });
}

function deletarEscala(id) {
    if (!confirm('Excluir esta escala?')) return;
    const formData = new FormData();
    formData.append('id', id);
    fetch('agenda-api.php?action=escala_delete', { method: 'POST', body: formData })
        .then(() => {
            fecharDetalhes();
            carregarEscalas();
        });
}
