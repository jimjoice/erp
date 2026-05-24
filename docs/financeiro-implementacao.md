# Módulo Financeiro — Documento de Implementação

**Data:** 2026-05-24  
**Branch:** main  
**Escopo:** Expansão do módulo Financeiro com CRUD completo de Contas a Pagar e Contas a Receber

---

## 1. Contexto

O sistema já possuía a estrutura base do módulo Financeiro (entidades, serviço, repositório, componentes de tabela), porém com lacunas importantes:

- `FinanceiroService` sem métodos de criação, edição e cancelamento
- Entidades `ContaPagar` e `ContaReceber` sem método `Editar()`
- API com apenas `GET` e `POST /{id}/baixar` — sem `GET /{id}`, `POST /`, `PUT /{id}` ou `POST /{id}/cancelar`
- Frontend sem páginas de listagem (`/financeiro/contas-pagar` e `/financeiro/contas-receber`)
- Sidebar com Financeiro como link simples, sem submenu
- Tabelas sem ações de editar e cancelar
- Sem modais para criação/edição de contas

---

## 2. Arquitetura — o que já existia

| Camada | Artefatos existentes |
|---|---|
| **ERP.Domain** | `ContaPagar`, `ContaReceber` (entidades com `Pagar()`, `Cancelar()`, `MarcarVencida()`) |
| **ERP.Application** | `FinanceiroService` (listar, baixar, fluxo-caixa, contas vencendo, resumo), `IFinanceiroService`, DTOs, validators, AutoMapper profile |
| **ERP.Infrastructure** | `ContaReceberRepository`, `ContaPagarRepository`, configurações EF Core |
| **ERP.API** | `GET /contas-receber`, `POST /contas-receber/{id}/baixar`, `GET /contas-pagar`, `POST /contas-pagar/{id}/baixar`, `GET /financeiro/fluxo-caixa`, `GET /financeiro/resumo` |
| **Frontend** | `ContasReceberTable`, `ContasPagarTable`, `BaixarContaDialog`, `ResumoFinanceiro`, `FluxoCaixaGrafico`, `financeiro-service`, `use-financeiro` hooks |

---

## 3. Alterações realizadas

### 3.1 Backend — ERP.Domain

**Arquivo:** `ERP.Domain/Entities/ContaPagar.cs`

Adicionado método de edição:

```csharp
public void Editar(string descricao, decimal valor, DateTime dataVencimento, string editadoPor)
```

- Lança `InvalidOperationException` se status for `Paga` ou `Cancelada`
- Atualiza `Descricao`, `Valor`, `DataVencimento`
- Chama `SetUpdated(editadoPor)`

**Arquivo:** `ERP.Domain/Entities/ContaReceber.cs`

Adicionado método de edição com mesma assinatura e mesmas regras de negócio.

---

### 3.2 Backend — ERP.Application (DTOs)

**Arquivo:** `ERP.Application/Financeiro/FinanceiroDto.cs`

Adicionados 4 novos records de entrada:

| Record | Campos |
|---|---|
| `CriarContaPagarDto` | `FornecedorId`, `Descricao`, `Valor`, `DataVencimento` |
| `EditarContaPagarDto` | `Descricao`, `Valor`, `DataVencimento` |
| `CriarContaReceberDto` | `ClienteId?`, `Descricao`, `Valor`, `DataVencimento`, `FormaPagamento` |
| `EditarContaReceberDto` | `Descricao`, `Valor`, `DataVencimento` |

---

### 3.3 Backend — ERP.Application (Interface)

**Arquivo:** `ERP.Application/Financeiro/IFinanceiroService.cs`

Adicionados 8 novos métodos:

**Contas a Receber:**
```csharp
GetContaReceberByIdAsync(id, ct)
CriarContaReceberAsync(dto, usuario, ct)
EditarContaReceberAsync(id, dto, usuario, ct)
CancelarContaReceberAsync(id, usuario, ct)
```

**Contas a Pagar:**
```csharp
GetContaPagarByIdAsync(id, ct)
CriarContaPagarAsync(dto, usuario, ct)
EditarContaPagarAsync(id, dto, usuario, ct)
CancelarContaPagarAsync(id, usuario, ct)
```

---

### 3.4 Backend — ERP.Application (Service)

**Arquivo:** `ERP.Application/Financeiro/FinanceiroService.cs`

Implementados todos os 8 novos métodos:

- `GetById*` — busca pelo repositório, retorna `NotFound` se ausente
- `Criar*` — instancia via factory estático (`ContaPagar.Create` / `ContaReceber.Create`), persiste, retorna `Created`
- `Editar*` — busca, chama `Editar()`, captura `InvalidOperationException`, retorna `Ok` ou `Fail`
- `Cancelar*` — busca, chama `Cancelar()`, captura exceção, retorna `Ok` ou `Fail`

---

### 3.5 Backend — ERP.Application (Validators)

**Arquivo:** `ERP.Application/Financeiro/FinanceiroValidator.cs`

