// Google Calendar API Integration
class GoogleCalendarIntegration {
    constructor() {
        this.accessToken = localStorage.getItem('googleAccessToken');
    }

    async createEvent(summary, description, startDateTime, endDateTime, attendees = []) {
        if (!this.accessToken) {
            console.warn('Token do Google não disponível');
            return null;
        }

        const event = {
            summary: summary,
            description: description,
            start: {
                dateTime: startDateTime,
                timeZone: 'America/Sao_Paulo'
            },
            end: {
                dateTime: endDateTime,
                timeZone: 'America/Sao_Paulo'
            },
            attendees: attendees.map(email => ({ email: email }))
        };

        try {
            const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + this.accessToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            });

            const data = await response.json();
            return data.id || null;
        } catch (error) {
            console.error('Erro ao criar evento no Google Calendar:', error);
            return null;
        }
    }

    async deleteEvent(eventId) {
        if (!this.accessToken || !eventId) return false;

        try {
            await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + this.accessToken
                }
            });
            return true;
        } catch (error) {
            console.error('Erro ao deletar evento:', error);
            return false;
        }
    }
}

const googleCalendar = new GoogleCalendarIntegration();
