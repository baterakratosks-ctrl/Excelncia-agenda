// Estado global
let mesAtual = new Date().getMonth() + 1;
let anoAtual = new Date().getFullYear();
let escalas = JSON.parse(localStorage.getItem('escalas') || '[]');
let userEmail = '';

// Verificar autenticação
const user = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
if (!user) {
    window.location.href = 'index.html';
}
userEmail = user.email;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarEscalas();
    renderizarCalendario();
    setupEventListeners();
});

function fazerLogout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'index.html';
}

function setupEventListeners() {
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

        // Mostrar apenas escalas do usuário logado
        const escalasDoDia = escalas.filter(e => e.data === dataStr && e.email === userEmail);
        escalasDoDia.forEach(escala => {
            const item = document.createElement('div');
            item.className = 'escala-item';
            item.style.borderLeftColor = escala.cor;
            let texto = '';
            if (escala.hora_inicio) texto += escala.hora_inicio + ' ';
            if (escala.funcao) texto += escala.funcao;
            item.textContent = texto || 'Escala';
            cell.appendChild(item);
        });

        if (escalasDoDia.length > 0) {
            cell.addEventListener('click', () => abrirDetalhes(dataStr));
        }
    }

    return cell;
}

function abrirDetalhes(data) {
    const dataFormatada = data.split('-').reverse().join('/');
    document.getElementById('detalhesData').textContent = dataFormatada;

    const lista = document.getElementById('detalhesLista');
    lista.innerHTML = '';

    const escalasDoDia = escalas.filter(e => e.data === data && e.email === userEmail);
    if (escalasDoDia.length === 0) {
        lista.innerHTML = '<p style="color:rgba(255,255,255,0.5);">Nenhuma escala neste dia.</p>';
    } else {
        escalasDoDia.forEach(escala => {
            const div = document.createElement('div');
            div.className = 'escala-detalhe';
            div.style.borderLeftColor = escala.cor;
            div.innerHTML = `
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

// Escalas
function carregarEscalas() {
    escalas = JSON.parse(localStorage.getItem('escalas') || '[]');
    renderizarCalendario();
}
