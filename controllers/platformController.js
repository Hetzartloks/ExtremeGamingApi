const db = require('../config/firebase');
const platformsCol = db.collection('platforms');

// Listas todas las plataformas
async function list(req, res){
    try{
        const snapshot = await platformsCol.get();
        const platforms = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}))
        .filter(platform => platform.active !== false);

        res.status(200).json(platforms);

    }catch(err){
        res.status(500).json({error: `Error en el servidor: ${err.message}`});
    };
};

//obtener una plataforma por su nombre
async function getByName(req, res){
    try{
        const title = req.query.title;

        if (title === undefined || title.trim()==="" || title === "undefined"){
            return res.status(200).json([]);
        }

        const snapshot = await platformsCol.get();
        const filteredPlatforms = snapshot.docs
            .filter(doc => {
                const data = doc.data();
                return data.title && data.title.toLowerCase().includes(title.toLowerCase());
            })
            .map(doc => ({id: doc.id, ...doc.data()}));

            res.status(200).json(filteredPlatforms)
    }catch(err){
        res.status(500).json({error: `Error en el servidor: ${err.message}`})
    }
};

//Creacion de plataforma
async function create(req, res){
    try{
        const data = req.body;

        const titleSnapshot = await platformsCol.where('title', '==', data.title.trim()).get();
        if(!titleSnapshot.empty){
            return res.status(409).json({error: `Error, ya existe una plataforma con el titulo: ${data.title}`});
        };

        const platformData = {
            title: data.title.trim(),
            description: data.description ? data.description.trim(): '',
            active: typeof data.active === 'boolean' ? data.active : true
        };

        const docRef = await platformsCol.add(platformData);
        const newDoc = await docRef.get();

        res.status(201).json({ id: newDoc.id, ...newDoc.data()});

    }catch(err){
        res.status(500).json({error: `Error en el servidor: ${err.message}`});
    }
}

//Edicion de una plataforma
async function update(req, res){
    try{
        const id = req.query.id;
        if(!id){
            return res.status(400).json({error: `Falta el Parámetro 'id' en la query`});
        }

        // Solo permitir actualizar title y description
        const updateData = {};
        if (typeof req.body.title === 'string') updateData.title = req.body.title.trim();
        if (typeof req.body.description === 'string') updateData.description = req.body.description.trim();

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({error: "No hay campos válidos para actualizar (solo 'title' y 'description')."});
        }

        await platformsCol.doc(id).update(updateData);
        const updated = await platformsCol.doc(id).get();

        res.status(200).json({id: updated.id, ...updated.data()});
    }catch(err){
        res.status(500).json({ error: `Error en el servidor: ${err.message}`});
    }
}

async function remove(req, res){
    try{
        const id = req.query.id;
        if(!id){
            return res.status(400).json({error: `Falta el parametro 'id' en la query`});
        }

        await platformsCol.doc(id).update({active: false});
        const updated = await platformsCol.doc(id).get();

        res.status(200).json({message: `plataforma desactivada correctamente: `, id:updated.id, ...updated.data()});
    }catch(err){
        res.status(500).json({ error: `Error en el servidor: ${err.message}`});
    }
}

module.exports={
    list,
    getByName,
    create,
    update,
    remove
}