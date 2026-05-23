using ERP.Application.Chat;
using ERP.Application.Interfaces;
using ERP.Domain.Entities;
using ERP.Infrastructure.ExternalServices;
using ERP.Infrastructure.Persistence;
using ERP.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ERP.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options
                .UseNpgsql(configuration["DATABASE_URL"]
                    ?? throw new InvalidOperationException("DATABASE_URL não configurado."))
                .UseSnakeCaseNamingConvention());

        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<AppDbContext>());

        // Fallback genérico para entidades sem repositório específico
        services.AddScoped(typeof(IRepository<>), typeof(BaseRepository<>));

        // Cadastros
        services.AddScoped<ICategoriaRepository,   CategoriaRepository>();
        services.AddScoped<IRepository<Categoria>, CategoriaRepository>();

        services.AddScoped<IProdutoRepository,     ProdutoRepository>();
        services.AddScoped<IRepository<Produto>,   ProdutoRepository>();

        services.AddScoped<IClienteRepository,     ClienteRepository>();
        services.AddScoped<IRepository<Cliente>,   ClienteRepository>();

        services.AddScoped<IFornecedorRepository,     FornecedorRepository>();
        services.AddScoped<IRepository<Fornecedor>,   FornecedorRepository>();

        services.AddScoped<IFuncionarioRepository,     FuncionarioRepository>();
        services.AddScoped<IRepository<Funcionario>,   FuncionarioRepository>();

        // Estoque
        services.AddScoped<IMovimentacaoEstoqueRepository,         MovimentacaoEstoqueRepository>();
        services.AddScoped<IRepository<MovimentacaoEstoque>,       MovimentacaoEstoqueRepository>();

        // Vendas
        services.AddScoped<IVendaRepository, VendaRepository>();

        // Financeiro
        services.AddScoped<IContaReceberRepository,     ContaReceberRepository>();
        services.AddScoped<IRepository<ContaReceber>,   ContaReceberRepository>();

        services.AddScoped<IContaPagarRepository,       ContaPagarRepository>();
        services.AddScoped<IRepository<ContaPagar>,     ContaPagarRepository>();

        services.AddScoped<ILancamentoCaixaRepository,     LancamentoCaixaRepository>();
        services.AddScoped<IRepository<LancamentoCaixa>,   LancamentoCaixaRepository>();

        // Usuários
        services.AddScoped<IUsuarioRepository, UsuarioRepository>();

        // Chat
        services.AddScoped<IChatSessaoRepository,     ChatSessaoRepository>();
        services.AddScoped<IRepository<ChatSessao>,   ChatSessaoRepository>();

        services.AddScoped<IChatMensagemRepository,     ChatMensagemRepository>();
        services.AddScoped<IRepository<ChatMensagem>,   ChatMensagemRepository>();

        services.AddHttpClient<IN8nWebhookClient, N8nWebhookClient>(client =>
            client.Timeout = System.Threading.Timeout.InfiniteTimeSpan);

        return services;
    }
}