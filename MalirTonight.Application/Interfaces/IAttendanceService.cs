using MalirTonight.Domain.Entities;

namespace MalirTonight.Application.Interfaces;

public interface IAttendanceService
{
    Task<IEnumerable<Attendance>> GetAllAsync();
    Task<Attendance?> GetByIdAsync(int id);
    Task AddAsync(Attendance attendance);
    Task UpdateAsync(Attendance attendance);
    Task DeleteAsync(int id);
    Task<IEnumerable<Attendance>> GetByEmployeeAsync(int employeeId);
    Task<IEnumerable<Attendance>> GetByDateRangeAsync(DateTime start, DateTime end);
}
