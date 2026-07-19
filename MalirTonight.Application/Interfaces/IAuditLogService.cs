using MalirTonight.Domain.Entities;

namespace MalirTonight.Application.Interfaces;

public interface IAuditLogService
{
    Task<IEnumerable<AuditLog>> GetAllAsync();
    Task LogAsync(string action, string entityName, int? entityId, string? oldValues, string? newValues, int? userId = null);
}
