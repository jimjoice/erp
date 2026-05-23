using AutoMapper;
using ERP.Application.Cadastros.Common;
using ERP.Application.Common;
using ERP.Application.Interfaces;
using ERP.Domain.Entities;

namespace ERP.Application.Cadastros.Funcionarios;

public class FuncionarioService(
    IRepository<Funcionario> repository,
    IUnitOfWork unitOfWork,
    IMapper mapper) : IFuncionarioService
{
    public async Task<Result<FuncionarioResponseDto>> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var funcionario = await repository.GetByIdAsync(id, ct);
        return funcionario is null
            ? Result<FuncionarioResponseDto>.NotFound("Funcionário não encontrado.")
            : Result<FuncionarioResponseDto>.Ok(mapper.Map<FuncionarioResponseDto>(funcionario));
    }

    public async Task<Result<PagedResult<FuncionarioResponseDto>>> GetPagedAsync(
        int page, int pageSize, string? search = null, CancellationToken ct = default)
    {
        var (items, total) = await repository.GetPagedAsync(
            page, pageSize,
            filter: search is { Length: > 0 } ? f => f.Nome.Contains(search) || f.Cpf.Contains(search) : null,
            ct: ct);

        return Result<PagedResult<FuncionarioResponseDto>>.Ok(
            PagedResult<FuncionarioResponseDto>.Create(mapper.Map<List<FuncionarioResponseDto>>(items), total, page, pageSize));
    }

    public async Task<Result<FuncionarioResponseDto>> CreateAsync(
        CreateFuncionarioDto dto, string criadoPor, CancellationToken ct = default)
    {
        var cpf = CpfCnpjHelper.SomenteDigitos(dto.Cpf);

        if (await repository.ExistsAsync(f => f.Cpf == cpf, ct))
            return Result<FuncionarioResponseDto>.Conflict($"CPF '{cpf}' já cadastrado.");

var funcionario = Funcionario.Create(dto.Nome, cpf, dto.Cargo, dto.Salario, dto.DataAdmissao, dto.UsuarioId, dto.Telefone, dto.Email, criadoPor);
        await repository.AddAsync(funcionario, ct);
        await unitOfWork.SaveChangesAsync(ct);
        return Result<FuncionarioResponseDto>.Created(mapper.Map<FuncionarioResponseDto>(funcionario));
    }

    public async Task<Result<FuncionarioResponseDto>> UpdateAsync(
        Guid id, UpdateFuncionarioDto dto, string atualizadoPor, CancellationToken ct = default)
    {
        var funcionario = await repository.GetByIdAsync(id, ct);
        if (funcionario is null)
            return Result<FuncionarioResponseDto>.NotFound("Funcionário não encontrado.");

funcionario.Atualizar(dto.Nome, dto.Cargo, dto.Salario, dto.Telefone, dto.Email, atualizadoPor);
        await repository.UpdateAsync(funcionario, ct);
        await unitOfWork.SaveChangesAsync(ct);
        return Result<FuncionarioResponseDto>.Ok(mapper.Map<FuncionarioResponseDto>(funcionario));
    }

    public async Task<Result> DeleteAsync(Guid id, string deletadoPor, CancellationToken ct = default)
    {
        var funcionario = await repository.GetByIdAsync(id, ct);
        if (funcionario is null)
            return Result.NotFound("Funcionário não encontrado.");

        funcionario.Delete(deletadoPor);
        await repository.UpdateAsync(funcionario, ct);
        await unitOfWork.SaveChangesAsync(ct);
        return Result.Ok(204);
    }
}
