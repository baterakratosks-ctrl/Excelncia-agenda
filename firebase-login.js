// Firebase Auth - Login e Gerenciamento
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.init();
    }

    init() {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.currentUser = user;
                this.isAdmin = (user.email === ADMIN_EMAIL);
                this.onLoginSuccess(user);
            } else {
                this.currentUser = null;
                this.isAdmin = false;
                this.onLogout();
            }
        });
    }

    // Login com Google
    async loginWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/calendar');
        try {
            const result = await firebase.auth().signInWithPopup(provider);
            const credential = result.credential;
            // Salvar token para Google Calendar
            localStorage.setItem('googleAccessToken', credential.accessToken);
            return result.user;
        } catch (error) {
            console.error('Erro no login Google:', error);
            throw error;
        }
    }

    // Login admin com email/senha
    async loginAdmin(email, password) {
        try {
            const result = await firebase.auth().signInWithEmailAndPassword(email, password);
            return result.user;
        } catch (error) {
            console.error('Erro no login admin:', error);
            throw error;
        }
    }

    // Registrar novo usuário (apenas admin pode)
    async registerUser(email, password, nome) {
        if (!this.isAdmin) throw new Error('Apenas administradores podem cadastrar');
        try {
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            await userCredential.user.updateProfile({ displayName: nome });
            return userCredential.user;
        } catch (error) {
            console.error('Erro ao registrar:', error);
            throw error;
        }
    }

    async logout() {
        await firebase.auth().signOut();
        localStorage.removeItem('googleAccessToken');
        window.location.href = 'login.html';
    }

    onLoginSuccess(user) {
        if (this.isAdmin) {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'agenda.html';
        }
    }

    onLogout() {
        if (window.location.pathname.includes('admin.html') || window.location.pathname.includes('agenda.html')) {
            window.location.href = 'login.html';
        }
    }

    checkAuth() {
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    checkAdmin() {
        if (!this.isAdmin) {
            alert('Acesso restrito a administradores');
            window.location.href = 'agenda.html';
            return false;
        }
        return true;
    }
}

const authManager = new AuthManager();
