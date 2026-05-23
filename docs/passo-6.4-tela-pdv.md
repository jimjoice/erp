# Passo 6.4 — Tela de PDV (Ponto de Venda)

## Arquivos criados (10)

| Arquivo | Responsabilidade |
|---|---|
| `src/types/venda.ts` | `ItemCarrinho`, `PagamentoRascunho`, `VendaConfirmada`, enum `FormaPagamento` + mapa de inteiros para a API |
| `src/store/pdv-store.ts` | Zustand sem persist — carrinho, desconto%, `adicionarOuIncrementar` (merge se produto já existe), `incrementar`/`decrementar`/`setQuantidade`, subtotal/total computados |
| `src/services/venda-service.ts` | `criar()` — distribui desconto global proporcional por item ao montar `CriarOrcamentoDto`; `finalizar()` — mapeia formas para inteiros do enum .NET |
| `src/hooks/use-busca-produto-pdv.ts` | React Query com `enabled` só quando busca ≥ 2 chars, `staleTime` 30s |
| `src/components/pdv/pdv-busca.tsx` | Input com dropdown: debounce 250ms, navegação ↑↓ + Enter, badge "No carrinho" / "Sem estoque", `forwardRef` para `focus()` externo (F2) |
| `src/components/pdv/pdv-carrinho.tsx` | Tabela com controles +/- inline, input de quantidade editável, exibe limite de estoque |
| `src/components/pdv/pdv-resumo.tsx` | Painel direito: contador de itens, subtotal, campo de desconto 0–30%, total em destaque, botões Finalizar (F4) / Cancelar (ESC) com `<kbd>` |
| `src/components/pdv/pdv-modal-pagamento.tsx` | Até 3 formas de pagamento; parcelas apenas para Crédito/Crediário; mostra Falta (vermelho) ou Troco (verde); confirma apenas quando `totalPago ≥ total` |
| `src/components/pdv/pdv-modal-cancelar.tsx` | Dialog de confirmação de cancelamento |
| `src/app/(dashboard)/pdv/page.tsx` | Orquestra tudo; chama `criar()` + `finalizar()` em sequência; overlay de sucesso com troco; atalhos F2/F4/ESC |

---

## Layout da tela

```
┌──────────────────────────────────────────────────────────┐
│ sidebar │  PDV — Ponto de Venda    F2 buscar · F4 finalizar · ESC cancelar │
│         ├─────────────────────────────────────┬──────────┤
│         │  [ 🔍 Buscar produto... ]            │          │
│         ├─────────────────────────────────────┤  RESUMO  │
│         │                                     │          │
│         │  Produto         Qtd   Unit  Sub     │ Itens: 3 │
│         │  ─────────────   ───   ────  ────   │          │
│         │  Camiseta P  [−][1][+] R$50 R$50    │ Subtotal │
│         │  Calça M     [−][2][+] R$80 R$160   │ Desconto │
│         │  ...                                 │ Total    │
│         │                                     │          │
│         │                                     │[F4]Final.│
│         │                                     │[ESC]Canc.│
│         └─────────────────────────────────────┴──────────┘
```

---

## Fluxo de finalização

```
F4 (ou botão Finalizar)
  → Modal de Pagamento abre
      Usuário escolhe forma(s) e valor(es)
      Sistema calcula Falta ou Troco em tempo real
  → "Confirmar pagamento" (habilitado quando totalPago ≥ total)
      → vendaService.criar()
            POST /api/v1/vendas
            Payload: CriarOrcamentoDto com itens e desconto distribuído
      → vendaService.finalizar()
            POST /api/v1/vendas/{id}/finalizar
            Payload: FinalizarVendaDto com formas de pagamento
  → Overlay de sucesso:
      "Venda #N finalizada!"
      Total pago + Troco (se houver)
  → "Nova venda" → limpar carrinho → foco no campo de busca
```

---

## Atalhos de teclado

| Tecla | Ação |
|---|---|
| `F2` | Foca o campo de busca de produto |
| `F4` | Abre o modal de pagamento (se houver itens no carrinho) |
| `ESC` | Abre confirmação de cancelamento da venda (se houver itens, e nenhum modal aberto) |
| `↑` / `↓` | Navega entre os resultados da busca |
| `Enter` | Adiciona o produto em destaque no dropdown ao carrinho |

