<?php
session_start();
$config = require __DIR__ . '/config.local.php';

// Iniciar OAuth com Google
$authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query([
    'client_id' => $config['google_client_id'],
    'redirect_uri' => $config['google_redirect_uri'],
    'response_type' => 'code',
    'scope' => 'email profile https://www.googleapis.com/auth/calendar',
    'access_type' => 'offline',
    'prompt' => 'consent'
]);

header('Location: ' . $authUrl);
exit;
?>
