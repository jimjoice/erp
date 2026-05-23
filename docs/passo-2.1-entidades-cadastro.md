# Passo 2.1 — Entidades de Cadastro

## Arquivos criados em `ERP.Domain/`

### Enums/
- `TipoPessoa.cs` — `PF = 1`, `PJ = 2`
- `UnidadeMedida.cs` — 12 unidades: UN, KG, G, L, ML, M, M2, M3, CX, PCT, PR, DZ

### ValueObjects/
- `Endereco.cs` — `sealed record` com 7 campos (Cep, Logradouro, Numero, Complemento?, Bairro, Cidade, Uf); imutável e com igualdade estrutural nativa do record; compatível com EF Core owned entity

### Entities/

| Entidade | Destaques |
|---|---|
| `Categoria` | `Create()` + `Atualizar()` |
| `Produto` | `Create()` + `Atualizar()` + `AtualizarEstoque()` + `AtualizarPrecos()` + propriedade calculada `EstoqueAbaixoDoMinimo` |
| `Cliente` | `TipoPessoa`, `CpfCnpj`, `Endereco?` owned; `Atualizar()` + `AtualizarEndereco()` |
| `Fornecedor` | `Cnpj`, `Endereco?` owned; mesmo padrão |
| `Funcionario` | `Cpf`, `Cargo`, `Salario`, `DataAdmissao`, `UsuarioId?`; `VincularUsuario()` para associar ao futuro módulo de auth |

Todos herdam de `BaseEntity`, usam construtor privado para EF Core e expõem apenas métodos de domínio (sem setters públicos).
