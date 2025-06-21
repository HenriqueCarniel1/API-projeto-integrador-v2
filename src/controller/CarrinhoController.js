const db = require('../db/db');

class CarrinhoController {

  async listar(req, res) {
    const { id: clienteId } = req.user;

    try {
      const { rows } = await db.query(`
        SELECT
          cp.fk_produto_id  AS produto_id,
          p.nome,
          p.preco,
          cp.quantidade,
          cp.valor_total_item,
          p.imagem,          -- BYTEA
          p.mime             -- ex.: image/jpeg
        FROM   carrinho_produto cp
        JOIN   produto p ON p.id = cp.fk_produto_id
        WHERE  cp.fk_cliente_id = $1
        ORDER  BY cp.id DESC
      `, [clienteId]);

      const lista = rows.map(r => {
        let imagem_url = null;

        if (r.imagem) {
          const b64 = r.imagem.toString('base64');
          imagem_url = `data:${r.mime};base64,${b64}`;
        }

        delete r.imagem;
        delete r.mime;

        return { ...r, imagem_url };
      });

      res.json(lista);
    } catch (err) {
      console.error('listar carrinho:', err);
      res.status(500).json({ message: 'Erro ao listar carrinho.' });
    }
  }

  async adicionar(req, res) {
    const { produtoId } = req.params;
    const clienteId = req.user.id;

    try {
      const { rows: prod } = await db.query(
        'SELECT preco FROM produto WHERE id = $1',
        [produtoId]
      );
      if (!prod.length)
        return res.status(404).json({ message: 'Produto não encontrado.' });

      const preco = prod[0].preco;

      await db.query(`
        INSERT INTO carrinho_produto
          (fk_produto_id, fk_cliente_id, quantidade, valor_total_item)
        VALUES ($1, $2, 1, $3)
        ON CONFLICT (fk_produto_id, fk_cliente_id)
        DO UPDATE SET
          quantidade       = carrinho_produto.quantidade + 1,
          valor_total_item = (carrinho_produto.quantidade + 1) * EXCLUDED.valor_total_item
      `, [produtoId, clienteId, preco]);

      res.status(201).json({ message: 'Produto adicionado ao carrinho.' });
    } catch (err) {
      console.error('adicionar carrinho:', err);
      res.status(500).json({ message: 'Erro ao adicionar ao carrinho.' });
    }
  }

  async atualizarQuantidade(req, res) {
    const { produtoId } = req.params;
    const { quantidade } = req.body;
    const clienteId = req.user.id;

    if (!Number.isInteger(quantidade) || quantidade < 0)
      return res.status(400).json({ message: 'Quantidade inválida.' });

    try {
      if (quantidade === 0) {
        await db.query(`
          DELETE FROM carrinho_produto
          WHERE fk_cliente_id = $1 AND fk_produto_id = $2
        `, [clienteId, produtoId]);
        return res.json({ message: 'Produto removido do carrinho.' });
      }

      const { rows: prod } = await db.query(
        'SELECT preco FROM produto WHERE id = $1',
        [produtoId]
      );
      if (!prod.length)
        return res.status(404).json({ message: 'Produto não encontrado.' });

      const preco = prod[0].preco;

      await db.query(`
        INSERT INTO carrinho_produto
          (fk_produto_id, fk_cliente_id, quantidade, valor_total_item)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (fk_produto_id, fk_cliente_id)
        DO UPDATE SET
          quantidade       = EXCLUDED.quantidade,
          valor_total_item = EXCLUDED.quantidade * $4
      `, [produtoId, clienteId, quantidade, preco]);

      res.json({ message: 'Quantidade atualizada.' });
    } catch (err) {
      console.error('atualizarQuantidade:', err);
      res.status(500).json({ message: 'Erro ao atualizar quantidade.' });
    }
  }

  async remover(req, res) {
    const { produtoId } = req.params;
    const clienteId = req.user.id;

    try {
      await db.query(`
        DELETE FROM carrinho_produto
        WHERE fk_cliente_id = $1 AND fk_produto_id = $2
      `, [clienteId, produtoId]);

      res.json({ message: 'Item removido do carrinho.' });
    } catch (err) {
      console.error('remover carrinho:', err);
      res.status(500).json({ message: 'Erro ao remover item.' });
    }
  }
}

module.exports = new CarrinhoController();
