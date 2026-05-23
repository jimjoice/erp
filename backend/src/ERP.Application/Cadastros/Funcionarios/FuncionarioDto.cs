namespace ERP.Application.Cadastros.Funcionarios;

public record CreateFuncionarioDto(
    string Nome,
    string Cpf,
    string Cargo,
    decimal Salario,
    DateTime DataAdmissao,
    string? Telefone = null,
    string? Email = null,
    Guid? UsuarioId = null);

public record UpdateFuncionarioDto(
    string Nome,
    string Cargo,
    decimal Salario,
    string? Telefone = null,
    string? Email = null);

public record FuncionarioResponseDto(
    Guid Id,
    string Nome,
    string Cpf,
    string Cargo,
    decimal Salario,
    DateTime DataAdmissao,
    string? Telefone,
    string? Email,
    Guid? UsuarioId,
    DateTime CreatedAt,
    DateTime UpdatedAt);