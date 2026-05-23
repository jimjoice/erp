# Passo 2.5 — Endpoints de Clientes e Fornecedores

## Arquivos criados

**ERP.Application**
- `IClienteService` + `ClienteService` — adicionado `GetByCpfCnpjAsync` (normaliza CPF/CNPJ com `SomenteDigitos` antes de consultar)

**ERP.API**
- `Endpoints/ClientesEndpoints.cs` — 6 endpoints
- `Endpoints/FornecedoresEndpoints.cs` — 5 endpoints
- `Program.cs` — `app.MapClientes()` e `app.MapFornecedores()` registrados

---

## Endpoints

**Clientes**

| Método | Rota | Auth |
|--------|------|------|
| GET | `/api/v1/clientes` | Vendedor |
| GET | `/api/v1/clientes/buscar?cpfCnpj=xxx` | Vendedor |
| GET | `/api/v1/clientes/{id}` | Vendedor |
| POST | `/api/v1/clientes` | Gerente |
| PUT | `/api/v1/clientes/{id}` | Gerente |
| DELETE | `/api/v1/clientes/{id}` | Admin |

**Fornecedores**

| Método | Rota | Auth |
|--------|------|------|
| GET | `/api/v1/fornecedores` | Gerente |
| GET | `/api/v1/fornecedores/{id}` | Gerente |
| POST | `/api/v1/fornecedores` | Gerente |
| PUT | `/api/v1/fornecedores/{id}` | Gerente |
| DELETE | `/api/v1/fornecedores/{id}` | Admin |

**Decisões de autorização:** Clientes leitura liberada para Vendedor (conforme CLAUDE.md). Fornecedores restrito a Gerente — dados operacionais que Vendedor não precisa acessar. O endpoint `/buscar` é declarado antes de `/{id:guid}` no grupo para evitar ambiguidade de rota.
