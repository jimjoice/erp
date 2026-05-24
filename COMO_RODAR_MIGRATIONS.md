# Como Rodar Migrations — ERP Varejo

## Pré-requisitos

- Docker Desktop em execução
- .NET SDK 10 instalado
- `dotnet-ef` tools instalado globalmente:
  ```bash
  dotnet tool install --global dotnet-ef
  ```

---

## 1. Primeira vez (banco do zero)

```bash
# 1. Suba apenas o PostgreSQL e Redis:
docker compose up -d postgres redis

# 2. Suba a aplicação — ela aplica as migrations e o seed automaticamente:
docker compose up -d api
```

A aplicação executa na inicialização:
1. `context.Database.MigrateAsync()` — aplica todas as migrations pendentes
2. `DataSeeder.SeedAsync()` — insere dados iniciais **somente se o banco estiver vazio**

### Credenciais iniciais
| Perfil    | E-mail                 | Senha          |
|-----------|------------------------|----------------|
| Admin     | admin@erp.local        | Admin@123      |
| Vendedor  | vendedor@erp.local     | Vendedor@123   |

---

## 2. Criar uma nova migration manualmente

Execute a partir da raiz do repositório, com o projeto `ERP.Infrastructure` como alvo:

```bash
dotnet ef migrations add NomeDaMigration \
  --project backend/src/ERP.Infrastructure \
  --startup-project backend/src/ERP.API \
  --output-dir Persistence/Migrations
```

Substitua `NomeDaMigration` por um nome descritivo em PascalCase (ex.: `AddColunaXEmProdutos`).

---

## 3. Aplicar migrations manualmente (sem subir a API)

```bash
dotnet ef database update \
  --project backend/src/ERP.Infrastructure \
  --startup-project backend/src/ERP.API
```

Para aplicar até uma migration específica:

```bash
dotnet ef database update NomeDaMigration \
  --project backend/src/ERP.Infrastructure \
  --startup-project backend/src/ERP.API
```

---

## 4. Reverter uma migration

```bash
# Volta para a migration anterior (ou para o estado "sem migrations"):
dotnet ef database update NomeDaMigrationAnterior \
  --project backend/src/ERP.Infrastructure \
  --startup-project backend/src/ERP.API

# Remove o arquivo da migration mais recente do projeto:
dotnet ef migrations remove \
  --project backend/src/ERP.Infrastructure \
  --startup-project backend/src/ERP.API
```

> **Importante:** `migrations remove` só funciona se a migration ainda **não foi aplicada** ao banco.

---

## 5. Resetar o banco completamente em desenvolvimento

```bash
# Para todos os containers e apaga os volumes:
docker compose down -v

# Sobe tudo do zero (banco + migrations + seed automáticos):
docker compose up -d
```

> Isso apaga todos os dados. Use apenas em desenvolvimento.

---

## Variáveis de ambiente necessárias

O arquivo `backend/src/ERP.API/appsettings.Development.json` (ou `.env`) deve conter:

```json
{
  "DATABASE_URL": "Host=localhost;Database=erp_varejo;Username=erp;Password=erp123",
  "JWT_SECRET": "sua_chave_secreta_com_minimo_32_chars",
  "REDIS_URL": "redis://localhost:6379"
}
```

---

## Estrutura dos arquivos de migration

```
backend/src/ERP.Infrastructure/Persistence/Migrations/
├── <timestamp>_InitialCreate.cs          ← lógica Up/Down
├── <timestamp>_InitialCreate.Designer.cs ← snapshot EF (não editar)
└── AppDbContextModelSnapshot.cs          ← snapshot do modelo atual (não editar)
```
