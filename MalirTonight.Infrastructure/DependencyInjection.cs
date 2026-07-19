using MalirTonight.Domain.Interfaces;
using MalirTonight.Infrastructure.Data;
using MalirTonight.Infrastructure.Data.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Serilog;

namespace MalirTonight.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, string connectionString)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlite(connectionString));

        services.AddScoped(typeof(IRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        Log.Logger = new LoggerConfiguration()
            .WriteTo.File("logs/malirtonight-.log", rollingInterval: RollingInterval.Day)
            .CreateLogger();

        return services;
    }
}
