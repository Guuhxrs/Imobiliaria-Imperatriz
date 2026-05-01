-- Verificar se o admin existe
SELECT * FROM administradores;

-- Se não existir, inserir novamente
INSERT INTO administradores (email, nome, senha_hash) 
VALUES (
  'admin@imperatriz.com',
  'Administrador',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
)
ON CONFLICT (email) DO NOTHING;