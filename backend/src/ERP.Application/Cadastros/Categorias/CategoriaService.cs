using AutoMapper;
using ERP.Application.Common;
using ERP.Application.Interfaces;
using ERP.Domain.Entities;

namespace ERP.Application.Cadastros.Categorias;

public class CategoriaService(
    IRepository<Categoria> repository,
    IRepository<Produto> produtoRepository,
    IUnitOfWork unitOfWork,
    IMapper mapper) : ICategoriaService
{
    public async Task<Result<CategoriaResponseDto>> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var categoria = await repository.GetByIdAsync(id, ct);
        return categoria is null
            ? Result<CategoriaResponseDto>.NotFound("Categoria não encontrada.")
            : Result<CategoriaResponseDto>.Ok(mapper.Map<CategoriaResponseDto>(categoria));
    }

    public async Task<Result<PagedResult<CategoriaResponseDto>>> GetPagedAsync(
        int page, int pageSize, string? search = null, CancellationToken ct = default)
    {
        var (items, total) = await repository.GetPagedAsync(
            page, pageSize,
            filter: search is { Length: > 0 } ? c => c.Nome.Contains(search) : null,
            ct: ct);

        return Result<PagedResult<CategoriaResponseDto>>.Ok(
            PagedResult<CategoriaResponseDto>.Create(mapper.Map<List<CategoriaResponseDto>>(items), total, page, pageSize));
    }

    public async Task<Result<CategoriaResponseDto>> CreateAsync(
        CreateCategoriaDto dto, string criadoPor, CancellationToken ct = default)
    {
        if (await repository.ExistsAsync(c => c.Nome == dto.Nome, ct))
            return Result<CategoriaResponseDto>.Conflict($"Categoria '{dto.Nome}' já existe.");

        var categoria = Categoria.Create(dto.Nome, dto.Descricao, criadoPor);
        await repository.AddAsync(categoria, ct);
        await unitOfWork.SaveChangesAsync(ct);
        return Result<CategoriaResponseDto>.Created(mapper.Map<CategoriaResponseDto>(categoria));
    }

    public async Task<Result<CategoriaResponseDto>> UpdateAsync(
        Guid id, UpdateCategoriaDto dto, string atualizadoPor, CancellationToken ct = default)
    {
        var categoria = await repository.GetByIdAsync(id, ct);
        if (categoria is null)
            return Result<CategoriaResponseDto>.NotFound("Categoria não encontrada.");

        if (await repository.ExistsAsync(c => c.Nome == dto.Nome && c.Id != id, ct))
            return Result<CategoriaResponseDto>.Conflict($"Categoria '{dto.Nome}' já existe.");

        categoria.Atualizar(dto.Nome, dto.Descricao, atualizadoPor);
        await repository.UpdateAsync(categoria, ct);
        await unitOfWork.SaveChangesAsync(ct);
        return Result<CategoriaResponseDto>.Ok(mapper.Map<CategoriaResponseDto>(categoria));
    }

    public async Task<Result> DeleteAsync(Guid id, string deletadoPor, CancellationToken ct = default)
    {
        var categoria = await repository.GetByIdAsync(id, ct);
        if (categoria is null)
            return Result.NotFound("Categoria não encontrada.");

        if (await produtoRepository.ExistsAsync(p => p.CategoriaId == id, ct))
            return Result.Fail("Categoria possui produtos vinculados e não pode ser excluída.", 409);

        categoria.Delete(deletadoPor);
        await repository.UpdateAsync(categoria, ct);
        await unitOfWork.SaveChangesAsync(ct);
        return Result.Ok(204);
    }
}
