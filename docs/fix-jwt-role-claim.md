# Correção: Autorização JWT com claims de role

**Data:** 2026-05-23
**Módulo:** ERP.API / ERP.Application.Auth
**Sintoma:** Endpoint `GET /api/v1/chat/historico` retornava 401 mesmo com token válido de Admin.

---

## Causa raiz

O problema estava em uma incompatibilidade entre o nome da claim de role gravada no token JWT e o nome que o middleware de autorização esperava encontrar no `ClaimsPrincipal`.

### Como o fluxo funcionava (incorreto)

1. **Geração do token** — `AuthService.BuildClaims` usava `new Claim(ClaimTypes.Role, perfil)`.
   - `ClaimTypes.Role` é a constante `"http://schemas.microsoft.com/ws/2008/06/identity/claims/role"`.
   - O `JwtSecurityTokenHandler`, via `DefaultOutboundClaimTypeMap`, traduz esse nome longo para o nome curto `"role"` ao serializar o JWT.
   - Resultado no payload do token: `"role": "Admin"`.

2. **Validação do token** — `Program.cs` continha `JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear()`.
   - Essa chamada apagava o mapa de remapeamento de entrada **globalmente** (campo estático).
   - Sem o mapa, o middleware JwtBearer lia a claim `"role"` do payload e a mantinha como `"role"` no `ClaimsPrincipal` — sem traduzir de volta para `ClaimTypes.Role`.

3. **Verificação de policy** — As policies usavam `.RequireRole("Admin")`.
   - Internamente, `RequireRole` chama `ClaimsPrincipal.IsInRole("Admin")`.
   - `IsInRole` procura por claims cujo tipo seja `ClaimsIdentity.RoleClaimType`, que por padrão é `ClaimTypes.Role` (`"http://schemas.microsoft.com/ws/2008/06/identity/claims/role"`).
   - O `ClaimsPrincipal` tinha a claim com tipo `"role"` (nome curto), não o URI longo.
   - Resultado: `IsInRole` retornava `false` → 401/403.

4. **Efeito colateral em `RefreshTokenAsync`** — `principal.FindFirst(ClaimTypes.Role)` também falhava pelo mesmo motivo, retornando `null` e lançando `NullReferenceException` no refresh.

### Diagrama do problema

```
Token payload: { "role": "Admin" }
                        │
            (DefaultInboundClaimTypeMap vazio)
                        │
                        ▼
ClaimsPrincipal: Claim{ Type = "role", Value = "Admin" }
                        │
         RequireRole("Admin") → IsInRole("Admin")
                        │
         procura: Claim{ Type = ClaimTypes.Role }
                        │
                      ❌ não encontrada → 401
```

---

## Solução aplicada

Optou-se pela **Opção 3** (mais simples e sem efeito global): usar o nome curto `"role"` de forma consistente em todo o fluxo e configurar o middleware para reconhecê-lo como claim de role.

### Mudanças em `Program.cs`

**Antes:**
```csharp
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear(); // mutação estática global ❌

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
```

**Depois:**
```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;           // escopo correto: só afeta este handler ✅
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero,
            RoleClaimType = "role"                  // informa ao middleware qual claim é a role ✅
        };
```

**Por quê `MapInboundClaims = false` é melhor que o `Clear()` global:**
- `DefaultInboundClaimTypeMap` é um campo estático — afeta toda a aplicação, inclusive bibliotecas de terceiros que usem o handler.
- `options.MapInboundClaims = false` tem escopo restrito à instância do JwtBearer configurada.

**Por quê `RoleClaimType = "role"` resolve o `RequireRole`:**
- Ao validar o token, o middleware cria o `ClaimsIdentity` usando o valor de `RoleClaimType` como tipo de role.
- `ClaimsPrincipal.IsInRole("Admin")` passa a procurar por `Claim{ Type = "role" }`, que é exatamente o que o token contém.
- As policies (`.RequireRole("Admin")`) não precisaram ser alteradas.

### Mudanças em `AuthService.cs`

**`BuildClaims` — antes:**
```csharp
new(ClaimTypes.Role, perfil)
```

**`BuildClaims` — depois:**
```csharp
new("role", perfil)
```

Usar o nome curto diretamente elimina a dependência do `DefaultOutboundClaimTypeMap` para a tradução e torna a intenção explícita.

**`RefreshTokenAsync` — antes:**
```csharp
var role = principal.FindFirst(ClaimTypes.Role)!.Value;
```

**`RefreshTokenAsync` — depois:**
```csharp
var role = principal.FindFirst("role")!.Value;
```

Lê a claim pelo mesmo nome com que foi gravada no token.

### Diagrama do fluxo corrigido

```
BuildClaims: new Claim("role", "Admin")
                        │
             JwtSecurityTokenHandler serializa
                        │
                        ▼
Token payload: { "role": "Admin" }
                        │
          MapInboundClaims = false → "role" permanece "role"
                        │
                        ▼
ClaimsPrincipal: Claim{ Type = "role", Value = "Admin" }
                        │
         RequireRole("Admin") → IsInRole("Admin")
                        │
     RoleClaimType = "role" → procura Claim{ Type = "role" }
                        │
                      ✅ encontrada → autorizado
```

---

## Arquivos alterados

| Arquivo | Linha | Alteração |
|---|---|---|
| `ERP.API/Program.cs` | 52 | Removido `JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear()` |
| `ERP.API/Program.cs` | 56 | Adicionado `options.MapInboundClaims = false` |
| `ERP.API/Program.cs` | 63 | Adicionado `RoleClaimType = "role"` em `TokenValidationParameters` |
| `ERP.Application/Auth/AuthService.cs` | 56 | `FindFirst(ClaimTypes.Role)` → `FindFirst("role")` |
| `ERP.Application/Auth/AuthService.cs` | 83 | `new(ClaimTypes.Role, perfil)` → `new("role", perfil)` |

---

## Como verificar

```bash
# 1. Obter token
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@erp.com","senha":"Admin@123"}'

# 2. Testar endpoint protegido
curl http://localhost:5000/api/v1/chat/historico \
  -H "Authorization: Bearer <token>"

# Esperado: 200 OK (antes retornava 401)
```
