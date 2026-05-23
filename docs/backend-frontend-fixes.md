# Correções de Backend e Frontend

## Resumo

Quatro problemas foram identificados e corrigidos: registro do endpoint de funcionários no backend, criação de duas páginas ausentes no frontend, e confirmação de que o `dashboard-service.ts` já estava corrigido de uma sessão anterior.

---

## 1. Endpoint de Funcionários (Backend)

### Problema

O módulo de funcionários tinha toda a camada de aplicação implementada (`FuncionarioService`, `IFuncionarioService`, `FuncionarioDto`, `FuncionarioValidator`, `FuncionarioRepository`) mas **não havia arquivo de endpoints na camada API**. Por consequência, `app.MapFuncionarios()` também não existia em `Program.cs`.

### Solução

#### Arquivo criado: `ERP.API/Endpoints/FuncionariosEndpoints.cs`

Implementa os cinco endpoints CRUD padrão para `/api/v1/funcionarios`:

| Método | Rota | Autorização | Descrição |
|--------|------|-------------|-----------|
| `GET` | `/api/v1/funcionarios` | Gerente | Lista paginada com filtro por nome (`search`) |
| `GET` | `/api/v1/funcionarios/{id}` | Gerente | Obtém funcionário por ID |
| `POST` | `/api/v1/funcionarios` | Admin | Cadastra novo funcionário |
| `PUT` | `/api/v1/funcionarios/{id}` | Admin | Atualiza cargo e salário |
| `DELETE` | `/api/v1/funcionarios/{id}` | Admin | Remove (soft delete) |

Seguiu o mesmo padrão dos demais endpoints: validação via `IValidator<T>`, extração do usuário autenticado via `httpContext.User.FindFirst("sub")`, e retorno via `result.ToHttpResult()`.

#### Arquivo alterado: `ERP.API/Program.cs`

```csharp
app.MapFinanceiro();
app.MapFuncionarios();   // ← adicionado
app.MapChat();
```

---

## 2. Página `/fiscal` (Frontend)

### Problema

A rota `/fiscal` não tinha página, resultando em erro 404 ao navegar para ela.

### Solução

#### Arquivo criado: `app/(dashboard)/fiscal/page.tsx`

Página informativa que lista os seis sub-módulos do módulo fiscal com seu status atual:

| Sub-módulo | Status |
|---|---|
| NFC-e (modelo 65) | Planejado |
| NF-e (modelo 55) | Planejado |
| Integração SEFAZ | Planejado |
| Cálculo de Tributos (ICMS, PIS, COFINS, IPI) | Planejado |
| Reforma Tributária 2026 (CBS/IBS) | Aguardando regulamentação |
| SPED Fiscal e Contribuições | Planejado |

A página exibe um banner de alerta explicando que a integração requer **certificado digital A1/A3** e **homologação junto à SEFAZ** do estado, e que os recursos estarão disponíveis nas próximas versões.

**Decisão de design:** como não há endpoint de fiscal no backend, criar uma tela com dados fictícios seria enganoso. A abordagem informativa é mais honesta e já prepara o usuário para o que virá.

---

## 3. Página `/cadastros/produtos` (Frontend)

### Problema

A rota `/cadastros/produtos` não existia, mas a página completa de produtos já estava implementada em `/produtos/page.tsx`.

### Solução

#### Arquivo criado: `app/(dashboard)/cadastros/produtos/page.tsx`

```typescript
export { default } from "@/app/(dashboard)/produtos/page";
```

Re-exporta o componente existente sem duplicar código. Qualquer alteração futura em `ProdutosPage` reflete automaticamente nas duas rotas.

---

## 4. `dashboard-service.ts` (Sem alteração)

O serviço já havia sido corrigido em uma sessão anterior para usar as APIs reais:

- `obterResumo` → `Promise.all` com `/vendas/resumo-dia` + `/financeiro/resumo`
- `obterFaturamento7Dias` → `/vendas?pageSize=100&dataInicio=...&dataFim=...` agrupado por dia
- `obterPagamentosHoje` → mesma rota com datas de hoje, agrupado por forma de pagamento
- `obterUltimasVendas` → `/vendas?pageSize=5&page=1`, retorna `data.items`
- `obterAlertas` → `/estoque/alertas`

Nenhuma alteração foi necessária.

---

## 5. Restart do container

Após as alterações no backend, o container foi reiniciado para aplicar as mudanças:

```bash
docker compose restart backend
```

---

## Arquivos alterados

| Arquivo | Operação |
|---|---|
| `backend/src/ERP.API/Endpoints/FuncionariosEndpoints.cs` | Criado |
| `backend/src/ERP.API/Program.cs` | Alterado — `app.MapFuncionarios()` adicionado |
| `frontend/src/app/(dashboard)/fiscal/page.tsx` | Criado |
| `frontend/src/app/(dashboard)/cadastros/produtos/page.tsx` | Criado |
