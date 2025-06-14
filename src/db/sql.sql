/* =======================================================
   ⚠️  ZERA TUDO (com dependências)
   ======================================================= */
DROP TABLE IF EXISTS
    produto_favorito,
    carrinho_produto,
    produto_pedido,
    cliente_forma_de_pagamento,
    telefone,
    endereco,
    produto,
    tipo_produto,
    unidade,
    forma_de_pagamento,
    favoritos,
    pedido,
    cliente,
    vendedor
CASCADE;

/* =======================================================
   ► TABELAS PRINCIPAIS
   ======================================================= */
CREATE TABLE vendedor (
    id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome        VARCHAR NOT NULL,
    cpf         BIGINT UNIQUE,
    data_nasc   DATE,
    email       VARCHAR
);

CREATE TABLE cliente (
    id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome            VARCHAR NOT NULL,
    email           VARCHAR UNIQUE,
    senha           VARCHAR,
    data_nasc       DATE,
    valor_total     NUMERIC(10,2) DEFAULT 0,
    status          BOOLEAN       DEFAULT TRUE,
    data_criacao    DATE          DEFAULT CURRENT_DATE,
    data_confirmacao DATE,
    data_adicao     DATE,
    atualizado_em   DATE
);

CREATE TABLE unidade (
    id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR NOT NULL
);

CREATE TABLE tipo_produto (
    id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR NOT NULL
);

CREATE TABLE forma_de_pagamento (
    id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR NOT NULL
);

/* =======================================================
   ► ENDEREÇO, TELEFONE, CLIENTE × FORMA DE PAGAMENTO
   ======================================================= */
CREATE TABLE endereco (
    id                  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    complemento         VARCHAR,
    referencia          VARCHAR,
    cep                 BIGINT,
    rua                 VARCHAR,
    fk_cliente_id       INT REFERENCES cliente(id) ON DELETE CASCADE,
    fk_unidade_id       INT REFERENCES unidade(id) ON DELETE CASCADE
);

CREATE TABLE telefone (
    id                  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    numero              BIGINT,
    tipo                VARCHAR,
    principal           BOOLEAN DEFAULT FALSE,
    fk_cliente_id       INT REFERENCES cliente(id) ON DELETE CASCADE,
    fk_unidade_id       INT REFERENCES unidade(id) ON DELETE CASCADE
);

CREATE TABLE cliente_forma_de_pagamento (
    fk_cliente_id           INT REFERENCES cliente(id)          ON DELETE CASCADE,
    fk_forma_pagamento_id   INT REFERENCES forma_de_pagamento(id) ON DELETE CASCADE,
    PRIMARY KEY (fk_cliente_id, fk_forma_pagamento_id)
);

/* =======================================================
   ► PRODUTO e RELAÇÕES DEPENDENTES
   ======================================================= */
CREATE TABLE produto (
    id                  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome                VARCHAR NOT NULL,
    preco               NUMERIC(10,2) NOT NULL,
    data_vencimento     DATE,
    descricao           TEXT,
    imagem              BYTEA,
    ativo               BOOLEAN DEFAULT TRUE,
    quantidade          INT,
    fk_tipo_produto_id  INT REFERENCES tipo_produto(id) ON DELETE CASCADE,
    fk_vendedor_id      INT REFERENCES vendedor(id)    ON DELETE CASCADE
);

CREATE TABLE pedido (
    id                  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    valor_total         NUMERIC(10,2),
    valor_frete         NUMERIC(10,2),
    data_pedido         DATE DEFAULT CURRENT_DATE,
    fk_cliente_id       INT REFERENCES cliente(id) ON DELETE CASCADE
);

CREATE TABLE produto_pedido (
    fk_pedido_id    INT REFERENCES pedido(id)  ON DELETE CASCADE,
    fk_produto_id   INT REFERENCES produto(id) ON DELETE CASCADE,
    preco_unitario  NUMERIC(10,2),
    subtotal        NUMERIC(10,2),
    PRIMARY KEY (fk_pedido_id, fk_produto_id)
);

