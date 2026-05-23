using ERP.Application.Cadastros.Common;
using ERP.Domain.Enums;

namespace ERP.Application.Cadastros.Clientes;

public record CreateClienteDto(
    string Nome,
    TipoPessoa TipoPessoa,
    string CpfCnpj,
    string? Email,
    string? Telefone,
    EnderecoDto? Endereco = null);

public record UpdateClienteDto(
    string Nome,
    string? Email,
    string? Telefone,
    EnderecoDto? Endereco = null);

public record ClienteResponseDto(
    Guid Id,
    string Nome,
    string TipoPessoa,
    string CpfCnpj,
    string? Email,
    string? Telefone,
    EnderecoDto? Endereco,
    DateTime CreatedAt,
    DateTime UpdatedAt);
