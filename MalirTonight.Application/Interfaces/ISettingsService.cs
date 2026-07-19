using MalirTonight.Domain.Entities;

namespace MalirTonight.Application.Interfaces;

public interface ISettingsService
{
    Task<string?> GetAsync(string key);
    Task SetAsync(string key, string value, string? description = null);
    Task<IEnumerable<Setting>> GetAllAsync();
}
