/* src/controller/UsuariosController.js */
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/db');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

class UsuariosController {

    async criarConta(req, res) {
        const {
            nome,
            email,
            senha,
            tipoUsuario,
            cpf,
            data_nasc
        } = req.body;

        if (!['comprador', 'vendedor'].includes(tipoUsuario))
            return res.status(400).json({ message: 'tipoUsuario deve ser "comprador" ou "vendedor"' });

        try {
            const existe = await db.query('SELECT 1 FROM usuarios WHERE email = $1', [email]);
            if (existe.rowCount) return res.status(409).json({ message: 'Email já cadastrado' });

            const hash = await bcrypt.hash(senha, 10);

            await db.query('BEGIN');

            const { rows: [usuario] } = await db.query(
                `INSERT INTO usuarios (nome, email, senha, tipo_usuario)
                VALUES ($1, $2, $3, $4)
                RETURNING id, nome, email, tipo_usuario`,
                [nome, email, hash, tipoUsuario]
            );

            if (tipoUsuario === 'comprador') {
                await db.query(
                    `INSERT INTO cliente (id, data_nasc, status)
                    VALUES ($1, $2, TRUE)`,
                    [usuario.id, data_nasc || null]
                );
            } else {
                await db.query(
                    `INSERT INTO vendedor (id, cpf, data_nasc)
                    VALUES ($1, $2, $3)`,
                    [usuario.id, cpf || null, data_nasc || null]
                );
            }

            await db.query('COMMIT');

            return res.status(201).json({
                message: 'Usuário criado com sucesso',
                usuario
            });
        } catch (err) {
            await db.query('ROLLBACK');
            console.error('Erro ao criar conta:', err);
            return res.status(500).json({ message: 'Erro interno no servidor' });
        }
    }

    async login(req, res) {
        const { email, senha } = req.body;

        try {
            const { rows: [usuario] } = await db.query(
                `SELECT id, nome, email, senha, tipo_usuario
                FROM usuarios
                WHERE email = $1`,
                [email]
            );

            if (!usuario)
                return res.status(404).json({ message: 'E-mail não encontrado' });

            const ok = await bcrypt.compare(senha, usuario.senha);
            if (!ok)
                return res.status(401).json({ message: 'Senha incorreta' });

            const payload = {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo_usuario
            };

            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

            return res.status(200).json({
                message: 'Login realizado com sucesso',
                token,
                usuario: payload
            });
        } catch (err) {
            console.error('Erro no login:', err);
            return res.status(500).json({ message: 'Erro interno no servidor' });
        }
    }
}

module.exports = new UsuariosController();
