const router  = require('express').Router();
const auth    = require('../middleware/auth');
const usuarios = require('../controller/UsuariosController');
const produtos = require('../controller/ProdutosController');

router.post('/login',       usuarios.login);
router.post('/criarconta',  usuarios.criarConta);

router.get('/listarprodutos',          auth, produtos.listarprodutos);
router.put('/atualizarproduto/:id',    auth, produtos.atualizarProduto);
router.delete('/deletarproduto/:id',   auth, produtos.deletarProduto);
router.post('/adicionarproduto',       auth, produtos.adicionarProduto);

module.exports = router;
