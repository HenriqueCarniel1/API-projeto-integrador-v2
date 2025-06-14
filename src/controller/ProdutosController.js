const db = require('../db/db');

class ProdutosController {

    async listarprodutos(req, res) {
        try {
            const sql = `
            SELECT p.id,
                   p.nome,
                   p.preco,
                   to_char(p.data_vencimento, 'YYYY-MM-DD') AS data_vencimento,
                   p.descricao,
                   p.ativo,
                   p.quantidade,
                   COALESCE(tp.nome, 'Sem categoria') AS tipo_produto,
                   COALESCE(v.nome, 'Sem vendedor')   AS vendedor
            FROM   produto      p
            LEFT   JOIN tipo_produto tp ON tp.id = p.fk_tipo_produto_id
            LEFT   JOIN vendedor     v  ON v.id  = p.fk_vendedor_id
            ORDER  BY p.id DESC;
            `;

            const { rows } = await db.query(sql);
            return res.status(200).json(rows);

        } catch (err) {
            console.error('listarprodutos:', err);
            return res.status(500).json({ message: 'Erro interno ao listar produtos.', detalhe: err.message });
        }
    }

    async atualizarProduto(req, res) {
        const { id } = req.params;
        const { nome, descricao, preco } = req.body;

        try {
            const result = await db.query(
                `UPDATE produto
                 SET nome = $1, descricao = $2, preco = $3
                 WHERE id = $4`,
                [nome, descricao, preco, id]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Produto não encontrado.' });
            }

            return res.status(200).json({ message: 'Produto atualizado com sucesso.' });

        } catch (err) {
            console.error('atualizarProduto:', err);
            return res.status(500).json({ message: 'Erro interno ao atualizar produto.' });
        }
    }

    async deletarProduto(req, res) {
        const { id } = req.params;

        try {
            const result = await db.query(
                `DELETE FROM produto WHERE id = $1`, [id]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Produto não encontrado.' });
            }

            return res.status(200).json({ message: 'Produto excluído com sucesso.' });

        } catch (err) {
            console.error('deletarProduto:', err);
            return res.status(500).json({ message: 'Erro interno ao excluir produto.' });
        }
    }

    async adicionarProduto(req, res) {
        const {
            nome,
            preco,
            data_producao,
            descricao,
            estabelecimento,
            whatsapp
        } = req.body;

        try {
            const vendedorQuery = await db.query(
                `SELECT id FROM vendedor WHERE nome = $1 LIMIT 1`, [estabelecimento]
            );

            if (vendedorQuery.rows.length === 0) {
                return res.status(404).json({ message: 'Vendedor não encontrado.' });
            }

            const fk_vendedor_id = vendedorQuery.rows[0].id;

            await db.query(
                `INSERT INTO produto (nome, preco, data_de_vencimento, descricao, ativo, quantidade, fk_vendedor_id)
             VALUES ($1, $2, $3, $4, TRUE, 1, $5)`,
                [nome, preco, data_producao, descricao, fk_vendedor_id]
            );

            return res.status(201).json({ message: 'Produto cadastrado com sucesso.' });

        } catch (err) {
            console.error('adicionarProduto:', err);
            return res.status(500).json({ message: 'Erro interno ao cadastrar produto.', detalhe: err.message });
        }
    }

}

module.exports = new ProdutosController();
