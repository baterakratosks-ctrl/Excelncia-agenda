// Estado global
let mesAtual = new Date().getMonth() + 1;
let anoAtual = new Date().getFullYear();
let colaboradores = [];
let escalas = [];

// Verificar autenticação ao carregar
document.addEventListener('DOMContentLoaded', () => {
    if (!authManager.checkAuth()) return;
    if (!authManager.checkAdmin()) return;

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
async function carregarColaboradores() {
    try {
        colaboradores = await database.getColaboradores();
        renderizarColaboradores();
        atualizarSelectColaboradores();
    } catch (error) {
        console.error('Erro ao carregar colaboradores:', error);
        alert('Erro ao carregar colaboradores');
    }
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
            <button class="btn-delete" onclick="deletarColaborador('${colab.id}')">Excluir</button>
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
        opt.dataset.email = colab.email;
        opt.dataset.cor = colab.cor;
        select.appendChild(opt);
    });
}

async function salvarColaborador(e) {
    e.preventDefault();
    const nome = document.getElementById('colabNome').value;
    const email = document.getElementById('colabEmail').value;
    const senha = document.getElementById('colabSenha').value;
    const cargo = document.getElementById('colabCargo').value;
    const cor = document.getElementById('colabCor').value;

    try {
        // Registrar usuário no Firebase Auth
        await authManager.registerUser(email, senha, nome);

        // Salvar dados no Firestore
        await database.addColaborador({ nome, email, cargo, cor });

        fecharModalColab();
        await carregarColaboradores();
        alert('Colaborador cadastrado com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar colaborador:', error);
        alert('Erro: ' + error.message);
    }
}

async function deletarColaborador(id) {
    if (!confirm('Excluir este colaborador?')) return;
    try {
        await database.deleteColaborador(id);
        await carregarColaboradores();
        await carregarEscalas();
    } catch (error) {
        console.error('Erro ao deletar colaborador:', error);
        alert('Erro ao deletar colaborador');
    }
}

function fecharModalColab() {
    document.getElementById('modalColab').classList.add('hidden');
    document.getElementById('formColab').reset();
}

// Escalas
async function carregarEscalas() {
    try {
        escalas = await database.getEscalas(mesAtual, anoAtual);
        renderizarCalendario();
    } catch (error) {
        console.error('Erro ao carregar escalas:', error);
    }
}

async function salvarEscala(e) {
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

    const dadosEscala = {
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

    try {
        // Salvar no Firestore
        const result = await database.addEscala(dadosEscala);

        // Sincronizar com Google Calendar
        if (hora_inicio && hora_fim) {
            const startDateTime = `${data}T${hora_inicio}:00`;
            const endDateTime = `${data}T${hora_fim}:00`;
            const summary = `Escala: ${dadosEscala.nome}`;
            const description = `Função: ${funcao}\nObservação: ${observacao}`;
            const attendees = dadosEscala.email ? [dadosEscala.email] : [];

            const eventId = await googleCalendar.createEvent(
                summary, description, startDateTime, endDateTime, attendees
            );

            if (eventId) {
                await database.updateEscala(result.id, { google_event_id: eventId });
                alert('Escala salva e sincronizada com Google Calendar!');
            }
        }

        fecharModal();
        await carregarEscalas();
    } catch (error) {
        console.error('Erro ao salvar escala:', error);
        alert('Erro: ' + error.message);
    }
}

async function deletarEscala(id) {
    if (!confirm('Excluir esta escala?')) return;
    try {
        // Buscar escala para deletar do Google Calendar
        const escala = escalas.find(e => e.id === id);
        if (escala && escala.google_event_id) {
            await googleCalendar.deleteEvent(escala.google_event_id);
        }

        await database.deleteEscala(id);
        fecharDetalhes();
        await carregarEscalas();
    } catch (error) {
        console.error('Erro ao deletar escala:', error);
        alert('Erro ao deletar escala');
    }
}
