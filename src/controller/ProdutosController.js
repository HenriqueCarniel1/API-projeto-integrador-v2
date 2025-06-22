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
                COALESCE(u.nome, 'Sem vendedor')   AS vendedor,
                t.numero AS telefone_vendedor
            FROM produto p
            LEFT JOIN tipo_produto tp ON tp.id = p.fk_tipo_produto_id
            LEFT JOIN vendedor v      ON v.id  = p.fk_vendedor_id
            LEFT JOIN usuarios u      ON u.id  = v.id
            LEFT JOIN telefone t      ON t.fk_vendedor_id = v.id AND t.principal = TRUE
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
                imagem_url: r.imagem
                    ? `data:${r.mime};base64,${r.imagem.toString('base64')}`
                    : null,
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

        const novoBuffer = req.file?.buffer || null;
        const novoMime = req.file?.mimetype || null;

        try {
            const sql = `
                UPDATE produto
                    SET nome               = $1,
                        preco              = $2,
                        data_vencimento    = $3,
                        descricao          = $4,
                        quantidade         = $5,
                        fk_tipo_produto_id = $6,
                        imagem             = COALESCE($7, imagem),
                        mime               = COALESCE($8, mime)
                WHERE id              = $9
                    AND fk_vendedor_id   = $10
            `;

            const params = [
                nome,
                preco,
                data_vencimento || null,
                descricao,
                quantidade,
                fk_tipo_produto_id,
                novoBuffer,
                novoMime,
                prodId,
                usrId
            ];

            const { rowCount } = await db.query(sql, params);

            if (!rowCount)
                return res.status(404).json({ message: 'Produto não encontrado ou sem permissão.' });

            res.json({ message: 'Produto atualizado com sucesso.' });
        } catch (err) {
            console.error('atualizarProduto:', err);
            res.status(500).json({ message: 'Erro interno ao atualizar produto.' });
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
        const {
            nome,
            preco,
            data_vencimento,
            descricao,
            quantidade,
            fk_tipo_produto_id
        } = req.body;

        const { id: usrId, tipo } = req.user;
        const file = req.file;

        if (tipo !== 'vendedor')
            return res.status(403).json({ message: 'Apenas vendedores podem cadastrar.' });

        const imgBuffer = file ? file.buffer : null;
        const mimeType = file ? file.mimetype : null;

        const sql = `
            INSERT INTO produto
            (nome, preco, data_vencimento, descricao, quantidade,
            imagem, mime, fk_vendedor_id, fk_tipo_produto_id)
            VALUES
            ($1, $2, $3, $4, $5,
            $6, $7, $8, $9)
        `;

        try {
            await db.query(sql, [
                nome,
                preco,
                data_vencimento || null,
                descricao,
                quantidade,
                imgBuffer,
                mimeType,
                usrId,
                fk_tipo_produto_id
            ]);

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
