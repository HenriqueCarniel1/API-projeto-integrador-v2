const router = require('express').Router();
const auth = require('../middleware/auth');
const usuarios = require('../controller/UsuariosController');
const produtos = require('../controller/ProdutosController');
const upload = require('../middleware/upload');

router.post('/login', usuarios.login);
router.post('/criarconta', usuarios.criarConta);

router.get('/listarprodutos', auth, produtos.listarprodutos);
router.put('/atualizarproduto/:id', auth, upload.single('imagem'), produtos.atualizarProduto);
router.delete('/deletarproduto/:id', auth, produtos.deletarProduto);
router.post('/adicionarproduto', auth, upload.single('imagem'), produtos.adicionarProduto);
router.get('/tiposproduto', auth, produtos.listarTiposDeProduto);

module.exports = router;
