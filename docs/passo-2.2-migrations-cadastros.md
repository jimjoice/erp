# Passo 2.2 — Migrations dos Cadastros

## Arquivos criados

**`ERP.Infrastructure/Persistence/Configurations/`**
- `CategoriaConfiguration.cs` — `ToTable("categorias")`, MaxLength, índice único em `nome`
- `ProdutoConfiguration.cs` — precisão decimal (18,4), FK Restrict, índices em `sku`, `codigo_barras`, `nome`, `categoria_id`
- `ClienteConfiguration.cs` — MaxLength em `cpf_cnpj` (14), índice único, `OwnsOne(Endereco)`
- `FornecedorConfiguration.cs` — MaxLength em `cnpj` (14), índice único, `OwnsOne(Endereco)`
- `FuncionarioConfiguration.cs` — precisão decimal (18,2) em salário, CPF único, índice parcial em `usuario_id`

**`ERP.Infrastructure/Persistence/AppDbContextFactory.cs`** — `IDesignTimeDbContextFactory` (só para `dotnet ef`; não entra em runtime)

**`ERP.Infrastructure/Persistence/Migrations/20260522223336_InitCadastros.cs`** — migration gerada e validada

---

## Destaques da migration gerada

| Requisito | Como ficou |
|---|---|
| Tabelas snake_case | `categorias`, `clientes`, `fornecedores`, `funcionarios`, `produtos` |
| Colunas snake_case | `cpf_cnpj`, `preco_venda`, `deleted_at`, `created_by`, etc. |
| Índices únicos com soft-delete | `WHERE deleted_at IS NULL` em CPF, CNPJ, SKU, nome de categoria |
| CodigoBarras nullable + único | `WHERE codigo_barras IS NOT NULL AND deleted_at IS NULL` |
| Endereço owned entity | colunas `endereco_cep … endereco_uf` todas `nullable: true` |
| FK sem cascade | `onDelete: ReferentialAction.Restrict` |
| Precisão decimal | `numeric(18,4)` para preços/estoque, `numeric(18,2)` para salário |
