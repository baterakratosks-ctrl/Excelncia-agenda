<?php
session_start();
$config = require __DIR__ . '/config.local.php';

if (!isset($_GET['code'])) {
    die('Erro: Código de autorização não recebido');
}

// Trocar código por token
$ch = curl_init('https://oauth2.googleapis.com/token');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'code' => $_GET['code'],
    'client_id' => $config['google_client_id'],
    'client_secret' => $config['google_client_secret'],
    'redirect_uri' => $config['google_redirect_uri'],
    'grant_type' => 'authorization_code'
]));
$response = curl_exec($ch);
curl_close($ch);
$tokenData = json_decode($response, true);

if (!isset($tokenData['access_token'])) {
    die('Erro ao obter token de acesso');
}

// Obter informações do usuário
$ch = curl_init('https://www.googleapis.com/oauth2/v2/userinfo');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $tokenData['access_token']]);
$userInfo = json_decode(curl_exec($ch), true);
curl_close($ch);

// Salvar dados do usuário na sessão
$_SESSION['google_user'] = [
    'id' => $userInfo['id'],
    'email' => $userInfo['email'],
    'nome' => $userInfo['name'],
    'foto' => $userInfo['picture'] ?? '',
    'access_token' => $tokenData['access_token'],
    'refresh_token' => $tokenData['refresh_token'] ?? ''
];

// Verificar se é admin
if ($userInfo['email'] === $config['admin_email']) {
    $_SESSION['is_admin'] = true;
    header('Location: admin.html');
} else {
    $_SESSION['is_admin'] = false;
    header('Location: agenda.html');
}
exit;
?>
