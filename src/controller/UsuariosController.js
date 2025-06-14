const bcrypt = require('bcrypt');
const db = require('../db/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

class UsuariosController {

    async criarConta(req, res) {
        const { nome, email, senha } = req.body;

        try {
            const existe = await db.query('SELECT * FROM cliente WHERE email = $1', [email]);
            if (existe.rows.length > 0) {
                return res.status(409).json({ message: 'Email já cadastrado' });
            }

            const senhaCriptografada = await bcrypt.hash(senha, 10);

            const novoCliente = await db.query(
                `INSERT INTO cliente (nome, email, senha, status, data_adicao, atualizado_em)
                 VALUES ($1, $2, $3, $4, CURRENT_DATE, CURRENT_DATE)
                 RETURNING id, nome, email`,
                [nome, email, senhaCriptografada, true]
            );

            res.status(201).json({
                message: 'Cliente criado com sucesso',
                cliente: novoCliente.rows[0]
            });

        } catch (error) {
            console.error('Erro ao criar cliente:', error);
            res.status(500).json({ message: 'Erro interno no servidor' });
        }
    }

    async login(req, res) {
        const { email, senha } = req.body;

        try {
            const { rows } = await db.query(
                'SELECT id, nome, email, senha FROM cliente WHERE email = $1',
                [email]
            );

            if (!rows.length) {
                return res.status(404).json({ message: 'E-mail não encontrado' });
            }

            const cliente = rows[0];
            const senhaOk = await bcrypt.compare(senha, cliente.senha);

            if (!senhaOk) {
                return res.status(401).json({ message: 'Senha incorreta' });
            }

            const payload = {
                id: cliente.id,
                nome: cliente.nome,
                email: cliente.email
            };

            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

            return res.status(200).json({
                message: 'Login realizado com sucesso',
                token,
                cliente: payload
            });

        } catch (err) {
            console.error('Erro no login:', err);
            return res.status(500).json({ message: 'Erro interno no servidor' });
        }
    }
}

module.exports = new UsuariosController();
