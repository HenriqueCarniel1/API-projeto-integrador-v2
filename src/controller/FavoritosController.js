const db = require('../db/db');

class FavoritosController {

    async listar(req, res) {
        const { id: clienteId } = req.user;

        try {
            const { rows } = await db.query(`
                SELECT p.*
                FROM favoritos f
                JOIN produto_favorito pf ON pf.fk_favoritos_id = f.id
                JOIN produto p          ON p.id = pf.fk_produto_id
                WHERE f.fk_cliente_id = $1
                ORDER BY p.id DESC
            `, [clienteId]);

            const baseUrl = `${req.protocol}://${req.get('host')}/src/img/`;

            const lista = rows.map(p => ({
                ...p,
                imagem_url: p.imagem ? baseUrl + p.imagem : null
            }));

            res.json(lista);
        } catch (e) {
            console.error('listar favoritos:', e);
            res.status(500).json({ message: 'Erro ao carregar favoritos' });
        }
    }

    async adicionar(req, res) {
        const { produtoId } = req.params;
        const { id: clienteId } = req.user;

        try {
            const { rows: fav } = await db.query(
                `INSERT INTO favoritos (fk_cliente_id)
                 VALUES ($1)
                 ON CONFLICT (fk_cliente_id) DO UPDATE SET fk_cliente_id = EXCLUDED.fk_cliente_id
                 RETURNING id`,
                [clienteId]
            );
            const favoritosId = fav[0].id;

            await db.query(
                `INSERT INTO produto_favorito (fk_produto_id, fk_favoritos_id)
                 VALUES ($1, $2)
                 ON CONFLICT DO NOTHING`,
                [produtoId, favoritosId]
            );

            res.status(201).json({ message: 'Produto adicionado aos favoritos' });
        } catch (e) {
            console.error('adicionar favorito:', e);
            res.status(500).json({ message: 'Erro ao adicionar favorito' });
        }
    }

    async remover(req, res) {
        const { produtoId } = req.params;
        const { id: clienteId } = req.user;

        try {
            await db.query(
                `DELETE FROM produto_favorito pf
                 USING favoritos f
                 WHERE pf.fk_produto_id = $1
                   AND f.fk_cliente_id = $2
                   AND pf.fk_favoritos_id = f.id`,
                [produtoId, clienteId]
            );
            res.json({ message: 'Removido dos favoritos' });
        } catch (e) {
            console.error('remover favorito:', e);
            res.status(500).json({ message: 'Erro ao remover favorito' });
        }
    }
}

module.exports = new FavoritosController();
