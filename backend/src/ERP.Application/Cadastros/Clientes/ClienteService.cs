using AutoMapper;
using ERP.Application.Cadastros.Common;
using ERP.Application.Common;
using ERP.Application.Interfaces;
using ERP.Domain.Entities;
using ERP.Domain.ValueObjects;

namespace ERP.Application.Cadastros.Clientes;

public class ClienteService(
    IRepository<Cliente> repository,
    IUnitOfWork unitOfWork,
    IMapper mapper) : IClienteService
{
    public async Task<Result<ClienteResponseDto>> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var cliente = await repository.GetByIdAsync(id, ct);
        return cliente is null
            ? Result<ClienteResponseDto>.NotFound("Cliente não encontrado.")
            : Result<ClienteResponseDto>.Ok(mapper.Map<ClienteResponseDto>(cliente));
    }

    public async Task<Result<PagedResult<ClienteResponseDto>>> GetPagedAsync(
        int page, int pageSize, string? search = null, CancellationToken ct = default)
    {
        var (items, total) = await repository.GetPagedAsync(
            page, pageSize,
            filter: search is { Length: > 0 } ? c => c.Nome.Contains(search) || c.CpfCnpj.Contains(search) : null,
            ct: ct);

        return Result<PagedResult<ClienteResponseDto>>.Ok(
            PagedResult<ClienteResponseDto>.Create(mapper.Map<List<ClienteResponseDto>>(items), total, page, pageSize));
    }

    public async Task<Result<ClienteResponseDto>> CreateAsync(
        CreateClienteDto dto, string criadoPor, CancellationToken ct = default)
    {
        var cpfCnpj = CpfCnpjHelper.SomenteDigitos(dto.CpfCnpj);

        if (await repository.ExistsAsync(c => c.CpfCnpj == cpfCnpj, ct))
            return Result<ClienteResponseDto>.Conflict($"CPF/CNPJ '{cpfCnpj}' já cadastrado.");

        Endereco? endereco = dto.Endereco is null ? null
            : new Endereco(dto.Endereco.Cep, dto.Endereco.Logradouro, dto.Endereco.Numero,
                           dto.Endereco.Complemento, dto.Endereco.Bairro, dto.Endereco.Cidade, dto.Endereco.Uf);

        var cliente = Cliente.Create(dto.Nome, dto.TipoPessoa, cpfCnpj, dto.Email, dto.Telefone, endereco, criadoPor);
        await repository.AddAsync(cliente, ct);
        await unitOfWork.SaveChangesAsync(ct);
        return Result<ClienteResponseDto>.Created(mapper.Map<ClienteResponseDto>(cliente));
    }

    public async Task<Result<ClienteResponseDto>> UpdateAsync(
        Guid id, UpdateClienteDto dto, string atualizadoPor, CancellationToken ct = default)
    {
        var cliente = await repository.GetByIdAsync(id, ct);
        if (cliente is null)
            return Result<ClienteResponseDto>.NotFound("Cliente não encontrado.");

        Endereco? endereco = dto.Endereco is null ? null
            : new Endereco(dto.Endereco.Cep, dto.Endereco.Logradouro, dto.Endereco.Numero,
                           dto.Endereco.Complemento, dto.Endereco.Bairro, dto.Endereco.Cidade, dto.Endereco.Uf);

        cliente.Atualizar(dto.Nome, dto.Email, dto.Telefone, atualizadoPor);
        cliente.AtualizarEndereco(endereco, atualizadoPor);
        await repository.UpdateAsync(cliente, ct);
        await unitOfWork.SaveChangesAsync(ct);
        return Result<ClienteResponseDto>.Ok(mapper.Map<ClienteResponseDto>(cliente));
    }

    public async Task<Result> DeleteAsync(Guid id, string deletadoPor, CancellationToken ct = default)
    {
        var cliente = await repository.GetByIdAsync(id, ct);
        if (cliente is null)
            return Result.NotFound("Cliente não encontrado.");

        cliente.Delete(deletadoPor);
        await repository.UpdateAsync(cliente, ct);
        await unitOfWork.SaveChangesAsync(ct);
        return Result.Ok(204);
    }

    public async Task<Result<ClienteResponseDto>> GetByCpfCnpjAsync(string cpfCnpj, CancellationToken ct = default)
    {
        var digits = CpfCnpjHelper.SomenteDigitos(cpfCnpj);
        var clientes = await repository.FindAsync(c => c.CpfCnpj == digits, ct);
        var cliente = clientes.FirstOrDefault();
        return cliente is null
            ? Result<ClienteResponseDto>.NotFound("Cliente não encontrado.")
            : Result<ClienteResponseDto>.Ok(mapper.Map<ClienteResponseDto>(cliente));
    }
}
