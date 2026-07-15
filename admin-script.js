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
            if (btn.onclick) return;
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        });
    });

    document.getElementById('prevMes').addEventListener('click', () => {
        mesAtual--;
        if (mesAtual < 0) { mesAtual = 11; anoAtual--; }
        renderizarCalendario();
        carregarEscalas();
    });

    document.getElementById('nextMes').addEventListener('click', () => {
        mesAtual++;
        if (mesAtual > 11) { mesAtual = 0; anoAtual++; }
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

function logout() {
    fetch('logout.php').then(() => window.location.href = 'login.html');
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
                    <button class="btn-delete-sm" onclick="deletarEscala(${escala.id})">Excluir</button>
                </div>
                <div class="escala-detalhe-time">
                    ${escala.hora_inicio ? escala.hora_inicio + ' - ' + (escala.hora_fim || '?') : 'Horário não definido'}
                </div>
                ${escala.funcao ? `<div class="escala-detalhe-funcao">Função: ${escala.funcao}</div>` : ''}
                ${escala.observacao ? `<div class="escala-detalhe-funcao">Obs: ${escala.observacao}</div>` : ''}
                ${escala.google_event_id ? '<div style="color:#69f0ae;font-size:0.75rem;margin-top:3px;">✓ Sincronizado Google Calendar</div>' : ''}
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
function carregarColaboradores() {
    fetch('api.php?action=colaboradores')
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
            <button class="btn-delete" onclick="deletarColaborador(${colab.id})">Excluir</button>
        `;
        container.appendChild(card);
    });
}

function atualizarSelectColaboradores() {
    const select = document.getElementById('escalaColaborador');
    select.innerHTML = '<option value="">Selecione um colaborador...</option>';
    colaboradores.forEach(colab => {
        const opt = document.createElement('option');
        opt.value = colab.id;
        opt.textContent = `${colab.nome} (${colab.email})`;
        select.appendChild(opt);
    });
}

function salvarColaborador(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('nome', document.getElementById('colabNome').value);
    formData.append('email', document.getElementById('colabEmail').value);
    formData.append('cargo', document.getElementById('colabCargo').value);
    formData.append('cor', document.getElementById('colabCor').value);

    fetch('api.php?action=colaborador', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
            if (data.error) { alert(data.error); return; }
            fecharModalColab();
            carregarColaboradores();
        });
}

function deletarColaborador(id) {
    if (!confirm('Excluir este colaborador? Todas as escalas associadas serão removidas.')) return;
    const formData = new FormData();
    formData.append('id', id);
    fetch('api.php?action=colaborador_delete', { method: 'POST', body: formData })
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
    fetch(`api.php?action=escalas&mes=${mesAtual + 1}&ano=${anoAtual}`)
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

    fetch('api.php?action=escala', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
            if (data.error) { alert(data.error); return; }
            fecharModal();
            carregarEscalas();
            if (data.google_event_id) {
                alert('Escala salva e sincronizada com o Google Calendar!');
            }
        });
}

function deletarEscala(id) {
    if (!confirm('Excluir esta escala?')) return;
    const formData = new FormData();
    formData.append('id', id);
    fetch('api.php?action=escala_delete', { method: 'POST', body: formData })
        .then(() => {
            fecharDetalhes();
            carregarEscalas();
        });
}
