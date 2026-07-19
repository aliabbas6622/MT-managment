using MalirTonight.Application.Interfaces;
using MalirTonight.Domain.Entities;
using MalirTonight.Domain.Interfaces;

namespace MalirTonight.Application.Services;

public class AttendanceService : IAttendanceService
{
    private readonly IRepository<Attendance> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public AttendanceService(IRepository<Attendance> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<Attendance>> GetAllAsync() => await _repository.GetAllAsync();

    public async Task<Attendance?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

    public async Task AddAsync(Attendance attendance)
    {
        await _repository.AddAsync(attendance);
        await _unitOfWork.CommitAsync();
    }

    public async Task UpdateAsync(Attendance attendance)
    {
        _repository.Update(attendance);
        await _unitOfWork.CommitAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity != null)
        {
            _repository.Delete(entity);
            await _unitOfWork.CommitAsync();
        }
    }

    public async Task<IEnumerable<Attendance>> GetByEmployeeAsync(int employeeId)
        => await _repository.FindAsync(a => a.EmployeeId == employeeId);

    public async Task<IEnumerable<Attendance>> GetByDateRangeAsync(DateTime start, DateTime end)
        => await _repository.FindAsync(a => a.Date >= start && a.Date <= end);
}
