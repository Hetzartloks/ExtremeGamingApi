// routes/games.js
const router = require('express').Router();
const ctrl   = require('../controllers/gamesController');
const auth = require('../middlewares/authMiddleware');

router.get('/',         ctrl.list);
router.get('/search',   ctrl.filter);
router.post('/new',        auth, ctrl.create);
router.put('/update',      auth, ctrl.update);
router.delete('/delete',   auth, ctrl.remove);

module.exports = router;