<?php
class GoogleCalendar {
    private $accessToken;
    private $refreshToken;

    public function __construct($accessToken, $refreshToken = '') {
        $this->accessToken = $accessToken;
        $this->refreshToken = $refreshToken;
    }

    private function request($method, $endpoint, $data = null) {
        $ch = curl_init('https://www.googleapis.com' . $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->accessToken,
            'Content-Type: application/json'
        ]);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($data) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $response = curl_exec($ch);
        curl_close($ch);
        return json_decode($response, true);
    }

    // Criar evento no Google Calendar
    public function createEvent($summary, $description, $startDateTime, $endDateTime, $attendees = []) {
        $event = [
            'summary' => $summary,
            'description' => $description,
            'start' => ['dateTime' => $startDateTime, 'timeZone' => 'America/Sao_Paulo'],
            'end' => ['dateTime' => $endDateTime, 'timeZone' => 'America/Sao_Paulo']
        ];

        if (!empty($attendees)) {
            $event['attendees'] = array_map(function($email) {
                return ['email' => $email];
            }, $attendees);
        }

        return $this->request('POST', '/calendar/v3/calendars/primary/events', $event);
    }

    // Listar eventos
    public function listEvents($timeMin, $timeMax) {
        $params = http_build_query([
            'timeMin' => $timeMin,
            'timeMax' => $timeMax,
            'singleEvents' => true,
            'orderBy' => 'startTime'
        ]);
        return $this->request('GET', '/calendar/v3/calendars/primary/events?' . $params);
    }

    // Deletar evento
    public function deleteEvent($eventId) {
        $ch = curl_init('https://www.googleapis.com/calendar/v3/calendars/primary/events/' . $eventId);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $this->accessToken]);
        curl_exec($ch);
        curl_close($ch);
    }
}
?>
