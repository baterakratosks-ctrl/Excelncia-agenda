// Firestore - Banco de Dados
class Database {
    constructor() {
        this.db = firebase.firestore();
    }

    // === COLABORADORES ===
    async getColaboradores() {
        const snapshot = await this.db.collection('colaboradores')
            .where('ativo', '==', true)
            .orderBy('nome')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async addColaborador(data) {
        const docRef = await this.db.collection('colaboradores').add({
            nome: data.nome,
            email: data.email,
            cargo: data.cargo || '',
            cor: data.cor || '#7c4dff',
            ativo: true,
            criadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { id: docRef.id, ...data };
    }

    async deleteColaborador(id) {
        await this.db.collection('colaboradores').doc(id).update({ ativo: false });
    }

    // === ESCALAS ===
    async getEscalas(mes, ano) {
        const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
        const fim = `${ano}-${String(mes).padStart(2, '0')}-31`;

        const snapshot = await this.db.collection('escalas')
            .where('data', '>=', inicio)
            .where('data', '<=', fim)
            .orderBy('data')
            .orderBy('hora_inicio')
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async addEscala(data) {
        const docRef = await this.db.collection('escalas').add({
            colaborador_id: data.colaborador_id,
            nome: data.nome,
            email: data.email || '',
            cor: data.cor || '#7c4dff',
            data: data.data,
            hora_inicio: data.hora_inicio || '',
            hora_fim: data.hora_fim || '',
            funcao: data.funcao || '',
            observacao: data.observacao || '',
            google_event_id: '',
            criadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { id: docRef.id };
    }

    async updateEscala(id, updates) {
        await this.db.collection('escalas').doc(id).update(updates);
    }

    async deleteEscala(id) {
        await this.db.collection('escalas').doc(id).delete();
    }

    // Buscar colaborador por ID
    async getColaborador(id) {
        const doc = await this.db.collection('colaboradores').doc(id).get();
        if (doc.exists) {
            return { id: doc.id, ...doc.data() };
        }
        return null;
    }
}

const database = new Database();
