using MalirTonight.Domain.Entities;

namespace MalirTonight.Application.Interfaces;

public interface ISalaryService
{
    Task<IEnumerable<Salary>> GetAllAsync();
    Task<Salary?> GetByIdAsync(int id);
    Task AddAsync(Salary salary);
    Task UpdateAsync(Salary salary);
    Task DeleteAsync(int id);
    Task<IEnumerable<Salary>> GetByEmployeeAsync(int employeeId);
    Task ProcessAutomaticPayrollAsync(DateTime periodStart, DateTime periodEnd);
}
