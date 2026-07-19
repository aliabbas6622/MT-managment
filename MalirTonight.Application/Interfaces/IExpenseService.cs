using MalirTonight.Domain.Entities;

namespace MalirTonight.Application.Interfaces;

public interface IExpenseService
{
    Task<IEnumerable<Expense>> GetAllAsync();
    Task<Expense?> GetByIdAsync(int id);
    Task AddAsync(Expense expense);
    Task UpdateAsync(Expense expense);
    Task DeleteAsync(int id);
    Task<IEnumerable<Expense>> GetByDateRangeAsync(DateTime start, DateTime end);
}
