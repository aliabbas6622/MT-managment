using MalirTonight.Application.Interfaces;
using MalirTonight.Domain.Entities;
using MalirTonight.Domain.Enums;
using MalirTonight.Domain.Interfaces;

namespace MalirTonight.Application.Services;

public class LeaveService : ILeaveService
{
    private readonly IRepository<Leave> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public LeaveService(IRepository<Leave> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<Leave>> GetAllAsync() => await _repository.GetAllAsync();

    public async Task<Leave?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

    public async Task AddAsync(Leave leave)
    {
        await _repository.AddAsync(leave);
        await _unitOfWork.CommitAsync();
    }

    public async Task UpdateAsync(Leave leave)
    {
        _repository.Update(leave);
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

    public async Task<IEnumerable<Leave>> GetByEmployeeAsync(int employeeId)
        => await _repository.FindAsync(l => l.EmployeeId == employeeId);

    public async Task ApproveAsync(int id)
    {
        var leave = await _repository.GetByIdAsync(id);
        if (leave != null)
        {
            leave.Status = LeaveStatus.Approved;
            _repository.Update(leave);
            await _unitOfWork.CommitAsync();
        }
    }

    public async Task RejectAsync(int id)
    {
        var leave = await _repository.GetByIdAsync(id);
        if (leave != null)
        {
            leave.Status = LeaveStatus.Rejected;
            _repository.Update(leave);
            await _unitOfWork.CommitAsync();
        }
    }
}
