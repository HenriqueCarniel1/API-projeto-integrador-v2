const db = require('../db/db');

class ProdutosController {

    async listarprodutos(req, res) {
        const { id: usrId, tipo } = req.user;

        let sql = `
        SELECT 
            p.id, 
            p.imagem,
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
                imagem_url: r.imagem ? `${req.protocol}://${req.get('host')}/src/img/${r.imagem}` : null,
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
        const { id: usrId, tipo } = req.user;

        if (tipo !== 'vendedor')
            return res.status(403).json({ message: 'Apenas vendedores podem editar.' });

        const {
            nome,
            preco,
            data_vencimento,
            descricao,
            quantidade,
            fk_tipo_produto_id
        } = req.body;
        const imagem = req.file?.filename || null;

        try {
            const sql = `
                UPDATE produto
                    SET nome               = $1,
                        preco              = $2,
                        data_vencimento    = $3,
                        descricao          = $4,
                        quantidade         = $5,
                        fk_tipo_produto_id = $6,
                        imagem             = COALESCE($7, imagem) -- só troca se veio arquivo
                WHERE id               = $8
                    AND fk_vendedor_id    = $9
            `;
            const params = [
                nome, preco, data_vencimento || null, descricao,
                quantidade, fk_tipo_produto_id, imagem,
                prodId, usrId
            ];

            const r = await db.query(sql, params);
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
        const { nome, preco, data_vencimento, descricao, quantidade, fk_tipo_produto_id } = req.body;
        const { id: usrId, tipo } = req.user;
        const imagem = req.file?.filename;

        if (tipo !== 'vendedor')
            return res.status(403).json({ message: 'Apenas vendedores podem cadastrar.' });

        try {
            await db.query(
                `INSERT INTO produto (nome, preco, data_vencimento, descricao, quantidade, imagem, fk_vendedor_id,fk_tipo_produto_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [nome, preco, data_vencimento || null, descricao, quantidade, imagem, usrId, fk_tipo_produto_id]
            );
            res.status(201).json({ message: 'Produto cadastrado.' });
        } catch (err) {
            console.error('adicionarProduto:', err);
            res.status(500).json({ message: 'Erro interno.' });
        }
    }

    async listarTiposDeProduto(req, res) {
        try {
            const { rows } = await db.query('SELECT id, nome FROM tipo_produto ORDER BY nome');
            res.status(200).json(rows);
        } catch (err) {
            console.error('listarTiposDeProduto:', err);
            res.status(500).json({ message: 'Erro ao buscar tipos de produto.' });
        }
    }


}

module.exports = new ProdutosController();
