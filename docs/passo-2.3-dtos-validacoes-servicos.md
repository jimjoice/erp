# Passo 2.3 — DTOs, Validações e Serviços dos Cadastros

## Estrutura criada em `ERP.Application/`

```
Cadastros/
  Common/
    EnderecoDto.cs          — record posicional (Cep…Uf)
    CpfCnpjHelper.cs        — IsValidCpf / IsValidCnpj com dígitos verificadores
    EnderecoValidator.cs    — CEP 8 dígitos, UF 2 maiúsculas, campos obrigatórios
  Categorias/  Produtos/  Clientes/  Fornecedores/  Funcionarios/
    XDto.cs                 — Create, Update e Response em arquivo único
    XValidator.cs           — CreateValidator + UpdateValidator
    IXService.cs            — interface com GetById, GetPaged, Create, Update, Delete
    XService.cs             — implementação
  Profiles/
    CadastrosProfile.cs     — AutoMapper: enum→string, Endereco↔EnderecoDto, CategoriaNome
DependencyInjection.cs      — AddApplication(): AutoMapper + FluentValidation + serviços
```

## Interfaces atualizadas

- `IRepository<T>` — novo `GetPagedAsync(page, pageSize, filter?)` retorna `(Items, Total)`
- `BaseRepository<T>` — implementação com `OrderByDescending(CreatedAt)` + paginação no banco

## Decisões importantes

| Ponto | Decisão |
|---|---|
| CPF/CNPJ nos serviços | `SomenteDigitos()` antes de persistir — só dígitos no banco |
| Endereço owned entity | `new Endereco(...)` direto no serviço; AutoMapper só no sentido entity→DTO |
| `CategoriaNome` em Produto | Carregado separadamente no `GetByIdAsync`; nulo na listagem |
| Categoria com produtos | Bloqueia delete com 409 em vez de deixar o banco estourar |
| AutoMapper 16 API | `cfg.AddMaps(assembly)` em vez de `AddAutoMapper(assembly)` diretamente |
