# Módulo Vendas / PDV — Documento de Implementação

**Data:** 2026-05-24  
**Branch:** main  
**Escopo:** Funcionalidade completa de "Gerar Venda" seguindo Clean Architecture

---

## 1. Contexto

O sistema já possuía a estrutura base do módulo de Vendas (entidades, serviço, repositório, componentes de PDV), porém apresentava lacunas:

- Endpoint `PUT /desconto` ausente na camada de API
- Migrations de vendas e financeiro **vazias** — as tabelas não existiam no banco
- PDV sem busca de cliente vinculada à venda
- Tela de sucesso sem opção de impressão de comprovante
- `venda-service.ts` não enviava `clienteId` ao criar a venda

---

## 2. Arquitetura — o que já existia

| Camada | Artefatos existentes |
|---|---|
| **ERP.Domain** | `Venda`, `ItemVenda`, `Pagamento` (entidades com regras de negócio) |
| **ERP.Application** | `VendaService` (todos os métodos), `IVendaService`, DTOs, validators, AutoMapper profile |
| **ERP.Infrastructure** | `VendaRepository`, configurações EF Core, `AppDbContextModelSnapshot` |
| **ERP.API** | Endpoints de listagem, criação, adição de item, remoção, finalizar, cancelar |
| **Frontend** | `PdvBusca`, `PdvCarrinho`, `PdvResumo`, `PdvModalPagamento`, `PdvModalCancelar`, `pdv-store`, `venda-service` |

---

## 3. Alterações realizadas

### 3.1 Backend — ERP.API

**Arquivo:** `Endpoints/VendasEndpoints.cs`

Adicionado o endpoint que faltava:

```
PUT /api/v1/vendas/{id}/desconto
```

- Requer autorização `Vendedor`
- Valida via `AplicarDescontoDtoValidator` (percentual entre 0 e 0,30)
- Chama `IVendaService.AplicarDescontoAsync()`
- O método já existia no serviço e na interface — apenas o mapeamento HTTP estava ausente

**Tabela completa de endpoints após a implementação:**

| Método | Rota | Autorização | Descrição |
|---|---|---|---|
| `GET` | `/api/v1/vendas/resumo-dia` | Vendedor | Total, ticket médio e quantidade do dia |
| `GET` | `/api/v1/vendas` | Vendedor | Listagem paginada com filtros |
| `GET` | `/api/v1/vendas/{id}` | Vendedor | Resumo completo com itens e pagamentos |
| `POST` | `/api/v1/vendas` | Vendedor | Inicia orçamento |
| `POST` | `/api/v1/vendas/{id}/itens` | Vendedor | Adiciona item |
| `DELETE` | `/api/v1/vendas/{id}/itens/{itemId}` | Vendedor | Remove item |
| `PUT` | `/api/v1/vendas/{id}/desconto` | Vendedor | ✅ **Novo** — aplica desconto percentual |
| `POST` | `/api/v1/vendas/{id}/finalizar` | Vendedor | Finaliza: baixa estoque, gera contas a receber |
| `POST` | `/api/v1/vendas/{id}/cancelar` | Gerente | Cancela (até 24h), estorna estoque |

---

### 3.2 Backend — ERP.Infrastructure (Migration)

**Problema:** As migrations `AddVendasModule` e `AddFinanceiroModule` foram criadas com `Up()` vazio. Como já estavam registradas em `__EFMigrationsHistory`, não seriam re-executadas. As tabelas não existiam no banco.

**Solução:** Nova migration manual.

**Arquivo criado:** `Migrations/20260524000000_CreateVendasFinanceiroTables.cs`

Cria as seguintes tabelas:

#### Tabela `vendas`
| Coluna | Tipo | Observação |
|---|---|---|
| `id` | `uuid` | PK, gerado no domínio |
| `numero` | `integer` | Auto-incremento (IDENTITY), único |
| `cliente_id` | `uuid` | FK → `clientes`, nullable |
| `funcionario_id` | `uuid` | FK → `funcionarios`, NOT NULL |
| `status` | `integer` | Enum: 0=Orcamento, 1=Confirmada, 2=Cancelada |
| `data_venda` | `timestamptz` | — |
| `subtotal` | `numeric(18,4)` | — |
| `desconto` | `numeric(18,4)` | — |
| `total` | `numeric(18,4)` | — |
| `observacao` | `varchar(500)` | Nullable |
| Auditoria | — | `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at` |

