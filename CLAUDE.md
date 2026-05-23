# ERP Varejo — Contexto do Projeto

## Visão geral
Sistema ERP para varejo de pequeno porte (1 loja, até 10 funcionários).
Desenvolvido por 1 desenvolvedor solo.

## Stack técnica

### Backend
- **Runtime**: .NET Core 10
- **API**: Minimal APIs (não usar Controllers MVC)
- **ORM**: Entity Framework Core 10
- **Banco**: PostgreSQL 16
- **Auth**: JWT Bearer tokens (access + refresh)
- **Validação**: FluentValidation
- **Logs**: Serilog (structured logging)
- **Docs**: Swagger / OpenAPI
- **Testes**: xUnit + Testcontainers (PostgreSQL em container)

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **Fetch/Cache**: React Query (TanStack Query v5)
- **HTTP client**: Axios com interceptors JWT
- **Estado global**: Zustand
- **Forms**: React Hook Form + Zod
- **Tabelas**: TanStack Table
- **Gráficos**: Recharts

### Infraestrutura
- Docker + Docker Compose (dev e prod)
- GitHub Actions (CI/CD)
- Redis (cache de sessão e rate limiting)

---

## Arquitetura — Clean Architecture

```
/backend/src/
  ERP.Domain/           → Entidades, enums, interfaces de domínio, value objects
  ERP.Application/      → Use cases, DTOs, interfaces de repositório, serviços
  ERP.Infrastructure/   → EF Core, repositórios, integrações externas
  ERP.API/              → Minimal APIs endpoints, middlewares, Program.cs
/frontend/src/
  app/                  → Rotas Next.js (App Router)
  components/           → Componentes reutilizáveis
  services/             → Chamadas à API (Axios)
  store/                → Estado global (Zustand)
  hooks/                → Custom hooks
  types/                → Tipos TypeScript
```

---

## Padrões de código obrigatórios

### Entidades (Domain)
- Sempre usar `Guid` como PK (`Id`)
- Sempre incluir: `CreatedAt`, `UpdatedAt`, `CreatedBy`, `UpdatedBy`
- Sempre usar soft delete: `DeletedAt` (null = ativo)
- Herdar de `BaseEntity` para garantir os campos acima
- Nunca expor setters públicos — usar métodos de domínio

### API
- Todos os endpoints retornam `Result<T>` (nunca lançar exceções não tratadas)
- Respostas de erro no padrão RFC 7807 (ProblemDetails)
- Versionamento de API: `/api/v1/`
- Sempre validar DTOs de entrada com FluentValidation
- Paginação padrão: `{ page, pageSize, total, items }`

### Banco de dados
- Migrations geradas com `dotnet ef migrations add`
- Nunca usar `DeleteBehavior.Cascade` — sempre `Restrict` ou soft delete
- Índices obrigatórios em FKs e campos de busca frequente
- Todos os campos `string` com `MaxLength` configurado

### Frontend
- Sempre tipar com TypeScript (sem `any`)
- Queries React Query com chaves em array: `['produtos', filtros]`
- Formulários com React Hook Form + Zod para validação
- Traduzir todas as mensagens de erro da API para português
- Nunca fazer fetch direto — sempre via service em `/services/`

---

## Módulos do sistema

### 1. Cadastros (base de tudo)
- Clientes (PF e PJ) — CPF/CNPJ, endereço, contato
- Fornecedores — CNPJ, condições de pagamento
- Funcionários — dados pessoais, cargo, salário
- Produtos — SKU, código de barras, NCM, categorias
- Unidades de medida, categorias, marcas

### 2. Estoque
- Entrada de mercadorias (vinculada a nota fiscal de compra)
- Saída manual e por venda
- Inventário / contagem
- Alertas de estoque mínimo
- Localização (prateleira/corredor)

### 3. Vendas / PDV
- Orçamentos → Pedidos → Venda
- Múltiplas formas de pagamento (dinheiro, cartão, PIX, crediário)
- Troco automático
- Desconto por item ou total
- Devolução / troca
- NFC-e (cupom fiscal eletrônico)

### 4. Financeiro
- Contas a receber (geradas automaticamente pelas vendas)
- Contas a pagar (geradas na entrada de mercadorias)
- Baixa de parcelas (manual e automática via PIX)
- Fluxo de caixa diário/mensal
- DRE simplificado

### 5. Fiscal (Brasil)
- NF-e (modelo 55) para vendas B2B
- NFC-e (modelo 65) para PDV
- Cálculo automático: ICMS, PIS, COFINS, IPI
- Integração com SEFAZ (webservice)
- SPED Fiscal e SPED Contribuições
- Adequação à Reforma Tributária 2026 (CBS/IBS)

### 6. Relatórios / Dashboard
- Dashboard: faturamento do dia, semana, mês
- Relatório de vendas por período, vendedor, produto
- Curva ABC de produtos
- Contas a pagar/receber em aberto
- Fluxo de caixa projetado

---

## Regras de negócio importantes

- Um produto nunca pode ter estoque negativo (bloquear venda)
- Toda movimentação de estoque gera um `LancamentoEstoque` com motivo
- Pagamentos parcelados geram N `ContaReceber` automaticamente
- NF-e só pode ser emitida após autorização do SEFAZ
- Cancelamento de venda só permitido em até 24h (regra fiscal)
- Desconto máximo por venda: 30% (configurável por perfil)

---

## Usuários e permissões

- `Admin` — acesso total
- `Gerente` — tudo exceto configurações fiscais
- `Vendedor` — apenas PDV, clientes e estoque (leitura)
- `Financeiro` — apenas módulo financeiro e relatórios

---

## Variáveis de ambiente esperadas

```env
# Backend
DATABASE_URL=Host=localhost;Database=erp_varejo;Username=erp;Password=erp123
JWT_SECRET=<chave_secreta_32_chars>
REDIS_URL=redis://localhost:6379
SEFAZ_AMBIENTE=homologacao  # ou producao

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## Convenções de nomenclatura

| Contexto         | Padrão           | Exemplo                        |
|------------------|------------------|-------------------------------|
| Classes C#       | PascalCase       | `ProdutoService`              |
| Métodos C#       | PascalCase       | `ObterPorId()`                |
| Variáveis C#     | camelCase        | `totalVenda`                  |
| Tabelas DB       | snake_case       | `produtos`, `contas_receber`  |
| Colunas DB       | snake_case       | `created_at`, `preco_venda`   |
| Rotas API        | kebab-case       | `/api/v1/contas-receber`      |
| Componentes React| PascalCase       | `TabelaProdutos.tsx`          |
| Hooks React      | camelCase + use  | `useProdutos()`               |
| Arquivos TS      | kebab-case       | `produto-service.ts`          |

---

## Ordem de desenvolvimento recomendada

1. Setup inicial (Docker, EF Core, migrations base)
2. Módulo Cadastros (Produtos, Clientes, Fornecedores)
3. Módulo Estoque
4. Módulo Vendas / PDV
5. Módulo Financeiro
6. Módulo Fiscal (NFC-e / NF-e)
7. Dashboard e Relatórios
8. Integrações externas (PIX, Correios)
