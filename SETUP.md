# Guia de Configuração do Firebase - Excelência

## Passo 1: Criar Projeto Firebase

1. Acesse: https://console.firebase.google.com/
2. Clique em **"Adicionar projeto"** ou **"Create a project"**
3. Nome do projeto: `excelencia` (ou qualquer nome)
4. Pode desativar o Google Analytics se quiser
5. Clique em **"Criar projeto"**

## Passo 2: Ativar Authentication

1. No menu lateral esquerdo, clique em **"Authentication"**
2. Clique em **"Começar"** ou **"Get started"**
3. Na aba **"Sign-in method"**:
   - Clique em **"Google"** → Ative → Salve
   - Clique em **"E-mail/senha"** → Ative → Salve
4. Na aba **"Users"**, clique em **"Adicionar usuário"**:
   - Email: `felipeds.souza@hotmail.com`
   - Senha: crie uma senha forte
   - Clique em **"Adicionar usuário"**

## Passo 3: Criar Firestore Database

1. No menu lateral esquerdo, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"** ou **"Create database"**
3. Selecione **"Iniciar no modo de teste"** (test mode)
4. Escolha a localização mais próxima (ex: `southamerica-east1`)
5. Clique em **"Ativar"**

## Passo 4: Registrar App Web

1. Na página inicial do projeto, role para baixo até **"Comece adicionando o Firebase ao seu app"**
2. Clique no ícone da Web **`</>`**
3. Nome do app: `excelencia-web`
4. **NÃO** marque a opção de Firebase Hosting
5. Clique em **"Registrar app"**
6. **COPIE** as credenciais que aparecerem (vão parecer com isso):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "excelencia-xxxxx.firebaseapp.com",
  projectId: "excelencia-xxxxx",
  storageBucket: "excelencia-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  databaseURL: "https://excelencia-xxxxx-default-rtdb.firebaseio.com"
};
```

## Passo 5: Me Enviar as Credenciais

Copie os valores acima e me envie aqui no chat. Vou atualizar o arquivo automaticamente e fazer o redeploy.

## Passo 6: Configurar Google Calendar (Opcional)

Se quiser sincronização com Google Calendar:

1. Acesse: https://console.cloud.google.com/
2. Selecione o projeto do Firebase que você criou
3. Vá em **"APIs e serviços"** → **"Biblioteca"**
4. Pesquise por **"Google Calendar API"** e ative
5. Vá em **"Tela de consentimento OAuth"**:
   - Tipo: **Externo**
   - Preencha os campos obrigatórios
   - Em "Usuários de teste", adicione `felipeds.souza@hotmail.com`
6. Vá em **"Credenciais"** → **"Criar credenciais"** → **"ID do cliente OAuth"**
   - Tipo: **Aplicativo da Web**
   - Nome: `excelencia`
   - URIs autorizados: adicione `https://excelencia-three.vercel.app`
7. Copie o **Client ID** e **Client Secret**

## Pronto!

Depois de seguir esses passos, me envie as credenciais do Firebase e o site vai funcionar!
