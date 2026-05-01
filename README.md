# 🏠 Imperatriz Imóveis

Uma aplicação web completa para gestão e divulgação de imóveis, desenvolvido com foco em performance, experiência do usuário e linguagem simples e acessível.

---

## 🚀 Demonstração

Acesse o site: **[imperatrizimoveis.com.br](https://imperatrizimoveis.com.br)** *(configure seu domínio)*

---

## 🎯 Funcionalidades

### Para clientes (público)
- **Busca de imóveis** com filtros por cidade, tipo de negócio (comprar/alugar) e tipo de imóvel
- **Catálogo de imóveis** com visualização de fotos, preços, características e descrição
- **Página de detalhes** com galeria de imagens e botão para WhatsApp
- **Formulário de contato** para mensagens diretas
- **Depoimentos** de clientes atendidos
- **Design responsivo** que funciona em mobile, tablet e desktop
- **Integração com WhatsApp** para contato direto

### Para administradores (painel interno)
- **Dashboard** com estatísticas do catálogo (total de imóveis, mensagens, preços)
- **Gerenciamento de imóveis** (criar, editar, excluir)
- **Upload de imagens** com múltiplas fotos por imóvel
- **Gestão de mensagens** recebidas pelo formulário de contato
- **Autenticação segura** com session gerenciada via servidor

---

## 🛠️ Tech Stack

### Frontend
- **HTML5 + JavaScript vanilla** (sem frameworks)
- **CSS3** com custom properties e Flexbox/Grid
- **Arquitetura SPA** com router baseado em hash
- **Supabase JS SDK** para buscar dados

### Backend
- **Node.js** com Express
- **Supabase** (PostgreSQL) como banco de dados
- **Session JWT** comHttpOnly cookies

### Infraestrutura
- **Supabase** para banco de dados e autenticação
- **Hospedagem própria** (servidor Node.js)

---

## 📂 Estrutura do Projeto

```
imperatriz-imoveis/
├── admin/                  # Páginas do painel administrativo
│   ├── dashboard.html
│   ├── editar-imovel.html
│   ├── imoveis.html
│   ├── login.html
│   └── mensagens.html
├── src/
│   ├── admin/             # JavaScript do painel admin
│   ├── api/              # Integrações com Supabase
│   ├── components/       # Componentes reutilizáveis (navbar, cards, etc)
│   ├── pages/           # Páginas do site público
│   ├── styles/          # CSS global
│   └── utils/           # Funções utilitárias
├── server/               # Servidor Express
├── supabase/           # Scripts SQL do banco
├── index.html          # Entry point público
└── package.json
```

---

## ⚡ Quick Start

### 1. Clone o projeto
```bash
git clone https://github.com/seu-usuario/imperatriz-imoveis.git
cd imperatriz-imoveis
```

### 2. Configure as variáveis de ambiente
Crie um arquivo `.env` baseado no `.env.example`:

```env
# Supabase (obrigatório)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon
SESSION_SECRET=uma-chave-secreta-random

# API (opcional, para produção)
API_BASE_URL=http://localhost:3000
CRON_API_KEY=sua-chave-cron
```

### 3. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute os scripts SQL em `supabase/` na ordem:
   - `admin-bootstrap.sql` — cria tabelas eadmin inicial
   - `verificar-admin.sql` — verifica configuração

### 4. Inicie o servidor
```bash
npm install
npm start
```

Acesse: `http://localhost:3000`

---

## 🔧 Configuração do Supabase

### Tabelas criadas automaticamente

- **imoveis** — catálogo de imóveis
- **imagens** — fotos vinculadas aos imóveis
- **contatos** — mensagens recebidas
- **administradores** — usuários do painel admin

### Políticas de acesso (RLS)

O projeto usa Row Level Security para proteger dados sensíveis. O script `admin-bootstrap.sql` já configura as políticas necessárias.

---

## 👤 Primeiro Acesso Admin

Após executar o bootstrap SQL no Supabase:

1. Acesse `/admin/login.html`
2. Use as credenciais criadas no script:
   - **Email**: `admin@imperatriz.com`
   - **Senha**: `@Imperatriz2024!`

⚠️ **Altere a senha após o primeiro login!**

---

## 📱 Páginas do Site Público

| Rota | Descrição |
|------|----------|
| `#home` | Página home com carousel e buscas |
| `#imoveis?tipo=venda` | Imóveis à venda |
| `#imoveis?tipo=aluguel` | Imóveis para alugar |
| `#detalhes/{id}` | Detalhes de um imóvel |
| `#contato` | Formulário de contato |
| `#sobre` | Sobre a empresa |

---

## 📱 Páginas do Admin

| Rota | Descrição |
|------|----------|
| `/admin/login.html` | Login de administrador |
| `/admin/dashboard.html` | Estatísticas do catálogo |
| `/admin/imoveis.html` | Gerenciar imóveis |
| `/admin/mensagens.html` | Ver mensagens recebidas |

---

## 🎨 Decisões de Design

### Linguagem simples
Todos os textos foram escritos para **usuários comuns**, evitando jargões técnicos:
- "Backend" → "sistema"
- "Supabase" → removido completamente
- "Erro de autenticação" → "Não conseguimos fazer seu login"

### Layout responsivo
- Mobile first com breakpoints em 720px e 980px
- Grid automático de cards com `minmax()`
- Imagens com `object-fit: cover`

### Performance
- Lazy loading de imagens
- Router client-side (sem reload)
- CSS e JS como módulos nativos (sem bundler)

---

## 📄 Licença

MIT License — sinta-se livre para usar e adaptar para seu projeto.

---

## 🤝 Contribuindo

1. Fork este repositório
2. Crie uma branch (`git checkout -b feature/nova`)
3. Commit suas mudanças (`git commit -m 'feat: nova feature'`)
4. Push para a branch (`git push origin feature/nova`)
5. Abra um Pull Request

---

**Desenvolvido com ❤️ para a Imperatriz Imóveis**