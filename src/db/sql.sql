DROP TABLE IF EXISTS
  produto_favorito, carrinho_produto, produto_pedido, pagamento,
  cliente_forma_de_pagamento, telefone, endereco,
  produto, tipo_produto, unidade, forma_de_pagamento,
  favoritos, pedido, cliente, vendedor, usuarios
CASCADE;


CREATE TABLE usuarios (
  id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  senha VARCHAR NOT NULL,
  tipo_usuario VARCHAR(10) NOT NULL CHECK (tipo_usuario IN ('comprador','vendedor'))
);


CREATE TABLE cliente (
  id INT PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
  data_nasc DATE,
  status BOOLEAN DEFAULT TRUE
);

CREATE TABLE vendedor (
  id INT PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
  cpf BIGINT UNIQUE,
  data_nasc DATE
);


CREATE TABLE unidade (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome VARCHAR NOT NULL
);

CREATE TABLE tipo_produto (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome VARCHAR NOT NULL
);

CREATE TABLE forma_de_pagamento (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome VARCHAR NOT NULL
);


CREATE TABLE endereco (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fk_cliente_id INT REFERENCES cliente(id) ON DELETE CASCADE,
  fk_unidade_id INT REFERENCES unidade(id) ON DELETE CASCADE,
  rua VARCHAR, cep BIGINT
);

CREATE TABLE telefone (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fk_cliente_id INT REFERENCES cliente(id) ON DELETE CASCADE,
  numero BIGINT, principal BOOLEAN DEFAULT TRUE
);

CREATE TABLE cliente_forma_de_pagamento (
  fk_cliente_id INT REFERENCES cliente(id) ON DELETE CASCADE,
  fk_forma_pagamento_id INT REFERENCES forma_de_pagamento(id) ON DELETE CASCADE,
  PRIMARY KEY (fk_cliente_id,fk_forma_pagamento_id)
);


CREATE TABLE produto (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome VARCHAR NOT NULL,
  preco NUMERIC(10,2) NOT NULL,
  data_vencimento DATE,    
  descricao VARCHAR,
  quantidade INT,
  fk_tipo_produto_id INT REFERENCES tipo_produto(id),
  fk_vendedor_id INT REFERENCES vendedor(id)
);

CREATE TABLE pedido (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  valor_total NUMERIC(10,2),
  fk_cliente_id INT REFERENCES cliente(id),
  fk_unidade_id INT REFERENCES unidade(id),
  data_pedido DATE DEFAULT CURRENT_DATE
);

CREATE TABLE produto_pedido (
  fk_pedido_id INT REFERENCES pedido(id) ON DELETE CASCADE,
  fk_produto_id INT REFERENCES produto(id) ON DELETE CASCADE,
  quantidade INT,
  preco_unitario NUMERIC(10,2),
  PRIMARY KEY (fk_pedido_id,fk_produto_id)
);

CREATE TABLE pagamento (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fk_pedido_id INT REFERENCES pedido(id) ON DELETE CASCADE,
  fk_forma_pagamento_id INT REFERENCES forma_de_pagamento(id),
  valor NUMERIC(10,2),
  status VARCHAR(20) DEFAULT 'confirmado'
);

CREATE TABLE favoritos (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fk_cliente_id INT REFERENCES cliente(id)
);

CREATE TABLE produto_favorito (
  fk_produto_id INT REFERENCES produto(id) ON DELETE CASCADE,
  fk_favoritos_id INT REFERENCES favoritos(id) ON DELETE CASCADE,
  PRIMARY KEY (fk_produto_id,fk_favoritos_id)
);

CREATE TABLE carrinho_produto (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fk_produto_id INT REFERENCES produto(id) ON DELETE CASCADE,
  fk_cliente_id INT REFERENCES cliente(id) ON DELETE CASCADE,
  quantidade INT,
  valor_total_item NUMERIC(10,2)
);


INSERT INTO unidade (nome) VALUES
('Unid. Norte'),('Unid. Sul'),('Unid. Leste'),('Unid. Oeste'),('Unid. Centro'),
('Unid. A'),('Unid. B'),('Unid. C'),('Unid. D'),('Unid. E');

INSERT INTO tipo_produto (nome) VALUES
('Hortaliça'),('Fruta'),('Grão'),('Laticínio'),('Panificado'),
('Carne'),('Bebida'),('Doce'),('Cereal'),('Leguminosa');

INSERT INTO forma_de_pagamento (nome) VALUES
('PIX'),('Dinheiro'),('Cartão Crédito');

INSERT INTO usuarios (nome,email,senha,tipo_usuario) VALUES
('Carlos Silva','carlos@mail.com','senha','vendedor'),
('Ana Oliveira','ana@mail.com','senha','vendedor'),
('Marcos Souza','marcos@mail.com','senha','vendedor'),
('Juliana Rocha','juliana@mail.com','senha','vendedor'),
('Fernando Castro','fernando@mail.com','senha','vendedor'),
('Patrícia Gomes','patricia@mail.com','senha','vendedor'),
('Ricardo Lima','ricardo@mail.com','senha','vendedor'),
('Camila Duarte','camila@mail.com','senha','vendedor'),
('Luciano Fernandes','luciano@mail.com','senha','vendedor'),
('Beatriz Almeida','beatriz@mail.com','senha','vendedor'),
('João Mendes','joao@mail.com','senha','comprador'),
('Larissa Costa','larissa@mail.com','senha','comprador'),
('Thiago Martins','thiago@mail.com','senha','comprador'),
('Renata Lima','renata@mail.com','senha','comprador'),
('Eduardo Freitas','eduardo@mail.com','senha','comprador'),
('Viviane Teixeira','viviane@mail.com','senha','comprador'),
('Gabriel Souza','gabriel@mail.com','senha','comprador'),
('Isabela Ramos','isabela@mail.com','senha','comprador'),
('Rafael Santos','rafael@mail.com','senha','comprador'),
('Daniela Borges','daniela@mail.com','senha','comprador');

