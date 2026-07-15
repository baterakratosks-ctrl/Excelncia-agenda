<?php
session_start();
require_once 'github-db.php';
header('Content-Type: application/json; charset=utf-8');

$db = new GitHubDB();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Verificar autenticação
if (!isset($_SESSION['google_user'])) {
    echo json_encode(['error' => 'Não autenticado']);
    exit;
}

// --- ADMIN: Colaboradores ---
if ($action === 'colaboradores' && $method === 'GET') {
    $cached = $db->getCachedData('colaboradores');
    if ($cached) {
        echo json_encode($cached);
        exit;
    }
    $colaboradores = $db->readFile('data/colaboradores.json') ?? [];
    $db->cacheData('colaboradores', $colaboradores);
    echo json_encode($colaboradores);
    exit;
}

if ($action === 'colaborador' && $method === 'POST') {
    if (!$_SESSION['is_admin']) {
        echo json_encode(['error' => 'Apenas administradores podem cadastrar']);
        exit;
    }
    $nome = trim($_POST['nome'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $cargo = trim($_POST['cargo'] ?? '');
    $cor = trim($_POST['cor'] ?? '#7c4dff');

    if (empty($nome) || empty($email)) {
        echo json_encode(['error' => 'Nome e email obrigatórios']);
        exit;
    }

    $colaboradores = $db->readFile('data/colaboradores.json') ?? [];
    $id = count($colaboradores) + 1;
    $colaboradores[] = [
        'id' => $id,
        'nome' => $nome,
        'email' => $email,
        'cargo' => $cargo,
        'cor' => $cor,
        'ativo' => true
    ];

    $db->writeFile('data/colaboradores.json', $colaboradores, "Adicionar colaborador: $nome");
    $db->cacheData('colaboradores', $colaboradores);
    echo json_encode(['id' => $id, 'nome' => $nome, 'email' => $email, 'cargo' => $cargo, 'cor' => $cor]);
    exit;
}

if ($action === 'colaborador_delete' && $method === 'POST') {
    if (!$_SESSION['is_admin']) {
        echo json_encode(['error' => 'Apenas administradores']);
        exit;
    }
    $id = $_POST['id'] ?? 0;
    $colaboradores = $db->readFile('data/colaboradores.json') ?? [];
    $colaboradores = array_filter($colaboradores, fn($c) => $c['id'] != $id);
    $db->writeFile('data/colaboradores.json', array_values($colaboradores), "Remover colaborador #$id");
    $db->cacheData('colaboradores', array_values($colaboradores));
    echo json_encode(['ok' => true]);
    exit;
}

// --- ESCALAS ---
if ($action === 'escalas' && $method === 'GET') {
    $mes = $_GET['mes'] ?? date('m');
    $ano = $_GET['ano'] ?? date('Y');
    $key = "escalas_{$ano}_{$mes}";

    $cached = $db->getCachedData($key);
    if ($cached) {
        echo json_encode($cached);
        exit;
    }

    $escalas = $db->readFile('data/escalas.json') ?? [];
    $filtro = array_filter($escalas, function($e) use ($mes, $ano) {
        $data = explode('-', $e['data']);
        return $data[0] == $ano && $data[1] == $mes;
    });

    $db->cacheData($key, $filtro);
    echo json_encode($filtro);
    exit;
}

if ($action === 'escala' && $method === 'POST') {
    if (!$_SESSION['is_admin']) {
        echo json_encode(['error' => 'Apenas administradores']);
        exit;
    }

    $colaborador_id = $_POST['colaborador_id'] ?? 0;
    $data = $_POST['data'] ?? '';
    $hora_inicio = $_POST['hora_inicio'] ?? '';
    $hora_fim = $_POST['hora_fim'] ?? '';
    $funcao = trim($_POST['funcao'] ?? '');
    $observacao = trim($_POST['observacao'] ?? '');

    if (empty($colaborador_id) || empty($data)) {
        echo json_encode(['error' => 'Campos obrigatórios']);
        exit;
    }

    $escalas = $db->readFile('data/escalas.json') ?? [];
    $id = count($escalas) + 1;

    // Buscar dados do colaborador
    $colaboradores = $db->readFile('data/colaboradores.json') ?? [];
    $colaborador = null;
    foreach ($colaboradores as $c) {
        if ($c['id'] == $colaborador_id) {
            $colaborador = $c;
            break;
        }
    }

    $escala = [
        'id' => $id,
        'colaborador_id' => $colaborador_id,
        'data' => $data,
        'hora_inicio' => $hora_inicio,
        'hora_fim' => $hora_fim,
        'funcao' => $funcao,
        'observacao' => $observacao,
        'nome' => $colaborador['nome'] ?? '',
        'cor' => $colaborador['cor'] ?? '#7c4dff',
        'email' => $colaborador['email'] ?? '',
        'google_event_id' => ''
    ];

    // Sincronizar com Google Calendar se token disponível
    if (isset($_SESSION['google_user']['access_token'])) {
        require_once 'google-calendar.php';
        $calendar = new GoogleCalendar($_SESSION['google_user']['access_token']);

        $startDateTime = $data . 'T' . ($hora_inicio ?: '09:00') . ':00';
        $endDateTime = $data . 'T' . ($hora_fim ?: '18:00') . ':00';

        $event = $calendar->createEvent(
            "Escala: " . ($colaborador['nome'] ?? ''),
            "Função: $funcao\nObservação: $observacao",
            $startDateTime,
            $endDateTime,
            !empty($colaborador['email']) ? [$colaborador['email']] : []
        );

        if (isset($event['id'])) {
            $escala['google_event_id'] = $event['id'];
        }
    }

    $escalas[] = $escala;
    $db->writeFile('data/escalas.json', $escalas, "Adicionar escala: " . ($colaborador['nome'] ?? '') . " em $data");

    // Limpar cache
    $mes = substr($data, 5, 2);
    $ano = substr($data, 0, 4);
    $db->cacheData("escalas_{$ano}_{$mes}", null);

    echo json_encode(['id' => $id, 'google_event_id' => $escala['google_event_id']]);
    exit;
}

if ($action === 'escala_delete' && $method === 'POST') {
    if (!$_SESSION['is_admin']) {
        echo json_encode(['error' => 'Apenas administradores']);
        exit;
    }

    $id = $_POST['id'] ?? 0;
    $escalas = $db->readFile('data/escalas.json') ?? [];

    // Deletar do Google Calendar
    foreach ($escalas as $e) {
        if ($e['id'] == $id && !empty($e['google_event_id']) && isset($_SESSION['google_user']['access_token'])) {
            require_once 'google-calendar.php';
            $calendar = new GoogleCalendar($_SESSION['google_user']['access_token']);
            $calendar->deleteEvent($e['google_event_id']);
            break;
        }
    }

    $escalas = array_filter($escalas, fn($e) => $e['id'] != $id);
    $db->writeFile('data/escalas.json', array_values($escalas), "Remover escala #$id");

    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['error' => 'Ação inválida']);
?>
