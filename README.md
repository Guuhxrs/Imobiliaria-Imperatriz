# 🏠 Imperatriz Imóveis — Auditoria do Projeto

## 📊 Status Geral
- Progresso estimado: **58%**
- Pronto para produção: **NÃO**

---

## 🔧 Funcionalidades

- [x] Listagem de imóveis *(existe interface estática e serviço JS para buscar dados)*
- [x] Página de detalhes *(layout pronto + controller específico)*
- [x] Navegação entre páginas (SPA) *(hash router implementado)*
- [ ] Sistema de busca *(campos visuais existem, mas sem integração real de consulta)*
- [ ] Filtros (preço, cidade, tipo) *(UI existe; filtros não estão conectados à tela ativa)*
- [ ] Formulário de contato *(botões/inputs existem, mas sem fluxo de envio persistido)*
- [x] Integração com Supabase *(client, config, teste e importador implementados)*

---

## 🧠 Backend (Supabase)

- [ ] Tabelas criadas corretamente *(há schema sugerido, mas sem evidência de execução no ambiente)*
- [ ] Relacionamentos funcionando *(não há modelagem relacional implementada no repositório)*
- [ ] RLS configurado *(não há policies SQL versionadas no projeto)*
- [ ] Policies funcionando *(não há testes/policies declaradas no repositório)*
- [x] Inserção de dados OK *(script de importação em lote implementado para tabela `imoveis`)*
- [x] Leitura de dados OK *(função de teste Supabase + serviços de leitura implementados)*

---

## 🎨 Frontend

- [x] Interface funcional *(páginas HTML completas e navegáveis visualmente)*
- [x] Navegação fluida *(troca de rota por hash sem reload)*
- [x] Responsividade (mobile) *(layouts com utilitários responsivos)*
- [ ] Feedback de loading *(não padronizado no shell principal; apenas suporte parcial em controller)*
- [ ] Tratamento de erros *(existem `try/catch` em módulos, mas sem UX de erro padronizada)*

---

## 🔐 Segurança

- [ ] Uso correto de chaves *(chave publishable está hardcoded em arquivo e HTML)*
- [ ] Nenhum dado sensível exposto *(configuração está visível no frontend por design atual)*
- [ ] Validação de inputs *(validação superficial; faltam validações robustas e sanitização)*

---

## ⚡ Performance

- [ ] Tempo de carregamento aceitável *(sem métricas Lighthouse/Web Vitals registradas)*
- [ ] Imagens otimizadas *(imagens remotas grandes, sem estratégia de otimização/local fallback)*
- [x] Código limpo *(modularização por serviços/controllers/config/router)*

---

## 📈 Experiência do Usuário (UX)

- [x] Interface intuitiva *(hierarquia visual e seções claras)*
- [x] Botões claros *(CTAs presentes e nomenclatura compreensível)*
- [x] Navegação simples *(menu principal com roteamento SPA)*
- [ ] Fluxo lógico *(fluxos de busca/contato/admin ainda não conectados ponta a ponta)*

---

## 🚀 Produção

- [ ] Sem erros no console *(importação automática pode falhar por schema/permissão e gerar logs de erro)*
- [ ] Pronto para deploy *(faltam segurança, testes e validação backend)*
- [x] Estrutura escalável *(arquitetura modular já preparada para expansão)*

---

## 🔍 Problemas Identificados

### ❌ Problema: Inconsistência de tabela (`properties` vs `imoveis`)
- Descrição: Os serviços principais usam tabela `properties`, enquanto teste/importador/schema usam `imoveis`.
- Impacto: Leituras e escritas podem falhar dependendo da tabela existente no banco.
- Como corrigir: Definir um padrão único (recomendado: `imoveis`) e alinhar todos os serviços/controllers.
- Arquivo(s) afetado(s): `js/services/propertiesService.js`, `js/test-supabase.js`, `js/import-imoveis.js`, `supabase-imoveis-schema.md`.

### ❌ Problema: Importação automática em toda carga da página
- Descrição: O script `import-imoveis` roda no `DOMContentLoaded` e tenta inserir dados automaticamente.
- Impacto: Pode gerar chamadas desnecessárias, erros recorrentes e ruído no console.
- Como corrigir: Tornar importação manual (botão/flag admin) e exigir confirmação explícita.
- Arquivo(s) afetado(s): `js/import-imoveis.js`, `index.html`.

### ❌ Problema: Chave Supabase exposta em múltiplos pontos
- Descrição: URL e chave publishable estão hardcoded no JS e no HTML.
- Impacto: Acoplamento alto e risco de configuração incorreta entre ambientes.
- Como corrigir: Centralizar somente em `window.__APP_CONFIG__` por ambiente e remover fallback hardcoded.
- Arquivo(s) afetado(s): `js/config.js`, `index.html`.

### ❌ Problema: Navegação SPA carrega HTML completo por `fetch`
- Descrição: O router injeta `body.innerHTML` de páginas completas.
- Impacto: Pode duplicar estruturas globais e scripts quando expandir o projeto.
- Como corrigir: Migrar para renderização por componentes/templates parciais e estado central.
- Arquivo(s) afetado(s): `js/router.js`, `index.html`, `home.html`, `listagem_de_imoveis.html`, `pagina_do_imovel.html`, `painel_administrativo.html`.

### ❌ Problema: Funcionalidades centrais ainda sem integração real de UI
- Descrição: Busca, filtros e contato estão visuais, mas sem fluxo persistido completo.
- Impacto: Produto parece pronto, porém não entrega jornada fim-a-fim.
- Como corrigir: Conectar eventos da interface aos serviços Supabase e adicionar estados de sucesso/erro/loading.
- Arquivo(s) afetado(s): `index.html`, `listagem_de_imoveis.html`, `pagina_do_imovel.html`, `js/controllers/*.js`.

---

## 🔥 Prioridade de Correção

### 🔴 Crítico
- Unificar tabela de dados entre todos os módulos (`imoveis` ou `properties`).
- Revisar estratégia de importação automática para evitar escrita indevida em produção.
- Definir e aplicar RLS + policies no Supabase.

### 🟠 Alto
- Conectar busca/filtros da UI com consultas reais no banco.
- Implementar formulário de contato com persistência e validação.
- Padronizar tratamento de erro e estados de loading no frontend.

### 🟡 Médio
- Refatorar roteamento para templates/componentes parciais (evitar injeção de páginas completas).
- Adicionar testes de integração para serviços Supabase e controllers.
- Criar script de setup de banco versionado (migrações SQL).

### 🟢 Baixo
- Melhorar otimização de imagens e métricas de performance.
- Ajustar microinterações e mensagens de feedback para UX.
- Documentar convenções de código e fluxo de deploy.

---

## 📌 Próximos Passos

1. Corrigir itens críticos
2. Finalizar funcionalidades principais
3. Melhorar UX
4. Preparar para deploy
