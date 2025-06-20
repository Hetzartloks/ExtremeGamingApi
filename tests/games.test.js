const request = require('supertest');
const app = require('../server');

//TEST DE LISTAR TOOOOODO
describe ('GET /api/games', () => {
    it('Deberia responder con status 200 y un array de jsons', async () => {
        const res = await request(app).get('/api/games');
        expect(res.statusCode).toBe(200);
    });
});

//TEST DE BUSQUEDA POR ID
describe('GET /api/games/:id', () => {
    it('Deberia responder con status 200 y un Json', async () => {
        const id = "2eS2dafPsbFsZgdTX8cI"
        const res = await request(app).get(`/api/games/${id}`);
        expect(res.statusCode).toBe(200);
    });
});

//TEST DE FILTRO POR NOMBRE
describe('GET /api/games/search', () => {
    it('Deberia responder con status 200 y un Json', async () => {
        const title = "e";
        const res = await request(app).get(`/api/games/search?title=${title}`);
        expect(res.statusCode).toBe(200);
    });
});

//TEST DE CREACION DE JUEGO
describe('POST /api/games', () => {
    it('Deberia crear un juego y responder con status 201 y el juego creado', async () => {
        // Usa un token válido si tu endpoint requiere autenticación
        const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJGNjVjQm1jaFZRVG9oZ2hudDhtQiIsImVtYWlsIjoiZHVua2FuQGR1b2N1Yy5jbCIsInVzZXJOYW1lIjoiSGV0emFydGxva3MiLCJpYXQiOjE3NTAyODg0NDUsImV4cCI6MTc1MDM0MjQ0NX0.zFdfrAP1Vr5-D5eqcDGFSLGDG7gxnH7l4c2qWVbW9rw';
        const nuevoJuego = {
            title: "Juego Test POST",
            description: "Descripción test POST",
            developer: "Dev test POST",
            category: "MMO", // Asegúrate que exista esta categoría en tu DB
            price: 15,
            coverImg: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wIAAgMBApUAAAAASUVORK5CYII=",
            discount: 0.10,
            active: true
        };
        const res = await request(app)
            .post('/api/games')
            .set('Authorization', token)
            .send(nuevoJuego);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toMatchObject({
            title: nuevoJuego.title,
            description: nuevoJuego.description,
            developer: nuevoJuego.developer,
            category: nuevoJuego.category,
            price: nuevoJuego.price,
            coverImg: nuevoJuego.coverImg
        });
    });
});

