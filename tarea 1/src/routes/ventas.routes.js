const router = require('express').Router();
const controller = require('../controllers/ventas.controller');

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', controller.crear);

module.exports = router;