Índices: `numero` (único), `cliente_id`, `funcionario_id`, `status`, `data_venda`, `deleted_at`

#### Tabela `itens_venda`
| Coluna | Tipo | Observação |
|---|---|---|
| `venda_id` | `uuid` | FK → `vendas` |
| `produto_id` | `uuid` | FK → `produtos` |
| `quantidade` | `numeric(18,4)` | — |
| `preco_unitario` | `numeric(18,4)` | — |
| `desconto` | `numeric(18,4)` | — |
| `subtotal` | `numeric(18,4)` | `(quantidade * preco_unitario) - desconto` |

#### Tabela `pagamentos`
| Coluna | Tipo | Observação |
|---|---|---|
| `venda_id` | `uuid` | FK → `vendas` |
| `forma` | `integer` | Enum: 1=Dinheiro, 2=Debito, 3=Credito, 4=Pix, 5=Crediario |
| `valor` | `numeric(18,4)` | — |
| `parcelas` | `integer` | — |
| `taxa_juros` | `numeric(18,4)` | — |

#### Tabela `contas_receber`
Criada junto pois é necessária para o `FinalizarVenda` (gera parcelas automaticamente).

| Coluna | Tipo | Observação |
|---|---|---|
| `venda_id` | `uuid` | FK → `vendas`, nullable |
| `cliente_id` | `uuid` | FK → `clientes`, nullable |
| `forma_pagamento` | `integer` | — |
| `descricao` | `varchar(500)` | Ex: "Venda #42 - Pix" |
| `valor` | `numeric(18,4)` | — |
| `numero_parcela` / `total_parcelas` | `integer` | — |
| `data_vencimento` | `timestamptz` | — |
| `data_pagamento` | `timestamptz` | Nullable |
| `status` | `integer` | 0=Aberta, 1=Paga, 2=Cancelada |

#### Tabelas `contas_pagar` e `lancamentos_caixa`
Criadas para que o `AppDbContext` possa operar sem erros de tabela ausente.

**Arquivo criado:** `Migrations/20260524000000_CreateVendasFinanceiroTables_Designer.cs`

Designer mínimo com atributo `[Migration("20260524000000_CreateVendasFinanceiroTables")]`, obrigatório para o EF Core descobrir a classe via reflection durante `dotnet ef migrations list` e `database update`.

---

### 3.3 Frontend — Store

**Arquivo:** `store/pdv-store.ts`

Adicionado estado de cliente à sessão de venda:

```typescript
// Novo estado
clienteId: string | null;
clienteNome: string | null;

// Novos métodos
setCliente(id: string, nome: string): void;
limparCliente(): void;

// Atualizado
limpar(): void; // agora também reseta clienteId e clienteNome
```

---

### 3.4 Frontend — Service

**Arquivo:** `services/venda-service.ts`

O método `criar()` passou a aceitar e enviar `clienteId`:

```typescript
// Antes
criar(funcionarioId, itens, descontoPercentual)

// Depois
criar(funcionarioId, itens, descontoPercentual, clienteId?)
```

O payload enviado ao backend agora inclui `clienteId: clienteId ?? null`.

---

### 3.5 Frontend — Hook

**Arquivo criado:** `hooks/use-busca-cliente-pdv.ts`

```typescript
export function useBuscaClientePdv(busca: string) {
  return useQuery({
    queryKey: ["pdv-busca-cliente", busca],
    queryFn: () => clienteService.listar({ search: busca, page: 1, pageSize: 6 }),
    enabled: busca.trim().length >= 2,
    staleTime: 60_000,
  });
}
```

- Debounce de 300ms aplicado no componente
- Ativado somente com 2+ caracteres
- Usa `clienteService.listar()` já existente

---

### 3.6 Frontend — Componente

**Arquivo criado:** `components/pdv/pdv-busca-cliente.tsx`

Componente de busca de cliente com dois estados visuais:

**Estado: cliente não selecionado**
- Campo de texto com ícone de busca e loader
- Dropdown com nome e CPF/CNPJ dos resultados
- Badge PF/PJ em cada resultado

**Estado: cliente selecionado**
- Exibe nome do cliente com ícone de confirmação
- Botão `×` para remover o cliente selecionado

O componente lê/escreve no `pdv-store` via `setCliente()` e `limparCliente()`.

---

### 3.7 Frontend — Tipos

**Arquivo:** `types/venda.ts`

