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

                if (req.body.telefone) {
                    await db.query(
                        `INSERT INTO telefone (fk_vendedor_id, numero, principal)
                            VALUES ($1, $2, TRUE)`,
                        [usuario.id, req.body.telefone]
                    );
                }
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

    async perfil(req, res) {
        const { id } = req.user;

        try {
            const { rows: [u] } = await db.query(
                `SELECT  u.id,
                 u.nome,
                 u.email,
                 u.tipo_usuario,
                 c.data_nasc       AS cliente_data_nasc,
                 c.status          AS cliente_status,
                 v.cpf             AS vendedor_cpf,
                 v.data_nasc       AS vendedor_data_nasc
                FROM usuarios  u
                LEFT JOIN cliente   c ON c.id = u.id
                LEFT JOIN vendedor  v ON v.id = u.id
                WHERE u.id = $1`,
                [id]
            );

            if (!u) return res.status(404).json({ message: 'Usuário não encontrado' });

            const payload = {
                id: u.id,
                nome: u.nome,
                email: u.email,
                tipo: u.tipo_usuario,
                cpf: u.vendedor_cpf || null,
                data_nasc: u.cliente_data_nasc || u.vendedor_data_nasc || null,
                status: u.cliente_status
            };

            res.json(payload);
        } catch (err) {
            console.error('perfil:', err);
            res.status(500).json({ message: 'Erro interno' });
        }
    }

    async atualizarPerfil(req, res) {
        const { id } = req.user;
        const {
            nome,
            email,
            senha_atual,
            nova_senha,
            data_nasc,
            cpf,
            status
        } = req.body;

        try {
            if (nova_senha) {
                const { rows: [u] } = await db.query('SELECT senha FROM usuarios WHERE id=$1', [id]);
                if (!u) return res.status(404).json({ message: 'Usuário não encontrado' });
                const ok = await bcrypt.compare(senha_atual || '', u.senha);
                if (!ok) return res.status(401).json({ message: 'Senha atual incorreta' });
                await db.query('UPDATE usuarios SET senha=$2 WHERE id=$1',
                    [id, await bcrypt.hash(nova_senha, 10)]);
            }

            await db.query(`
                UPDATE usuarios
                    SET nome  = COALESCE($2,nome),
                        email = COALESCE($3,email)
                WHERE id = $1`,
                [id, nome || null, email || null]);

            const { rows: [user] } = await db.query('SELECT tipo_usuario FROM usuarios WHERE id=$1', [id]);

            if (user.tipo_usuario === 'comprador') {
                await db.query(`
                    UPDATE cliente
                    SET data_nasc = COALESCE($2,data_nasc),
                        status    = COALESCE($3,status)
                    WHERE id = $1`,
                    [id, data_nasc || null, status]);
            } else {
                await db.query(`
                    UPDATE vendedor
                    SET data_nasc = COALESCE($2,data_nasc),
                        cpf       = COALESCE($3,cpf)
                    WHERE id = $1`,
                    [id, data_nasc || null, cpf || null]);
            }
            return res.json({ message: 'Perfil atualizado com sucesso' });
        } catch (e) {
            if (e.code === '23505' && e.constraint === 'vendedor_cpf_key') {
                return res.status(409).json({ message: 'CPF já cadastrado' })
            }
            console.error('atualizarPerfil:', e);
            res.status(500).json({ message: 'Erro interno' });
        }
    }

}

module.exports = new UsuariosController();
