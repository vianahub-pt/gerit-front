CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    morada TEXT,
    nif VARCHAR(20),
    telefone VARCHAR(20),
    email VARCHAR(255),
    consentimento VARCHAR(20) NOT NULL DEFAULT 'Pendente',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
