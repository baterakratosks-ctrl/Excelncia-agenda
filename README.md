# Excelência - Sistema de Agenda e Escalas

Sistema completo de gestão de escalas com:
- Login com Google (OAuth)
- Painel administrativo para gerenciar colaboradores
- Calendário mensal com escalas
- Sincronização com Google Calendar
- Banco de dados Firebase (Firestore)

## Configuração

### 1. Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Ative **Authentication** (Google e Email/Password)
4. Ative **Firestore Database**
5. Em Configurações do Projeto > Geral > Seus apps > Adicionar app Web
6. Copie as credenciais e edite `firebase-config.js`:

```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

### 2. Google Calendar API

1. No [Google Cloud Console](https://console.cloud.google.com/)
2. Ative a API do Google Calendar
3. Configure OAuth consent screen
4. Adicione o domínio do Vercel em domínios autorizados

### 3. Admin Padrão

Edite `firebase-config.js`:
```javascript
const ADMIN_EMAIL = "admin@excelencia.com";
```

Crie o usuário admin no Firebase Authentication (Email/Password).

## Deploy Vercel

```bash
vercel --prod
```

## Estrutura

- `login-firebase.html` - Página de login
- `admin-firebase.html` - Painel administrativo
- `agenda-firebase.html` - Agenda para colaboradores
- `firebase-config.js` - Configuração Firebase
- `firebase-login.js` - Gerenciamento de autenticação
- `firebase-db.js` - Operações Firestore
- `google-calendar.js` - Integração Google Calendar

## Regras Firestore

Configure no Firebase Console > Firestore > Regras:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /colaboradores/{doc} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.email == 'admin@excelencia.com';
    }
    match /escalas/{doc} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.email == 'admin@excelencia.com';
    }
  }
}
```
