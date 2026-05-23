# Passo 3.2 — Serviço de estoque

## Arquivos criados em `ERP.Application/Estoque/`

### `EstoqueDto.cs` — DTOs de entrada e saída

| DTO | Campos |
|---|---|
| `EntradaMercadoriaDto` | produtoId, quantidade, custoUnitario, fornecedorId?, numeroNF? |
| `SaidaManualDto` | produtoId, quantidade, descricao? |
| `ItemInventarioDto` | produtoId, quantidadeReal |
| `AjusteInventarioDto` | itens (lista de ItemInventarioDto), descricao? |
| `PosicaoEstoqueItemDto` | snapshot de um produto com situação calculada |
| `ResultadoAjusteInventarioDto` | totalItens, itensAjustados, itensIgnorados, movimentacoes |

`SituacaoEstoque` enum — `OK = 1`, `Baixo = 2`, `Zerado = 3` (valores ordenáveis por criticidade)

### `IEstoqueService.cs` — interface com os 5 métodos

### `EstoqueValidator.cs` — validadores FluentValidation

| Validator | Regras |
|---|---|
| `EntradaMercadoriaValidator` | quantidade > 0, custoUnitario >= 0, numeroNF max 100 chars |
| `SaidaManualValidator` | quantidade > 0, descricao max 500 chars |
| `AjusteInventarioValidator` | lista não vazia, sem produtos duplicados, quantidadeReal >= 0 |

### `EstoqueService.cs` — implementação

| Método | Comportamento |
|---|---|
| `EntradaMercadoria` | Valida produto + fornecedor; cria `Entrada/CompraFornecedor`; atualiza `PrecoCusto` se `custoUnitario > 0` |
| `SaidaManual` | Valida produto; cria `Saida/SaidaManual`; domínio rejeita se estoque insuficiente |
| `AjusteInventario` | Carrega todos os produtos upfront (falha cedo); cria `Inventario/InventarioPeriodico` só para os que mudaram; salva em uma única transação |
| `ObterPosicaoEstoque` | Todos os produtos ordenados por situação (Zerado → Baixo → OK), depois por nome |
| `ObterAlertasEstoqueMinimo` | Apenas produtos com `estoque <= 0 OR estoque < minimo`, mesma ordenação |

## Correção no Domain

`MovimentacaoEstoque.Criar` — agora permite `quantidade = 0` para tipo `Inventario` (contagem física pode ser zero; demais tipos continuam exigindo > 0).

## Registro em `DependencyInjection.cs`

```csharp
services.AddScoped<IEstoqueService, EstoqueService>();
```
