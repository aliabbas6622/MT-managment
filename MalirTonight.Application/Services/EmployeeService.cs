using MalirTonight.Application.Interfaces;
using MalirTonight.Domain.Entities;
using MalirTonight.Domain.Interfaces;

namespace MalirTonight.Application.Services;

public class EmployeeService : IEmployeeService
{
    private readonly IRepository<Employee> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public EmployeeService(IRepository<Employee> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<Employee>> GetAllAsync() => await _repository.GetAllAsync();

    public async Task<Employee?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

    public async Task AddAsync(Employee employee)
    {
        await _repository.AddAsync(employee);
        await _unitOfWork.CommitAsync();
    }

    public async Task UpdateAsync(Employee employee)
    {
        _repository.Update(employee);
        await _unitOfWork.CommitAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var employee = await _repository.GetByIdAsync(id);
        if (employee != null)
        {
            _repository.Delete(employee);
            await _unitOfWork.CommitAsync();
        }
    }

    public async Task<IEnumerable<Employee>> GetByDepartmentAsync(int departmentId)
        => await _repository.FindAsync(e => e.DepartmentId == departmentId);
}
