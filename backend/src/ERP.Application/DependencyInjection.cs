using ERP.Application.Auth;
using ERP.Application.Cadastros.Categorias;
using ERP.Application.Cadastros.Clientes;
using ERP.Application.Cadastros.Fornecedores;
using ERP.Application.Cadastros.Funcionarios;
using ERP.Application.Cadastros.Produtos;
using ERP.Application.Chat;
using ERP.Application.Estoque;
using ERP.Application.Financeiro;
using ERP.Application.Vendas;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace ERP.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(DependencyInjection).Assembly));
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        // Auth
        services.AddScoped<IAuthService, AuthService>();

        // Cadastros
        services.AddScoped<ICategoriaService,   CategoriaService>();
        services.AddScoped<IProdutoService,     ProdutoService>();
        services.AddScoped<IClienteService,     ClienteService>();
        services.AddScoped<IFornecedorService,  FornecedorService>();
        services.AddScoped<IFuncionarioService, FuncionarioService>();

        // Estoque
        services.AddScoped<IEstoqueService, EstoqueService>();

        // Vendas
        services.AddScoped<IVendaService, VendaService>();

        // Financeiro
        services.AddScoped<IFinanceiroService, FinanceiroService>();

        // Chat
        services.AddScoped<IChatService, ChatService>();

        return services;
    }
}
