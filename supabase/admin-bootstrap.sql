-- ============================================
-- SCRIPT BOOTSTRAP - Primeiro Administrador
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================

-- 1. Criar tabela de administradores (se não existir)
CREATE TABLE IF NOT EXISTS administradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nome TEXT,
  senha_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Inserir primeiro administrador
-- Login: admin@imperatriz.com
-- Senha: admin123
INSERT INTO administradores (email, nome, senha_hash) 
VALUES (
  'admin@imperatriz.com',
  'Administrador',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
)
ON CONFLICT (email) DO NOTHING;

-- 3. Verificar criação
SELECT id, email, nome, created_at FROM administradores;