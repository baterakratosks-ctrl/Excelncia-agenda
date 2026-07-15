<?php
session_start();
require_once 'agenda-db.php';
header('Content-Type: application/json; charset=utf-8');
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// --- COLABORADORES ---
if ($action === 'colaboradores' && $method === 'GET') {
    $stmt = $db->query('SELECT * FROM colaboradores WHERE ativo = 1 ORDER BY nome');
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($action === 'colaborador' && $method === 'POST') {
    $nome = trim($_POST['nome'] ?? '');
    $cargo = trim($_POST['cargo'] ?? '');
    $cor = trim($_POST['cor'] ?? '#7c4dff');
    if (empty($nome)) { echo json_encode(['error' => 'Nome obrigatório']); exit; }
    $stmt = $db->prepare('INSERT INTO colaboradores (nome, cargo, cor) VALUES (?, ?, ?)');
    $stmt->execute([$nome, $cargo, $cor]);
    echo json_encode(['id' => $db->lastInsertId(), 'nome' => $nome, 'cargo' => $cargo, 'cor' => $cor]);
    exit;
}

if ($action === 'colaborador_delete' && $method === 'POST') {
    $id = $_POST['id'] ?? 0;
    $stmt = $db->prepare('UPDATE colaboradores SET ativo = 0 WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

// --- ESCALAS ---
if ($action === 'escalas' && $method === 'GET') {
    $mes = $_GET['mes'] ?? date('m');
    $ano = $_GET['ano'] ?? date('Y');
    $inicio = "$ano-$mes-01";
    $fim = date('Y-m-t', strtotime($inicio));
    $stmt = $db->prepare("
        SELECT e.*, c.nome, c.cor, c.cargo
        FROM escalas e
        JOIN colaboradores c ON e.colaborador_id = c.id
        WHERE e.data BETWEEN ? AND ?
        ORDER BY e.data, e.hora_inicio
    ");
    $stmt->execute([$inicio, $fim]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($action === 'escala' && $method === 'POST') {
    $colaborador_id = $_POST['colaborador_id'] ?? 0;
    $data = $_POST['data'] ?? '';
    $hora_inicio = $_POST['hora_inicio'] ?? '';
    $hora_fim = $_POST['hora_fim'] ?? '';
    $funcao = trim($_POST['funcao'] ?? '');
    $observacao = trim($_POST['observacao'] ?? '');
    if (empty($colaborador_id) || empty($data)) { echo json_encode(['error' => 'Campos obrigatórios']); exit; }
    $stmt = $db->prepare('INSERT INTO escalas (colaborador_id, data, hora_inicio, hora_fim, funcao, observacao) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([$colaborador_id, $data, $hora_inicio, $hora_fim, $funcao, $observacao]);
    echo json_encode(['id' => $db->lastInsertId()]);
    exit;
}

if ($action === 'escala_delete' && $method === 'POST') {
    $id = $_POST['id'] ?? 0;
    $stmt = $db->prepare('DELETE FROM escalas WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['error' => 'Ação inválida']);
?>