Adicionados 4 validators (auto-descobertos pela DI via `AddValidatorsFromAssembly`):

| Validator | Regras |
|---|---|
| `CriarContaPagarDtoValidator` | `FornecedorId` not empty, `Descricao` max 500, `Valor` > 0, `DataVencimento` not empty |
| `EditarContaPagarDtoValidator` | `Descricao` max 500, `Valor` > 0, `DataVencimento` not empty |
| `CriarContaReceberDtoValidator` | `Descricao` max 500, `Valor` > 0, `DataVencimento` not empty, `FormaPagamento` entre 1 e 5 |
| `EditarContaReceberDtoValidator` | `Descricao` max 500, `Valor` > 0, `DataVencimento` not empty |

---

### 3.6 Backend — ERP.API (Endpoints)

**Arquivo:** `ERP.API/Endpoints/FinanceiroEndpoints.cs`

**Tabela completa de endpoints após a implementação:**

#### Contas a Receber (`/api/v1/contas-receber`)

| Método | Rota | Autorização | Descrição |
|---|---|---|---|
| `GET` | `/` | Financeiro | Listagem paginada com filtros |
| `GET` | `/{id}` | Financeiro | ✅ **Novo** — busca por ID |
| `POST` | `/` | Financeiro | ✅ **Novo** — cria conta manual |
| `PUT` | `/{id}` | Financeiro | ✅ **Novo** — edita descrição/valor/vencimento |
| `POST` | `/{id}/baixar` | Financeiro | Registra recebimento + lança entrada no caixa |
| `POST` | `/{id}/cancelar` | Financeiro | ✅ **Novo** — cancela conta aberta ou vencida |

#### Contas a Pagar (`/api/v1/contas-pagar`)

| Método | Rota | Autorização | Descrição |
|---|---|---|---|
| `GET` | `/` | Financeiro | Listagem paginada com filtros |
| `GET` | `/{id}` | Financeiro | ✅ **Novo** — busca por ID |
| `POST` | `/` | Financeiro | ✅ **Novo** — cria conta manual |
| `PUT` | `/{id}` | Financeiro | ✅ **Novo** — edita descrição/valor/vencimento |
| `POST` | `/{id}/baixar` | Financeiro | Registra pagamento + lança saída no caixa |
| `POST` | `/{id}/cancelar` | Financeiro | ✅ **Novo** — cancela conta aberta ou vencida |

---

### 3.7 Frontend — Tipos

**Arquivo:** `types/financeiro.ts`

Adicionadas 4 interfaces de DTO:

```typescript
CriarContaPagarDto    // fornecedorId, descricao, valor, dataVencimento
EditarContaPagarDto   // descricao, valor, dataVencimento
CriarContaReceberDto  // clienteId?, descricao, valor, dataVencimento, formaPagamento
EditarContaReceberDto // descricao, valor, dataVencimento
```

---

### 3.8 Frontend — Service

**Arquivo:** `services/financeiro-service.ts`

Adicionados 8 novos métodos:

```typescript
obterContaReceberPorId(id)
criarContaReceber(dto)
editarContaReceber(id, dto)
cancelarContaReceber(id)

obterContaPagarPorId(id)
criarContaPagar(dto)
editarContaPagar(id, dto)
cancelarContaPagar(id)
```

---

### 3.9 Frontend — Hooks

**Arquivo:** `hooks/use-financeiro.ts`

Adicionados 6 novos mutation hooks:

```typescript
useCriarContaReceber()    // invalida ["contas-receber"]
useEditarContaReceber()   // invalida ["contas-receber"]
useCancelarContaReceber() // invalida ["contas-receber"]

useCriarContaPagar()      // invalida ["contas-pagar"]
useEditarContaPagar()     // invalida ["contas-pagar"]
useCancelarContaPagar()   // invalida ["contas-pagar"]
```

---

### 3.10 Frontend — Sidebar

**Arquivo:** `components/layout/app-sidebar.tsx`

**Mudanças:**

1. Refatoração do estado de menus abertos: substituído `cadastrosOpen: boolean` por `openMenus: Set<string>` — suporta múltiplos submenus simultaneamente
2. Financeiro ganhou submenu com dois filhos:

```typescript
children: [
  { label: "Contas a Pagar",   href: "/financeiro/contas-pagar",   icon: TrendingDown },
  { label: "Contas a Receber", href: "/financeiro/contas-receber", icon: TrendingUp },
]
```

3. Inicialização automática: qualquer submenu cujo `href` seja prefixo do `pathname` atual começa expandido

---

### 3.11 Frontend — Tabelas

**Arquivo:** `components/financeiro/contas-pagar-table.tsx`  
**Arquivo:** `components/financeiro/contas-receber-table.tsx`

Adicionados dois props opcionais:

```typescript
onEditar?: (conta) => void   // exibe ícone Pencil
onCancelar?: (conta) => void // exibe ícone XCircle (vermelho)
```

Botões só aparecem quando `status === "Aberta" || "Vencida"`.

---

### 3.12 Frontend — Componentes novos

