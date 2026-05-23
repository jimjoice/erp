using System.Text;
using System.Threading.RateLimiting;
using ERP.API.Endpoints;
using ERP.API.HealthChecks;
using ERP.API.Middleware;
using ERP.API.Swagger;
using ERP.Application;
using ERP.Infrastructure;
using ERP.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Serilog;
using Serilog.Formatting.Compact;
using System.IdentityModel.Tokens.Jwt;

// Bootstrap logger: captura erros antes do host ser construído
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    // ── Serilog ──────────────────────────────────────────────────────────────
    builder.Host.UseSerilog((ctx, lc) => lc
        .ReadFrom.Configuration(ctx.Configuration)
        .Enrich.FromLogContext()
        .WriteTo.Console(ctx.HostingEnvironment.IsDevelopment()
            ? new Serilog.Formatting.Display.MessageTemplateTextFormatter(
                "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
            : new CompactJsonFormatter())
        .WriteTo.File(
            new CompactJsonFormatter(),
            "logs/erp-.json",
            rollingInterval: RollingInterval.Day,
            retainedFileCountLimit: 30));

    // ── Application (serviços, AutoMapper, FluentValidation) ─────────────────
    builder.Services.AddApplication();

    // ── Infraestrutura ───────────────────────────────────────────────────────
    builder.Services.AddInfrastructure(builder.Configuration);

    // ── JWT Bearer ───────────────────────────────────────────────────────────
    var jwtSecret = builder.Configuration["JWT_SECRET"]
        ?? throw new InvalidOperationException("JWT_SECRET não configurado.");
	
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.MapInboundClaims = false;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero,
                RoleClaimType = "role"
            };

            options.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = ctx =>
                {
                    ctx.Response.Headers.Append(
                        "X-Token-Expired",
                        ctx.Exception is SecurityTokenExpiredException ? "true" : "false");
                    return Task.CompletedTask;
                },
                OnChallenge = ctx =>
                {
                    ctx.HandleResponse();
                    ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    ctx.Response.ContentType = "application/problem+json";
                    return ctx.Response.WriteAsJsonAsync(new Microsoft.AspNetCore.Mvc.ProblemDetails
                    {
                        Status = 401,
                        Title = "Não autenticado",
                        Detail = "Token ausente ou inválido.",
                        Instance = ctx.Request.Path
                    });
                }
            };
        });

    // ── Autorização por perfil ────────────────────────────────────────────────
    builder.Services.AddAuthorizationBuilder()
        .AddPolicy("Admin",      p => p.RequireRole("Admin"))
        .AddPolicy("Gerente",    p => p.RequireRole("Admin", "Gerente"))
        .AddPolicy("Vendedor",   p => p.RequireRole("Admin", "Gerente", "Vendedor"))
        .AddPolicy("Financeiro", p => p.RequireRole("Admin", "Financeiro"));

    // ── CORS ─────────────────────────────────────────────────────────────────
    var frontendOrigins = builder.Configuration
        .GetSection("Cors:AllowedOrigins")
        .Get<string[]>()
        ?? ["http://localhost:3000", "https://localhost:3000"];

    builder.Services.AddCors(options =>
        options.AddPolicy("Frontend", policy =>
            policy.WithOrigins(frontendOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials()));

    // ── Rate Limiting ─────────────────────────────────────────────────────────
    builder.Services.AddRateLimiter(options =>
    {
        options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                factory: _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 100,
                    Window = TimeSpan.FromMinutes(1),
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = 5
                }));

        options.OnRejected = async (context, token) =>
        {
            context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
            context.HttpContext.Response.Headers.RetryAfter = "60";
            await context.HttpContext.Response.WriteAsJsonAsync(
                new Microsoft.AspNetCore.Mvc.ProblemDetails
                {
                    Status = 429,
                    Title = "Muitas requisições",
                    Detail = "Limite de 100 requisições por minuto excedido. Aguarde antes de tentar novamente.",
                    Instance = context.HttpContext.Request.Path
                }, token);
        };
    });

    // ── Health Checks ─────────────────────────────────────────────────────────
    builder.Services.AddHealthChecks()
        .AddCheck("self", () => HealthCheckResult.Healthy("Aplicação funcionando"))
        .AddCheck<DatabaseHealthCheck>("database");

    // ── Swagger / OpenAPI ─────────────────────────────────────────────────────
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "ERP Varejo API",
            Version = "v1",
            Description = "API do sistema ERP para varejo de pequeno porte"
        });

        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Informe o token JWT no campo acima. Exemplo: eyJhbGci..."
        });

        c.OperationFilter<BearerSecurityOperationFilter>();
    });

    // ── ProblemDetails ────────────────────────────────────────────────────────
    builder.Services.AddProblemDetails();

    // ── Build ─────────────────────────────────────────────────────────────────
    var app = builder.Build();

    // ── Pipeline ──────────────────────────────────────────────────────────────
    // Ordem importa: exceções primeiro, depois CORS, logging, rate limiting, auth
    app.UseMiddleware<GlobalExceptionMiddleware>();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "ERP Varejo API v1");
            c.DisplayRequestDuration();
        });
    }

    app.UseCors("Frontend");

    app.UseSerilogRequestLogging(opts =>
    {
        opts.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
        opts.EnrichDiagnosticContext = (dc, httpContext) =>
        {
            dc.Set("RequestHost",   httpContext.Request.Host.Value);
            dc.Set("RequestScheme", httpContext.Request.Scheme);
            dc.Set("UserAgent",     httpContext.Request.Headers.UserAgent.ToString());
            dc.Set("UserId",        httpContext.User.FindFirst("sub")?.Value ?? "anonymous");
        };
    });

    app.UseRateLimiter();
    app.UseAuthentication();
    app.UseAuthorization();

    // ── Endpoints ─────────────────────────────────────────────────────────────
    app.MapAuth();
    app.MapProdutos();
    app.MapClientes();
    app.MapFornecedores();
    app.MapEstoque();
    app.MapVendas();
    app.MapFinanceiro();
    app.MapFuncionarios();
    app.MapChat();

    app.MapHealthChecks("/api/v1/health", new HealthCheckOptions
    {
        ResponseWriter = async (context, report) =>
        {
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                status    = report.Status.ToString(),
                timestamp = DateTime.UtcNow,
                duration  = report.TotalDuration,
                components = report.Entries.ToDictionary(
                    e => e.Key,
                    e => new
                    {
                        status      = e.Value.Status.ToString(),
                        description = e.Value.Description,
                        duration    = e.Value.Duration
                    })
            });
        }
    }).AllowAnonymous();

    app.Run();
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    Log.Fatal(ex, "Aplicação encerrou inesperadamente");
}
finally
{
    Log.CloseAndFlush();
}