INSERT INTO vendedor (id,cpf,data_nasc) VALUES
(1,11111111111,'1990-01-01'),
(2,22222222222,'1990-02-01'),
(3,33333333333,'1990-03-01'),
(4,44444444444,'1990-04-01'),
(5,55555555555,'1990-05-01'),
(6,66666666666,'1990-06-01'),
(7,77777777777,'1990-07-01'),
(8,88888888888,'1990-08-01'),
(9,99999999999,'1990-09-01'),
(10,10101010101,'1990-10-01');

INSERT INTO cliente (id,data_nasc) VALUES
(11,'2000-01-11'),(12,'2000-02-12'),(13,'2000-03-13'),(14,'2000-04-14'),(15,'2000-05-15'),
(16,'2000-06-16'),(17,'2000-07-17'),(18,'2000-08-18'),(19,'2000-09-19'),(20,'2000-10-20');

INSERT INTO endereco (fk_cliente_id,fk_unidade_id,rua,cep) VALUES
(11,1,'Rua A',70000000),(12,2,'Rua B',70000001),(13,3,'Rua C',70000002),
(14,4,'Rua D',70000003),(15,5,'Rua E',70000004),(16,6,'Rua F',70000005),
(17,7,'Rua G',70000006),(18,8,'Rua H',70000007),(19,9,'Rua I',70000008),
(20,10,'Rua J',70000009);

INSERT INTO telefone (fk_cliente_id,numero) VALUES
(11,61911111111),(12,61922222222),(13,61933333333),(14,61944444444),(15,61955555555),
(16,61966666666),(17,61977777777),(18,61988888888),(19,61999999999),(20,61800000000);

INSERT INTO cliente_forma_de_pagamento VALUES
(11,1),(11,2),(12,1),(13,2),(14,1),
(15,3),(16,1),(17,2),(18,3),(19,1);

INSERT INTO produto (id,nome,preco,data_vencimento,fk_tipo_produto_id,fk_vendedor_id)
OVERRIDING SYSTEM VALUE VALUES
(1,'Tomate',   5.50,'2025-07-01',1,1),
(2,'Banana',   3.25,'2025-06-25',2,2),
(3,'Feijão',   7.80,'2025-12-01',3,3),
(4,'Queijo',  15.90,'2025-08-15',4,4),
(5,'Pão',      1.20,'2025-06-20',5,5),
(6,'Frango',  18.50,'2025-07-10',6,6),
(7,'Suco',     4.70,'2025-09-30',7,7),
(8,'Bolo',    22.00,'2025-06-18',8,8),
(9,'Aveia',    6.30,'2026-01-01',9,9),
(10,'Lentilha',9.10,'2025-11-11',10,10);

INSERT INTO pedido (valor_total,fk_cliente_id,fk_unidade_id,data_pedido) VALUES
(35.00,11,1,'2025-06-01'),(28.50,12,2,'2025-06-02'),(50.00,13,3,'2025-06-03'),
(44.10,14,4,'2025-06-04'),(60.20,15,5,'2025-06-05'),
(25.40,16,6,'2025-06-06'),(55.00,17,7,'2025-06-07'),
(19.20,18,8,'2025-06-08'),(80.00,19,9,'2025-06-09'),(42.60,20,10,'2025-06-10');

INSERT INTO produto_pedido VALUES
(1,1,1,35.00),(2,2,2,14.25),(3,3,2,25.00),(4,4,2,22.05),(5,5,5,12.04),
(6,6,2,12.70),(7,7,5,11.00),(8,8,1,19.20),(9,9,1,80.00),(10,10,4,10.65);

INSERT INTO pagamento (fk_pedido_id,fk_forma_pagamento_id,valor) VALUES
(1,1,35.00),(2,2,28.50),(3,1,50.00),(4,2,44.10),(5,3,60.20),
(6,1,25.40),(7,2,55.00),(8,3,19.20),(9,1,80.00),(10,2,42.60);

INSERT INTO favoritos (fk_cliente_id) VALUES
(11),(12),(13),(14),(15),(16),(17),(18),(19),(20);

INSERT INTO produto_favorito VALUES
(1,1),(2,2),(3,3),(4,4),(5,5),(6,6),(7,7),(8,8),(9,9),(10,10);

INSERT INTO carrinho_produto (fk_produto_id,fk_cliente_id,quantidade,valor_total_item) VALUES
(1,11,1,35.00),(2,12,2,28.50),(3,13,1,50.00),(4,14,1,44.10),(5,15,3,36.60),
(6,16,1,18.50),(7,17,2,9.40),(8,18,1,22.00),(9,19,1,6.30),(10,20,1,9.10);
