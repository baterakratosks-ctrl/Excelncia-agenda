<?php
session_start();
$config = require __DIR__ . '/config.local.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $senha = $_POST['senha'] ?? '';

    if ($email === $config['admin_email'] && $senha === $config['admin_password']) {
        $_SESSION['is_admin'] = true;
        $_SESSION['google_user'] = [
            'email' => $email,
            'nome' => 'Administrador'
        ];
        header('Location: admin.html');
        exit;
    } else {
        header('Location: login.html?error=Credenciais inválidas');
        exit;
    }
}

header('Location: login.html');
exit;
?>
