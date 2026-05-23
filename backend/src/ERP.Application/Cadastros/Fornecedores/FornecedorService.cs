using AutoMapper;
using ERP.Application.Cadastros.Common;
using ERP.Application.Common;
using ERP.Application.Interfaces;
using ERP.Domain.Entities;
using ERP.Domain.ValueObjects;

namespace ERP.Application.Cadastros.Fornecedores;

public class FornecedorService(
    IRepository<Fornecedor> repository,
    IUnitOfWork unitOfWork,
    IMapper mapper) : IFornecedorService
{
    public async Task<Result<FornecedorResponseDto>> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var fornecedor = await repository.GetByIdAsync(id, ct);
        return fornecedor is null
            ? Result<FornecedorResponseDto>.NotFound("Fornecedor não encontrado.")
            : Result<FornecedorResponseDto>.Ok(mapper.Map<FornecedorResponseDto>(fornecedor));
    }

    public async Task<Result<PagedResult<FornecedorResponseDto>>> GetPagedAsync(
        int page, int pageSize, string? search = null, CancellationToken ct = default)
    {
        var (items, total) = await repository.GetPagedAsync(
            page, pageSize,
            filter: search is { Length: > 0 } ? f => f.RazaoSocial.Contains(search) || f.Cnpj.Contains(search) : null,
            ct: ct);

        return Result<PagedResult<FornecedorResponseDto>>.Ok(
            PagedResult<FornecedorResponseDto>.Create(mapper.Map<List<FornecedorResponseDto>>(items), total, page, pageSize));
    }

    public async Task<Result<FornecedorResponseDto>> CreateAsync(
        CreateFornecedorDto dto, string criadoPor, CancellationToken ct = default)
    {
        var cnpj = CpfCnpjHelper.SomenteDigitos(dto.Cnpj);

        if (await repository.ExistsAsync(f => f.Cnpj == cnpj, ct))
            return Result<FornecedorResponseDto>.Conflict($"CNPJ '{cnpj}' já cadastrado.");

        Endereco? endereco = dto.Endereco is null ? null
            : new Endereco(dto.Endereco.Cep, dto.Endereco.Logradouro, dto.Endereco.Numero,
                           dto.Endereco.Complemento, dto.Endereco.Bairro, dto.Endereco.Cidade, dto.Endereco.Uf);

        var fornecedor = Fornecedor.Create(dto.RazaoSocial, cnpj, dto.Email, dto.Telefone, endereco, criadoPor);
        await repository.AddAsync(fornecedor, ct);
        await unitOfWork.SaveChangesAsync(ct);
        return Result<FornecedorResponseDto>.Created(mapper.Map<FornecedorResponseDto>(fornecedor));
    }

    public async Task<Result<FornecedorResponseDto>> UpdateAsync(
        Guid id, UpdateFornecedorDto dto, string atualizadoPor, CancellationToken ct = default)
    {
        var fornecedor = await repository.GetByIdAsync(id, ct);
        if (fornecedor is null)
            return Result<FornecedorResponseDto>.NotFound("Fornecedor não encontrado.");

        Endereco? endereco = dto.Endereco is null ? null
            : new Endereco(dto.Endereco.Cep, dto.Endereco.Logradouro, dto.Endereco.Numero,
                           dto.Endereco.Complemento, dto.Endereco.Bairro, dto.Endereco.Cidade, dto.Endereco.Uf);

        fornecedor.Atualizar(dto.RazaoSocial, dto.Email, dto.Telefone, atualizadoPor);
        fornecedor.AtualizarEndereco(endereco, atualizadoPor);
        await repository.UpdateAsync(fornecedor, ct);
        await unitOfWork.SaveChangesAsync(ct);
        return Result<FornecedorResponseDto>.Ok(mapper.Map<FornecedorResponseDto>(fornecedor));
    }

    public async Task<Result> DeleteAsync(Guid id, string deletadoPor, CancellationToken ct = default)
    {
        var fornecedor = await repository.GetByIdAsync(id, ct);
        if (fornecedor is null)
            return Result.NotFound("Fornecedor não encontrado.");

        fornecedor.Delete(deletadoPor);
        await repository.UpdateAsync(fornecedor, ct);
        await unitOfWork.SaveChangesAsync(ct);
        return Result.Ok(204);
    }
}
