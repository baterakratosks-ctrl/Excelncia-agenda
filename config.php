<?php
session_start();

// Configuração - Substitua pelos seus valores
$config = [
    'github_token' => 'SEU_TOKEN_GITHUB',
    'github_repo' => 'usuario/repositorio',
    'github_branch' => 'main',
    'google_client_id' => 'SEU_CLIENT_ID.apps.googleusercontent.com',
    'google_client_secret' => 'SEU_CLIENT_SECRET',
    'google_redirect_uri' => 'http://localhost:8000/google-callback.php',
    'admin_email' => 'admin@octopus.com',
    'admin_password' => 'admin123'
];

// Salvar config em arquivo separado (não commitar no GitHub)
file_put_contents(__DIR__ . '/config.local.php', '<?php return ' . var_export($config, true) . ';');
?>
