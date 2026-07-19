using MalirTonight.Application.Interfaces;
using MalirTonight.Domain.Entities;
using MalirTonight.Domain.Interfaces;

namespace MalirTonight.Application.Services;

public class DepartmentService : IDepartmentService
{
    private readonly IRepository<Department> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DepartmentService(IRepository<Department> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<Department>> GetAllAsync() => await _repository.GetAllAsync();

    public async Task<Department?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

    public async Task AddAsync(Department department)
    {
        await _repository.AddAsync(department);
        await _unitOfWork.CommitAsync();
    }

    public async Task UpdateAsync(Department department)
    {
        _repository.Update(department);
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
}
