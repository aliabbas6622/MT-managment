using MalirTonight.Application.Interfaces;
using MalirTonight.Domain.Entities;
using MalirTonight.Domain.Interfaces;

namespace MalirTonight.Application.Services;

public class SettingsService : ISettingsService
{
    private readonly IRepository<Setting> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public SettingsService(IRepository<Setting> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<string?> GetAsync(string key)
    {
        var settings = await _repository.FindAsync(s => s.Key == key);
        return settings.FirstOrDefault()?.Value;
    }

    public async Task SetAsync(string key, string value, string? description = null)
    {
        var settings = await _repository.FindAsync(s => s.Key == key);
        var existing = settings.FirstOrDefault();

        if (existing != null)
        {
            existing.Value = value;
            if (description != null) existing.Description = description;
            _repository.Update(existing);
        }
        else
        {
            await _repository.AddAsync(new Setting
            {
                Key = key,
                Value = value,
                Description = description
            });
        }

        await _unitOfWork.CommitAsync();
    }

    public async Task<IEnumerable<Setting>> GetAllAsync() => await _repository.GetAllAsync();
}