#### `components/financeiro/cancelar-conta-dialog.tsx`

Dialog de confirmação compartilhado entre Contas a Pagar e Contas a Receber:
- Exibe descrição da conta
- Botões "Voltar" e "Confirmar cancelamento" (destrutivo)
- Recebe `isPending` para desabilitar botões durante a mutação

#### `components/financeiro/conta-pagar-modal.tsx`

Modal de criação/edição de Conta a Pagar:
- **Criação:** busca de fornecedor com autocomplete (debounce via TanStack Query), campos `descricao`, `valor`, `dataVencimento`
- **Edição:** fornecedor fixo (não editável), mesmos campos
- Validação com React Hook Form + Zod
- Exibe erros da API

#### `components/financeiro/conta-receber-modal.tsx`

Modal de criação/edição de Conta a Receber:
- **Criação:** busca de cliente opcional com autocomplete (mín. 2 chars), campos `descricao`, `valor`, `dataVencimento`, `formaPagamento` (Select)
- **Edição:** cliente fixo, sem campo `formaPagamento`
- Validação com React Hook Form + Zod

---

### 3.13 Frontend — Páginas

#### `app/(dashboard)/financeiro/contas-pagar/page.tsx`

Funcionalidades:
- Header com título e botão "Nova Conta"
- Filtros: Status (select), Data início, Data fim, botão "Limpar filtros"
- Tabela com paginação, ações: Baixar / Editar (lápis) / Cancelar (x)
- `BaixarContaDialog` para registrar pagamentos
- `ContaPagarModal` para criar/editar
- `CancelarContaDialog` para confirmar cancelamento

#### `app/(dashboard)/financeiro/contas-receber/page.tsx`

Mesma estrutura, mas para Contas a Receber, com `ContaReceberModal` e `useCancelarContaReceber`.

---

## 4. Fluxo completo — Contas a Pagar

```
1. Usuário acessa /financeiro/contas-pagar
2. [Filtros] Status, período de vencimento
3. [Nova Conta]
   → abre ContaPagarModal
   → busca fornecedor por nome/CNPJ
   → preenche descrição, valor, vencimento
   → POST /api/v1/contas-pagar
4. [Editar] (ícone lápis na linha)
   → abre ContaPagarModal em modo edição
   → PUT /api/v1/contas-pagar/{id}
5. [Baixar] (botão "Baixar" na linha)
   → abre BaixarContaDialog
   → informa valor pago, forma, data
   → POST /api/v1/contas-pagar/{id}/baixar
   → cria LancamentoCaixa (Saída)
6. [Cancelar] (ícone × na linha)
   → abre CancelarContaDialog
   → POST /api/v1/contas-pagar/{id}/cancelar
```

---

## 5. Regras de negócio em vigor

| Regra | Onde implementada |
|---|---|
| Conta paga não pode ser editada ou cancelada | `ContaPagar.Editar()` / `ContaPagar.Cancelar()` |
| Conta cancelada não pode ser editada, paga ou re-cancelada | Mesmos métodos de domínio |
| Baixar gera LancamentoCaixa automaticamente | `FinanceiroService.BaixarContaPagarAsync()` / `BaixarContaReceberAsync()` |
| Criação de ContaReceber manual: parcela 1/1, status Aberta | `FinanceiroService.CriarContaReceberAsync()` |
| Validação de DTO na camada de API antes de chamar o serviço | `FinanceiroEndpoints` + validators |
| Botões de ação só aparecem para status Aberta/Vencida | Tabelas frontend |

---

## 6. Arquivos modificados / criados

### Backend

| Operação | Arquivo |
|---|---|
| Modificado | `ERP.Domain/Entities/ContaPagar.cs` |
| Modificado | `ERP.Domain/Entities/ContaReceber.cs` |
| Modificado | `ERP.Application/Financeiro/FinanceiroDto.cs` |
| Modificado | `ERP.Application/Financeiro/IFinanceiroService.cs` |
| Modificado | `ERP.Application/Financeiro/FinanceiroService.cs` |
| Modificado | `ERP.Application/Financeiro/FinanceiroValidator.cs` |
| Modificado | `ERP.API/Endpoints/FinanceiroEndpoints.cs` |

### Frontend

| Operação | Arquivo |
|---|---|
| Modificado | `types/financeiro.ts` |
| Modificado | `services/financeiro-service.ts` |
| Modificado | `hooks/use-financeiro.ts` |
| Modificado | `components/layout/app-sidebar.tsx` |
| Modificado | `components/financeiro/contas-pagar-table.tsx` |
| Modificado | `components/financeiro/contas-receber-table.tsx` |
| Criado | `components/financeiro/cancelar-conta-dialog.tsx` |
| Criado | `components/financeiro/conta-pagar-modal.tsx` |
| Criado | `components/financeiro/conta-receber-modal.tsx` |
| Criado | `app/(dashboard)/financeiro/contas-pagar/page.tsx` |
| Criado | `app/(dashboard)/financeiro/contas-receber/page.tsx` |