Adicionado campo opcional à interface `VendaConfirmada`:

```typescript
export interface VendaConfirmada {
  id: string;
  numero: number;
  total: number;
  troco: number;
  clienteNome?: string; // ← novo
}
```

---

### 3.8 Frontend — Página PDV

**Arquivo:** `app/(dashboard)/pdv/page.tsx`

**Mudanças no layout:**
- Adicionada seção de busca de cliente acima do campo de produto, separada por `<Separator />`
- `PdvBuscaCliente` renderizado no topo da coluna esquerda

**Mudanças na mutation:**
```typescript
// clienteId lido do store e passado ao service
const venda = await vendaService.criar(
  funcionarioId,
  itens,
  descontoPercentual,
  clienteId          // ← novo
);

// VendaConfirmada inclui nome do cliente
return {
  ...
  clienteNome: clienteNome ?? undefined,
};
```

**Mudanças no overlay de sucesso:**
- Exibe nome do cliente quando vinculado
- Botão **"Imprimir comprovante"** chama `window.print()`
- Classes CSS `print:` para ocultar elementos desnecessários na impressão (`print:hidden` no ícone de check e nos botões)

---

## 4. Fluxo completo do PDV

```
1. Usuário abre /pdv
2. [Opcional] Busca cliente por nome ou CPF/CNPJ
   → autocomplete seleciona → armazenado no pdv-store
3. Busca produto por nome, SKU ou código de barras (F2)
   → debounce 250ms → dropdown de resultados
   → seleciona → adicionado ao carrinho (pdv-store)
4. Ajusta quantidade (+/-) e desconto no painel direito
5. Pressiona F4 ou clica "Finalizar venda"
   → abre PdvModalPagamento
6. Seleciona forma(s) de pagamento, informa valores
   → troco calculado automaticamente
   → "Confirmar pagamento"
7. Mutation executa:
   a. POST /api/v1/vendas        → cria orçamento com todos os itens e desconto distribuído
   b. POST /api/v1/vendas/{id}/finalizar → valida estoque, registra pagamentos,
                                            baixa estoque, gera contas a receber
8. Overlay de sucesso:
   → Número da venda, cliente (se vinculado), total, troco
   → "Imprimir comprovante" (window.print) | "Nova venda"
```

---

## 5. Regras de negócio em vigor

| Regra | Onde implementada |
|---|---|
| Estoque nunca negativo | `Venda.AdicionarItem()` + verificação no `FinalizarAsync()` |
| Desconto máximo 30% | `Venda.AplicarDesconto()` + `AplicarDescontoDtoValidator` |
| Cancelamento apenas em até 24h | `Venda.Cancelar()` |
| Cancelamento estorna estoque | `VendaService.CancelarAsync()` |
| Pagamentos parcelados geram N ContasReceber | `VendaService.GerarContasReceber()` |
| Pagamentos à vista (Dinheiro/Pix/Débito) geram 1 ContaReceber marcada como paga | `VendaService.GerarContasReceber()` |
| Total pago deve ser ≥ total da venda | `FinalizarAsync()` + `PdvModalPagamento` (client-side) |

---

## 6. Como aplicar a migration

As tabelas ainda não existem no banco. Para criá-las:

```bash
cd backend
dotnet ef database update \
  --project src/ERP.Infrastructure \
  --startup-project src/ERP.API
```

Isso aplicará apenas a `20260524000000_CreateVendasFinanceiroTables` (as migrations anteriores vazias já constam no `__EFMigrationsHistory`).

---

## 7. Arquivos modificados / criados

### Backend
| Operação | Arquivo |
|---|---|
| Modificado | `ERP.API/Endpoints/VendasEndpoints.cs` |
| Criado | `ERP.Infrastructure/Persistence/Migrations/20260524000000_CreateVendasFinanceiroTables.cs` |
| Criado | `ERP.Infrastructure/Persistence/Migrations/20260524000000_CreateVendasFinanceiroTables_Designer.cs` |

### Frontend
| Operação | Arquivo |
|---|---|
| Modificado | `store/pdv-store.ts` |
| Modificado | `services/venda-service.ts` |
| Modificado | `types/venda.ts` |
| Modificado | `app/(dashboard)/pdv/page.tsx` |
| Criado | `hooks/use-busca-cliente-pdv.ts` |
| Criado | `components/pdv/pdv-busca-cliente.tsx` |
