using ERP.Infrastructure.Persistence;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace ERP.API.HealthChecks;

public class DatabaseHealthCheck(AppDbContext dbContext) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken ct = default)
    {
        try
        {
            return await dbContext.Database.CanConnectAsync(ct)
                ? HealthCheckResult.Healthy("Banco de dados acessível")
                : HealthCheckResult.Unhealthy("Banco de dados inacessível");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Falha na conexão com banco de dados", ex);
        }
    }
}
