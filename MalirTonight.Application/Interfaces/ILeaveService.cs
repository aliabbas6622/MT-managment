using MalirTonight.Domain.Entities;

namespace MalirTonight.Application.Interfaces;

public interface ILeaveService
{
    Task<IEnumerable<Leave>> GetAllAsync();
    Task<Leave?> GetByIdAsync(int id);
    Task AddAsync(Leave leave);
    Task UpdateAsync(Leave leave);
    Task DeleteAsync(int id);
    Task<IEnumerable<Leave>> GetByEmployeeAsync(int employeeId);
    Task ApproveAsync(int id);
    Task RejectAsync(int id);
}
