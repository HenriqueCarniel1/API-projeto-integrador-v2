const router = require('express').Router();
const auth = require('../middleware/auth');
const usuarios = require('../controller/UsuariosController');
const produtos = require('../controller/ProdutosController');
const favoritos = require('../controller/FavoritosController');
const carrinho = require('../controller/CarrinhoController');
const upload = require('../middleware/upload');

router.post('/login', usuarios.login);
router.post('/criarconta', usuarios.criarConta);
router.get('/perfil', auth, usuarios.perfil);
router.put('/atualizarperfil', auth, usuarios.atualizarPerfil);

router.get('/listarprodutos', auth, produtos.listarprodutos);
router.put('/atualizarproduto/:id', auth, upload.single('imagem'), produtos.atualizarProduto);
router.delete('/deletarproduto/:id', auth, produtos.deletarProduto);
router.post('/adicionarproduto', auth, upload.single('imagem'), produtos.adicionarProduto);
router.get('/tiposproduto', auth, produtos.listarTiposDeProduto);

router.get('/listar/favoritos', auth, favoritos.listar);
router.post('/adicionar/favoritos/:produtoId', auth, favoritos.adicionar);
router.delete('/deletar/favoritos/:produtoId', auth, favoritos.remover);

router.get('/listar/carrinho', auth, carrinho.listar);
router.post('/adicionar/carrinho/:produtoId', auth, carrinho.adicionar);
router.put('/atualizar/carrinho/:produtoId', auth, carrinho.atualizarQuantidade);
router.delete('/remover/carrinho/:produtoId', auth, carrinho.remover);

module.exports = router;
