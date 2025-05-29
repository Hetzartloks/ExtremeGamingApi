// routes/games.js
const router = require('express').Router();
const ctrl   = require('../controllers/gamesController');
const auth = require('../middlewares/authMiddleware');

router.get('/',         ctrl.list);
router.get('/:id',      ctrl.getById);
router.post('/search',  ctrl.getByName);
router.post('/',        auth, ctrl.create);
router.put('/:id',      auth, ctrl.update);
router.delete('/:id',   auth, ctrl.remove);

module.exports = router;