CREATE TABLE favoritos (
    id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fk_cliente_id   INT REFERENCES cliente(id) ON DELETE CASCADE
);

CREATE TABLE produto_favorito (
    fk_produto_id   INT REFERENCES produto(id)    ON DELETE CASCADE,
    fk_favoritos_id INT REFERENCES favoritos(id)  ON DELETE CASCADE,
    PRIMARY KEY (fk_produto_id, fk_favoritos_id)
);

CREATE TABLE carrinho_produto (
    id                      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fk_produto_id           INT REFERENCES produto(id)  ON DELETE CASCADE,
    fk_cliente_id           INT REFERENCES cliente(id)  ON DELETE CASCADE,
    quantidade              INT,
    preco_unitario          NUMERIC(10,2),
    observacao              VARCHAR,
    valor_total_item        NUMERIC(10,2)
);

/* =======================================================
   ► DADOS EXEMPLO (sem IDs fixos)
   ======================================================= */

/* UNIDADE */
INSERT INTO unidade (nome) VALUES
 ('Unidade Central'), ('Unidade Norte'), ('Unidade Sul');

/* TIPO_PRODUTO */
INSERT INTO tipo_produto (nome) VALUES
 ('Padaria'), ('Bebidas'), ('Confeitaria');

/* FORMA_DE_PAGAMENTO */
INSERT INTO forma_de_pagamento (nome) VALUES
 ('Cartão de Crédito'), ('Dinheiro'), ('Pix');

/* VENDEDOR */
INSERT INTO vendedor (nome, cpf, data_nasc, email) VALUES
 ('João Padeiro',     12345678901, '1985-04-12', 'joao@padaria.com'),
 ('Maria Confeiteira',98765432100, '1990-09-23', 'maria@doces.com'),
 ('Carlos Bebidas',   45678912311, '1982-02-28', 'carlos@bebidas.com');

/* CLIENTE */
INSERT INTO cliente (nome, email, senha, data_nasc, valor_total, status,
                     data_confirmacao, data_adicao, atualizado_em) VALUES
 ('Ana Clara',    'ana@mail.com',   'senha123', '1995-06-15', 120.00, TRUE , '2024-06-02','2024-06-01','2024-06-10'),
 ('Bruno Marques','bruno@mail.com', 'abc123',   '1988-11-03', 250.50, FALSE,  NULL       ,'2024-06-03','2024-06-07'),
 ('Carla Souza',  'carla@mail.com', 'pass456',  '1992-01-20',  89.99, TRUE , '2024-06-07','2024-06-07','2024-06-09');

/* ENDEREÇO */
INSERT INTO endereco (complemento, referencia, cep, rua, fk_cliente_id, fk_unidade_id) VALUES
 ('Apto 202','Próx. à praça', 70300123,'Rua das Flores, 10', 1, 1);

/* PRODUTO */
INSERT INTO produto (nome, preco, data_vencimento, descricao, quantidade,
                     fk_tipo_produto_id, fk_vendedor_id) VALUES
 ('Pão Francês', 5.00,  '2024-12-01', 'Pacote c/10 un.', 100, 1, 1),
 ('Bolo Cenoura',12.50, '2024-07-10', 'Cobertura chocolate', 20, 3, 2);

/* FAVORITOS + PRODUTO_FAVORITO */
INSERT INTO favoritos (fk_cliente_id) VALUES (1);
INSERT INTO produto_favorito VALUES (1, 1);          -- produto_id 1 ⇄ favoritos_id 1

/* CARRINHO_PRODUTO */
INSERT INTO carrinho_produto (fk_produto_id, fk_cliente_id,
                              quantidade, preco_unitario, valor_total_item)
VALUES (1, 1, 2, 5.00, 10.00);

SELECT * FROM cliente;
