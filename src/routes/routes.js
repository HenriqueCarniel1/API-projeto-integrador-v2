const express = require('express');
const Router = express.Router();

// Controllers
const usuarios = require('../controller/UsuariosController');
const produtos = require('../controller/ProdutosController');

// Rotas de usuários
Router.post('/login', usuarios.login);
Router.post('/criarconta', usuarios.criarConta);

// Rotas de produtos
Router.get('/listarprodutos', produtos.listarprodutos);
Router.put('/atualizarproduto/:id', produtos.atualizarProduto);
Router.delete('/deletarproduto/:id', produtos.deletarProduto);
Router.delete('/adicionarproduto', produtos.deletarProduto);

module.exports = Router;
