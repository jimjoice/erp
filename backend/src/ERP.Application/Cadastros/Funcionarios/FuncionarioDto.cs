namespace ERP.Application.Cadastros.Funcionarios;

public record CreateFuncionarioDto(
    string Nome,
    string Cpf,
    string Cargo,
    decimal Salario,
    DateTime DataAdmissao,
    Guid? UsuarioId = null);

public record UpdateFuncionarioDto(
    string Nome,
    string Cargo,
    decimal Salario);

public record FuncionarioResponseDto(
    Guid Id,
    string Nome,
    string Cpf,
    string Cargo,
    decimal Salario,
    DateTime DataAdmissao,
    Guid? UsuarioId,
    DateTime CreatedAt,
    DateTime UpdatedAt);
