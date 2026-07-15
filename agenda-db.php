<?php
$dbFile = __DIR__ . '/agenda.db';
try {
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->exec("
        CREATE TABLE IF NOT EXISTS colaboradores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            cargo TEXT DEFAULT '',
            cor TEXT DEFAULT '#7c4dff',
            ativo INTEGER DEFAULT 1,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ");
    $db->exec("
        CREATE TABLE IF NOT EXISTS escalas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            colaborador_id INTEGER NOT NULL,
            data TEXT NOT NULL,
            hora_inicio TEXT DEFAULT '',
            hora_fim TEXT DEFAULT '',
            funcao TEXT DEFAULT '',
            observacao TEXT DEFAULT '',
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE CASCADE
        )
    ");
} catch (PDOException $e) {
    die('Erro: ' . $e->getMessage());
}
?>
