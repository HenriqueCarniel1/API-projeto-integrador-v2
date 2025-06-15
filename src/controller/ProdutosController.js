const db = require('../db/db');

class ProdutosController {

    async listarprodutos(req, res) {
        const { id: usrId, tipo } = req.user;

        let sql = `
        SELECT 
            p.id, 
            p.nome, 
            p.preco,
            to_char(p.data_vencimento,'YYYY-MM-DD') AS data_vencimento,
            p.descricao, 
            p.quantidade,
            COALESCE(tp.nome, 'Sem categoria') AS tipo_produto,
            COALESCE(u.nome, 'Sem vendedor')   AS vendedor
        FROM produto p
        LEFT JOIN tipo_produto tp ON tp.id = p.fk_tipo_produto_id
        LEFT JOIN vendedor v       ON v.id = p.fk_vendedor_id
        LEFT JOIN usuarios u       ON u.id = v.id
    `;

        const params = [];
        if (tipo === 'vendedor') {
            sql += 'WHERE p.fk_vendedor_id = $1 ';
            params.push(usrId);
        }

        sql += 'ORDER BY p.id DESC';

        try {
            const { rows } = await db.query(sql, params);

            const lista = rows.map(r => ({
                ...r,
                pode_editar: tipo === 'vendedor'
            }));

            res.json(lista);
        } catch (err) {
            console.error('listarprodutos:', err);
            res.status(500).json({ message: 'Erro interno ao listar produtos.' });
        }
    }

    async atualizarProduto(req, res) {
        const { id: prodId } = req.params;
        const { nome, descricao, preco } = req.body;
        const { id: usrId, tipo } = req.user;

        if (tipo !== 'vendedor')
            return res.status(403).json({ message: 'Apenas vendedores podem editar.' });

        try {
            const r = await db.query(
                `UPDATE produto
                SET nome=$1, descricao=$2, preco=$3
                WHERE id=$4 AND fk_vendedor_id=$5`,
                [nome, descricao, preco, prodId, usrId]
            );
            if (!r.rowCount)
                return res.status(404).json({ message: 'Produto não encontrado ou sem permissão.' });

            res.json({ message: 'Atualizado com sucesso.' });
        } catch (err) {
            console.error('atualizarProduto:', err);
            res.status(500).json({ message: 'Erro interno.' });
        }
    }

    async deletarProduto(req, res) {
        const { id: prodId } = req.params;
        const { id: usrId, tipo } = req.user;

        if (tipo !== 'vendedor')
            return res.status(403).json({ message: 'Apenas vendedores podem excluir.' });

        try {
            const r = await db.query(
                `DELETE FROM produto WHERE id=$1 AND fk_vendedor_id=$2`,
                [prodId, usrId]
            );
            if (!r.rowCount)
                return res.status(404).json({ message: 'Produto não encontrado ou sem permissão.' });

            res.json({ message: 'Excluído com sucesso.' });
        } catch (err) {
            console.error('deletarProduto:', err);
            res.status(500).json({ message: 'Erro interno.' });
        }
    }

    async adicionarProduto(req, res) {
        const { nome, preco, data_vencimento, descricao } = req.body;
        const { id: usrId, tipo } = req.user;

        if (tipo !== 'vendedor')
            return res.status(403).json({ message: 'Apenas vendedores podem cadastrar.' });

        try {
            await db.query(
                `INSERT INTO produto (nome,preco,data_vencimento,descricao,ativo,quantidade,fk_vendedor_id)
                VALUES ($1,$2,$3,$4,TRUE,1,$5)`,
                [nome, preco, data_vencimento || null, descricao, usrId]
            );
            res.status(201).json({ message: 'Produto cadastrado.' });
        } catch (err) {
            console.error('adicionarProduto:', err);
            res.status(500).json({ message: 'Erro interno.' });
        }
    }
}

module.exports = new ProdutosController();
