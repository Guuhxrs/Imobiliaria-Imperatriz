-- Debug: Verificar usuários e senhas
SELECT 
  id, 
  email, 
  nome, 
  created_at,
  -- Mostrar os primeiros 20 chars do hash
  substring(senha_hash, 1, 20) as hash_inicio
FROM administradores;

-- Testar se o hash da senha admin123 bate
-- Hash de 'admin123' é: 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9

SELECT * FROM administradores 
WHERE senha_hash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';