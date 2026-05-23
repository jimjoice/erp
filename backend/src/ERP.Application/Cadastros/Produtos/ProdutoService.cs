using AutoMapper;
using ERP.Application.Cadastros.Common;
using ERP.Application.Common;
using ERP.Application.Interfaces;
using ERP.Domain.Entities;

namespace ERP.Application.Cadastros.Produtos;

public class ProdutoService(
    IRepository<Produto> repository,
    IRepository<Categoria> categoriaRepository,
    IRepository<MovimentacaoEstoque> movimentacaoRepository,
    IUnitOfWork unitOfWork,
    IMapper mapper) : IProdutoService
{
    public async Task<Result<ProdutoResponseDto>> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var produto = await repository.GetByIdAsync(id, ct);
        if (produto is null)
            return Result<ProdutoResponseDto>.NotFound("Produto não encontrado.");

        var dto = mapper.Map<ProdutoResponseDto>(produto);

        var categoria = await categoriaRepository.GetByIdAsync(produto.CategoriaId, ct);
        dto = dto with { CategoriaNome = categoria?.Nome };

        return Result<ProdutoResponseDto>.Ok(dto);
    }

    public async Task<Result<PagedResult<ProdutoResponseDto>>> GetPagedAsync(
        int page, int pageSize,
        string? search = null, Guid? categoriaId = null, bool? somenteAbaixoDoMinimo = null,
        CancellationToken ct = default)
    {
        var (items, total) = await repository.GetPagedAsync(
            page, pageSize,
            filter: p =>
                (search == null || p.Nome.Contains(search) || p.Sku.Contains(search)) &&
                (!categoriaId.HasValue || p.CategoriaId == categoriaId.Value) &&
                (somenteAbaixoDoMinimo != true || p.EstoqueAtual < p.EstoqueMinimo),
            ct: ct);

        return Result<PagedResult<ProdutoResponseDto>>.Ok(
            PagedResult<ProdutoResponseDto>.Create(mapper.Map<List<ProdutoResponseDto>>(items), total, page, pageSize));
    }

    public async Task<Result<ProdutoResponseDto>> CreateAsync(
        CreateProdutoDto dto, string criadoPor, CancellationToken ct = default)
    {
        if (!await categoriaRepository.ExistsAsync(c => c.Id == dto.CategoriaId, ct))
            return Result<ProdutoResponseDto>.Fail("Categoria não encontrada.", 404);

        if (await repository.ExistsAsync(p => p.Sku == dto.Sku, ct))
            return Result<ProdutoResponseDto>.Conflict($"SKU '{dto.Sku}' já está em uso.");

        if (dto.CodigoBarras is not null &&
            await repository.ExistsAsync(p => p.CodigoBarras == dto.CodigoBarras, ct))
            return Result<ProdutoResponseDto>.Conflict($"Código de barras '{dto.CodigoBarras}' já está em uso.");

        var produto = Produto.Create(
            dto.Nome, dto.Sku, dto.CodigoBarras, dto.Ncm, dto.Descricao,
            dto.PrecoCusto, dto.PrecoVenda, dto.EstoqueMinimo, dto.UnidadeMedida,
            dto.CategoriaId, criadoPor);

        await repository.AddAsync(produto, ct);
        await unitOfWork.SaveChangesAsync(ct);
        return Result<ProdutoResponseDto>.Created(mapper.Map<ProdutoResponseDto>(produto));
    }

    public async Task<Result<ProdutoResponseDto>> UpdateAsync(
        Guid id, UpdateProdutoDto dto, string atualizadoPor, CancellationToken ct = default)
    {
        var produto = await repository.GetByIdAsync(id, ct);
        if (produto is null)
            return Result<ProdutoResponseDto>.NotFound("Produto não encontrado.");

        if (!await categoriaRepository.ExistsAsync(c => c.Id == dto.CategoriaId, ct))
            return Result<ProdutoResponseDto>.Fail("Categoria não encontrada.", 404);

        if (dto.CodigoBarras is not null &&
            await repository.ExistsAsync(p => p.CodigoBarras == dto.CodigoBarras && p.Id != id, ct))
            return Result<ProdutoResponseDto>.Conflict($"Código de barras '{dto.CodigoBarras}' já está em uso.");

        produto.Atualizar(dto.Nome, dto.CodigoBarras, dto.Ncm, dto.Descricao,
            dto.PrecoCusto, dto.PrecoVenda, dto.EstoqueMinimo, dto.UnidadeMedida,
            dto.CategoriaId, atualizadoPor);

        await repository.UpdateAsync(produto, ct);
        await unitOfWork.SaveChangesAsync(ct);
        return Result<ProdutoResponseDto>.Ok(mapper.Map<ProdutoResponseDto>(produto));
    }

    public async Task<Result> DeleteAsync(Guid id, string deletadoPor, CancellationToken ct = default)
    {
        var produto = await repository.GetByIdAsync(id, ct);
        if (produto is null)
            return Result.NotFound("Produto não encontrado.");

        produto.Delete(deletadoPor);
        await repository.UpdateAsync(produto, ct);
        await unitOfWork.SaveChangesAsync(ct);
        return Result.Ok(204);
    }

    public async Task<Result<PagedResult<MovimentacaoEstoqueResponseDto>>> GetMovimentacoesAsync(
        Guid produtoId, int page, int pageSize, CancellationToken ct = default)
    {
        if (!await repository.ExistsAsync(p => p.Id == produtoId, ct))
            return Result<PagedResult<MovimentacaoEstoqueResponseDto>>.NotFound("Produto não encontrado.");

        var (items, total) = await movimentacaoRepository.GetPagedAsync(
            page, pageSize,
            filter: l => l.ProdutoId == produtoId,
            ct: ct);

        return Result<PagedResult<MovimentacaoEstoqueResponseDto>>.Ok(
            PagedResult<MovimentacaoEstoqueResponseDto>.Create(
                mapper.Map<List<MovimentacaoEstoqueResponseDto>>(items), total, page, pageSize));
    }
}
