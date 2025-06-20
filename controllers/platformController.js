const db = require('../config/firebase');
const platformsCol = db.collection('platforms');

// Listar todas las plataformas activas
async function list(req, res){
    try{
        const snapshot = await platformsCol.get();
        const platforms = snapshot.docs
            .map(doc => ({id: doc.id, ...doc.data()}));

        res.status(200).json(platforms);
    }catch(err){
        res.status(500).json({error: `Error en el servidor: ${err.message}`});
    }
}

// Obtener una plataforma por su nombre
async function getByName(req, res){
    try{
        const title = req.query.title;
        if(!title){
            return res.status(400).json({error: "Titulo de juego requerido en query de Title"});
        }

        const snapshot = await platformsCol.get();
        const filteredPlatforms = snapshot.docs
            .filter(doc => {
                const data = doc.data();
                return data.title && data.title.toLowerCase().includes(title.toLowerCase());
            })
            .map(doc => ({id: doc.id, ...doc.data()}))
            .filter(platform => platform.active !== false);

        res.status(200).json(filteredPlatforms);
    }catch(err){
        res.status(500).json({error: `Error en el servidor: ${err.message}`});
    }
}

// Crear una nueva plataforma
async function create(req, res){
    try{
        const data = req.body;

        // Validación de datos
        if (!data.title || typeof data.title !== 'string' || data.title.trim() === "") {
            return res.status(400).json({error: "El campo 'title' es obligatorio y debe ser un string no vacío."});
        }
        if (data.description && typeof data.description !== 'string') {
            return res.status(400).json({error: "El campo 'description' debe ser un string."});
        }
        if (data.hasOwnProperty('active') && typeof data.active !== 'boolean') {
            return res.status(400).json({error: "El campo 'active' debe ser booleano."});
        }

        // Verificar si ya existe una plataforma con ese título
        const titleSnapshot = await platformsCol.where('title', '==', data.title.trim()).get();
        if(!titleSnapshot.empty){
            return res.status(409).json({error: `Error, ya existe una plataforma con el titulo: ${data.title}`});
        }

        const platformData = {
            title: data.title.trim(),
            description: data.description ? data.description.trim() : '',
            active: typeof data.active === 'boolean' ? data.active : true
        };

        const docRef = await platformsCol.add(platformData);
        const newDoc = await docRef.get();

        res.status(201).json({ id: newDoc.id, ...newDoc.data() });
    }catch(err){
        res.status(500).json({error: `Error en el servidor: ${err.message}`});
    }
}

// Editar una plataforma
async function update(req, res){
    try{
        const id = req.query.id;
        if(!id){
            return res.status(400).json({error: `Falta el Parámetro 'id' en la query`});
        }

        const docRef = platformsCol.doc(id);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return res.status(404).json({error: "Plataforma no encontrada"});
        }

        // Validación de datos
        const updateData = {};
        if (req.body.hasOwnProperty('title')) {
            if (typeof req.body.title !== 'string' || req.body.title.trim() === "") {
                return res.status(400).json({error: "El campo 'title' debe ser un string no vacío."});
            }
            updateData.title = req.body.title.trim();
        }
        if (req.body.hasOwnProperty('description')) {
            if (typeof req.body.description !== 'string' || req.body.description.trim() === "") {
                return res.status(400).json({error: "El campo 'description' debe ser un string no vacio."});
            }
            updateData.description = req.body.description.trim();
        }
        if (req.body.hasOwnProperty('active')) {
            if (typeof req.body.active !== 'boolean') {
                return res.status(400).json({error: "El campo 'active' debe ser booleano."});
            }
            updateData.active = req.body.active;
        } else {
            updateData.active = docSnap.data().active;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({error: "No hay campos válidos para actualizar (solo 'title', 'description' y 'active')."});
        }

        await docRef.update(updateData);
        const updated = await docRef.get();

        res.status(200).json({id: updated.id, ...updated.data()});
    }catch(err){
        res.status(500).json({ error: `Error en el servidor: ${err.message}`});
    }
}

// "Eliminar" una plataforma (solo desactiva)
async function remove(req, res){
    try{
        const id = req.query.id;
        if(!id){
            return res.status(400).json({error: `Falta el parametro 'id' en la query`});
        }

        await platformsCol.doc(id).update({active: false});
        const updated = await platformsCol.doc(id).get();

        res.status(200).json({message: `Plataforma desactivada correctamente`, id: updated.id, ...updated.data()});
    }catch(err){
        res.status(500).json({ error: `Error en el servidor: ${err.message}`});
    }
}

module.exports = {
    list,
    getByName,
    create,
    update,
    remove
}