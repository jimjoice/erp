using ERP.Application.Cadastros.Common;

namespace ERP.Application.Cadastros.Fornecedores;

public record CreateFornecedorDto(
    string RazaoSocial,
    string Cnpj,
    string? Email,
    string? Telefone,
    EnderecoDto? Endereco = null);

public record UpdateFornecedorDto(
    string RazaoSocial,
    string? Email,
    string? Telefone,
    EnderecoDto? Endereco = null);

public record FornecedorResponseDto(
    Guid Id,
    string RazaoSocial,
    string Cnpj,
    string? Email,
    string? Telefone,
    EnderecoDto? Endereco,
    DateTime CreatedAt,
    DateTime UpdatedAt);
