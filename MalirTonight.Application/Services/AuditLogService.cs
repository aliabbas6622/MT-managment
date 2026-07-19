using MalirTonight.Application.FeatureManagement;
using MalirTonight.Application.Interfaces;
using MalirTonight.Domain.Entities;
using MalirTonight.Domain.Interfaces;

namespace MalirTonight.Application.Services;

public class AuditLogService : IAuditLogService
{
    private readonly IRepository<AuditLog> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly FeatureManager _featureManager;

    public AuditLogService(IRepository<AuditLog> repository, IUnitOfWork unitOfWork, FeatureManager featureManager)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _featureManager = featureManager;
    }

    public async Task<IEnumerable<AuditLog>> GetAllAsync()
    {
        if (!_featureManager.IsEnabled("AuditLogs"))
            return Enumerable.Empty<AuditLog>();
        return await _repository.GetAllAsync();
    }

    public async Task LogAsync(string action, string entityName, int? entityId, string? oldValues, string? newValues, int? userId = null)
    {
        if (!_featureManager.IsEnabled("AuditLogs"))
            return;

        var log = new AuditLog
        {
            UserId = userId,
            Action = action,
            EntityName = entityName,
            EntityId = entityId,
            OldValues = oldValues,
            NewValues = newValues,
            Timestamp = DateTime.UtcNow
        };

        await _repository.AddAsync(log);
        await _unitOfWork.CommitAsync();
    }
}
