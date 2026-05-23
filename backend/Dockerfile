# ── Estágio 1: restaurar dependências NuGet ───────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS restore
WORKDIR /app

# Copia apenas os .csproj para aproveitar cache de camadas
COPY ERP.sln .
COPY src/ERP.Domain/ERP.Domain.csproj           src/ERP.Domain/
COPY src/ERP.Application/ERP.Application.csproj src/ERP.Application/
COPY src/ERP.Infrastructure/ERP.Infrastructure.csproj src/ERP.Infrastructure/
COPY src/ERP.API/ERP.API.csproj                 src/ERP.API/
RUN dotnet restore

# ── Estágio 2: build ──────────────────────────────────────────────────────────
FROM restore AS build
COPY . .
RUN dotnet build src/ERP.API/ERP.API.csproj -c Release --no-restore

# ── Estágio 3: publish ────────────────────────────────────────────────────────
FROM build AS publish
RUN dotnet publish src/ERP.API/ERP.API.csproj \
    -c Release \
    --no-build \
    -o /publish \
    /p:UseAppHost=false

# ── Estágio 4: development (hot reload) ──────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS development
WORKDIR /app
COPY --from=restore /root/.nuget /root/.nuget
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/* \
 && dotnet tool install --global dotnet-ef
ENV PATH="$PATH:/root/.dotnet/tools"
ENV ASPNETCORE_ENVIRONMENT=Development
ENV ASPNETCORE_HTTP_PORTS=8080
ENV DOTNET_USE_POLLING_FILE_WATCHER=1
ENV DOTNET_WATCH_RESTART_ON_RUDE_EDIT=1
EXPOSE 8080
CMD ["dotnet", "watch", "run", \
     "--project", "src/ERP.API/ERP.API.csproj", \
     "--urls", "http://+:8080"]

# ── Estágio 5: final (produção) ───────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# curl para healthcheck; limpeza de cache em seguida para imagem menor
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*

# Usuário não-root para segurança
RUN groupadd --system --gid 1001 dotnet \
  && useradd --system --uid 1001 --gid dotnet appuser \
  && chown -R appuser:dotnet /app

# Pasta de logs com permissão de escrita antes de trocar de usuário
RUN mkdir -p logs && chown appuser:dotnet logs

USER appuser

COPY --from=publish --chown=appuser:dotnet /publish .

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_HTTP_PORTS=8080

EXPOSE 8080

ENTRYPOINT ["dotnet", "ERP.API.dll"]
