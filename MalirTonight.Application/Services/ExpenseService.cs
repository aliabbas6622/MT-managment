using MalirTonight.Application.FeatureManagement;
using MalirTonight.Application.Interfaces;
using MalirTonight.Domain.Entities;
using MalirTonight.Domain.Interfaces;

namespace MalirTonight.Application.Services;

public class ExpenseService : IExpenseService
{
    private readonly IRepository<Expense> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly FeatureManager _featureManager;

    public ExpenseService(IRepository<Expense> repository, IUnitOfWork unitOfWork, FeatureManager featureManager)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _featureManager = featureManager;
    }

    public async Task<IEnumerable<Expense>> GetAllAsync()
    {
        if (!_featureManager.IsEnabled("Expenses"))
            return Enumerable.Empty<Expense>();
        return await _repository.GetAllAsync();
    }

    public async Task<Expense?> GetByIdAsync(int id)
    {
        if (!_featureManager.IsEnabled("Expenses"))
            return null;
        return await _repository.GetByIdAsync(id);
    }

    public async Task AddAsync(Expense expense)
    {
        if (!_featureManager.IsEnabled("Expenses"))
            throw new InvalidOperationException("Expenses is a Premium feature.");
        await _repository.AddAsync(expense);
        await _unitOfWork.CommitAsync();
    }

    public async Task UpdateAsync(Expense expense)
    {
        if (!_featureManager.IsEnabled("Expenses"))
            throw new InvalidOperationException("Expenses is a Premium feature.");
        _repository.Update(expense);
        await _unitOfWork.CommitAsync();
    }

    public async Task DeleteAsync(int id)
    {
        if (!_featureManager.IsEnabled("Expenses"))
            throw new InvalidOperationException("Expenses is a Premium feature.");
        var entity = await _repository.GetByIdAsync(id);
        if (entity != null)
        {
            _repository.Delete(entity);
            await _unitOfWork.CommitAsync();
        }
    }

    public async Task<IEnumerable<Expense>> GetByDateRangeAsync(DateTime start, DateTime end)
    {
        if (!_featureManager.IsEnabled("Expenses"))
            return Enumerable.Empty<Expense>();
        return await _repository.FindAsync(e => e.Date >= start && e.Date <= end);
    }
}
