# Passo 4.2 — Serviço de Vendas

Passo 4.2 concluído — 9 arquivos criados/atualizados, build limpo (0 erros, 0 avisos).

## O que foi criado

| Camada | Arquivo | Conteúdo |
|--------|---------|----------|
| Domain | `Enums/StatusContaReceber.cs` | Aberta / Paga / Cancelada |
| Domain | `Entities/ContaReceber.cs` | Entidade com `Pagar()` e `Cancelar()` |
| Application | `Interfaces/IVendaRepository.cs` | Contrato com `GetByIdComItensAsync` + filtros paginados |
| Application | `Vendas/VendaDto.cs` | 7 input DTOs + 4 response DTOs |
| Application | `Vendas/VendaValidator.cs` | Validators FluentValidation para cada input |
| Application | `Vendas/IVendaService.cs` | Interface com 8 métodos |
| Application | `Vendas/VendaService.cs` | Implementação completa |
| Application | `Vendas/VendasProfile.cs` | AutoMapper profile |
| Application | `DependencyInjection.cs` | `IVendaService → VendaService` registrado |

## Destaques de `FinalizarAsync`

1. Re-verifica estoque atual de cada item (pode ter mudado desde o orçamento)
2. Valida `∑pagamentos >= total da venda`
3. Adiciona pagamentos → `Confirmar()` → tudo dentro do aggregate
4. Cria `MovimentacaoEstoque(Saida/VendaPdv)` por item + `UpdateAsync(produto)`
5. Gera `ContaReceber`: formas imediatas (Dinheiro/Pix/Débito) → 1 registro já pago; Crédito/Crediário → N parcelas com vencimentos a cada 30 dias
6. Salva tudo em **um único `SaveChangesAsync`**

## Próximo passo sugerido

**4.3 — Infrastructure**: configuração EF Core para `ContaReceber`, `IVendaRepository` com eager loading, sequence para `Numero`, migrations.
