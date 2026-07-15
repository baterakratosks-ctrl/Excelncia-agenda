<?php
class GitHubDB {
    private $token;
    private $repo;
    private $branch;
    private $apiBase = 'https://api.github.com';
    private $cacheFile;

    public function __construct() {
        $config = require __DIR__ . '/config.local.php';
        $this->token = $config['github_token'];
        $this->repo = $config['github_repo'];
        $this->branch = $config['github_branch'];
        $this->cacheFile = __DIR__ . '/cache.json';
    }

    private function request($method, $endpoint, $data = null) {
        $ch = curl_init();
        $url = $this->apiBase . $endpoint;

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: token ' . $this->token,
            'Accept: application/vnd.github.v3+json',
            'User-Agent: Excelencia-App'
        ]);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($data) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        } elseif ($method === 'PUT') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
            if ($data) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        curl_setopt($ch, CURLOPT_URL, $url);
        $response = curl_exec($ch);
        curl_close($ch);

        return json_decode($response, true);
    }

    // Ler arquivo do repositório
    public function readFile($path) {
        $endpoint = "/repos/{$this->repo}/contents/{$path}?ref={$this->branch}";
        $response = $this->request('GET', $endpoint);

        if (isset($response['content'])) {
            return json_decode(base64_decode($response['content']), true);
        }
        return null;
    }

    // Salvar arquivo no repositório
    public function writeFile($path, $data, $message = 'Update data') {
        // Primeiro, obter o SHA do arquivo se existir
        $endpoint = "/repos/{$this->repo}/contents/{$path}";
        $existing = $this->request('GET', $endpoint);
        $sha = $existing['sha'] ?? null;

        $payload = [
            'message' => $message,
            'content' => base64_encode(json_encode($data, JSON_PRETTY_PRINT)),
            'branch' => $this->branch
        ];

        if ($sha) {
            $payload['sha'] = $sha;
        }

        return $this->request('PUT', $endpoint, $payload);
    }

    // Cache local para performance
    public function cacheData($key, $data) {
        $cache = file_exists($this->cacheFile) ? json_decode(file_get_contents($this->cacheFile), true) : [];
        $cache[$key] = ['data' => $data, 'time' => time()];
        file_put_contents($this->cacheFile, json_encode($cache));
    }

    public function getCachedData($key, $maxAge = 300) {
        if (!file_exists($this->cacheFile)) return null;
        $cache = json_decode(file_get_contents($this->cacheFile), true);
        if (isset($cache[$key]) && (time() - $cache[$key]['time']) < $maxAge) {
            return $cache[$key]['data'];
        }
        return null;
    }
}
?>
