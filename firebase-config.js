// Configuração Firebase - Substitua com suas credenciais do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAXr7yzVGZkACe7n3vzaSgO5R-DHpecMyE",
    authDomain: "exelencia-72acf.firebaseapp.com",
    projectId: "exelencia-72acf",
    storageBucket: "exelencia-72acf.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456",
    databaseURL: "https://exelencia-72acf-default-rtdb.firebaseio.com"
};

// Admin padrão (configure no Firebase Authentication)
const ADMIN_EMAIL = "felipeds.souza@hotmail.com";

// Inicializar Firebase
if (typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);
    } catch (error) {
        console.error('Erro ao inicializar Firebase:', error);
        alert('Configure o Firebase antes de usar o sistema. Edite firebase-config.js com suas credenciais.');
    }
}