---

## Busca de produto (pdv-busca.tsx)

- Debounce de **250ms** para evitar requisições a cada tecla
- Ativada apenas quando a busca tem **≥ 2 caracteres**
- Resultados em dropdown absoluto com:
  - Nome, SKU e código de barras
  - Preço de venda em destaque
  - Badge **"No carrinho"** se o produto já foi adicionado
  - Badge **"Sem estoque"** (item desabilitado) se `estoqueAtual = 0`
- `forwardRef` + `useImperativeHandle` expõe `focus()` para o atalho F2 da página pai
- Adicionar um produto já no carrinho incrementa a quantidade (merge automático no store)

---

## Carrinho (pdv-store.ts + pdv-carrinho.tsx)

### Store Zustand (sem persist)
- `adicionarOuIncrementar` — se `produtoId` já existe, incrementa; senão cria nova linha
- `incrementar` / `decrementar` — respeita limite `estoqueAtual`
- `setQuantidade` — clampa entre 1 e `estoqueAtual`
- `setDesconto` — clampa entre 0 e 30 (%)
- `subtotal()`, `descontoValor()`, `total()` — funções derivadas, calculadas em tempo real

### Tabela do carrinho
- Controles `[−][qtd][+]` inline por item
- Input de quantidade editável diretamente
- Exibe limite de estoque disponível abaixo dos controles
- Botão de remoção individual por linha
- Estado vazio com ícone e instruções

---

## Desconto global

O usuário digita um percentual (0–30%) no painel de resumo. O desconto é calculado no frontend:

```
descontoValor = subtotal × (percentual / 100)
total = subtotal - descontoValor
```

Na hora de enviar para a API, o desconto é **distribuído proporcionalmente por item**:

```
itemDesconto = descontoTotal × (itemSubtotal / subtotal)
```

Isso respeita o campo `Desconto` de cada `ItemOrcamentoDto` no backend, já que não há endpoint específico para desconto global no orçamento.

---

## Modal de pagamento (pdv-modal-pagamento.tsx)

- Abre com **1 pagamento pré-preenchido** em Dinheiro com o valor total
- Até **3 formas de pagamento** simultâneas (split payment)
- Campos por pagamento: forma de pagamento + valor
- **Parcelas** visíveis apenas para Crédito e Crediário (máx. 12x), com cálculo do valor por parcela
- Resumo dinâmico:
  - **Falta** (vermelho) — quando `totalPago < total`
  - **Troco** (verde) — quando `totalPago > total`
- Botão "Confirmar" habilitado somente quando `totalPago ≥ total`
- Spinner durante o processamento da API

---

## Overlay de sucesso

Após a venda confirmada, a tela exibe:
- Ícone de check verde animado
- Número da venda
- Total pago
- **Troco em destaque** (caixa verde) quando há troco a devolver
- Botão "Nova venda" que limpa o carrinho e foca o campo de busca

---

## Decisões de arquitetura

### Por que Zustand sem persist para o carrinho?

O carrinho PDV é uma sessão de trabalho de curta duração — se o usuário fechar o tab ou navegar para outra tela, faz sentido o carrinho ser limpo. Persistir em localStorage criaria situações confusas (carrinho "fantasma" de uma venda anterior). O middleware do Next.js já protege a rota, então ao retornar à tela a sessão da venda anterior está encerrada.

### Por que criar + finalizar em sequência e não em uma só chamada?

A API backend segue o modelo Orçamento → Confirmada. O PDV cria um orçamento e imediatamente o finaliza. Isso permite que no futuro o fluxo seja expandido (ex.: salvar orçamento, retomar depois), sem mudar a interface do backend.

### Por que os atalhos de teclado usam `window.addEventListener` e não `onKeyDown` no elemento?

Os atalhos F2/F4/ESC precisam funcionar globalmente — independente de qual elemento está com foco. `onKeyDown` só captura eventos dentro do elemento. O listener no `window` captura qualquer tecla, com limpeza no retorno do `useEffect`.
