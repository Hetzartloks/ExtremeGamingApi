const request = require('supertest');
const app = require('../server');

//TEST DE LISTAR TODO
describe ('POST /api/categories', () => {
    it('Deberia responder con status 200 y un array de jsons', async () => {
      const res = await request(app).get('/api/categories');
        expect(res.statusCode).toBe(200);
   });
});
// TEST DE FILTRO POR NOMBRE
describe('POST /api/categories/search', () => {
    it('Deberia responder con status 200 y un array de jsons', async () => {
        const title = "c";
        const res = await request(app)
            .post('/api/categories/search')
            .send({ title });
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
//TEST DE FILTRO POR NOMBRE
describe('GET /api/categories/search', () => {
    it('Deberia responder con status 200 y un Json', async () => {
        const title = "c";
        const res = await request(app).get(`/api/categories/search?title=${title}`);
        expect(res.statusCode).toBe(200);
    });
});


