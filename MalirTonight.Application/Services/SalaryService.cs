using MalirTonight.Application.FeatureManagement;
using MalirTonight.Application.Interfaces;
using MalirTonight.Domain.Entities;
using MalirTonight.Domain.Interfaces;

namespace MalirTonight.Application.Services;

public class SalaryService : ISalaryService
{
    private readonly IRepository<Salary> _repository;
    private readonly IRepository<Employee> _employeeRepository;
    private readonly IRepository<Attendance> _attendanceRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly FeatureManager _featureManager;

    public SalaryService(
        IRepository<Salary> repository,
        IRepository<Employee> employeeRepository,
        IRepository<Attendance> attendanceRepository,
        IUnitOfWork unitOfWork,
        FeatureManager featureManager)
    {
        _repository = repository;
        _employeeRepository = employeeRepository;
        _attendanceRepository = attendanceRepository;
        _unitOfWork = unitOfWork;
        _featureManager = featureManager;
    }

    public async Task<IEnumerable<Salary>> GetAllAsync() => await _repository.GetAllAsync();

    public async Task<Salary?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

    public async Task AddAsync(Salary salary)
    {
        await _repository.AddAsync(salary);
        await _unitOfWork.CommitAsync();
    }

    public async Task UpdateAsync(Salary salary)
    {
        _repository.Update(salary);
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

    public async Task<IEnumerable<Salary>> GetByEmployeeAsync(int employeeId)
        => await _repository.FindAsync(s => s.EmployeeId == employeeId);

    public async Task ProcessAutomaticPayrollAsync(DateTime periodStart, DateTime periodEnd)
    {
        if (!_featureManager.IsEnabled("AutomaticPayroll"))
            throw new InvalidOperationException("Automatic payroll is a Premium feature.");

        var employees = await _employeeRepository.GetAllAsync();

        foreach (var employee in employees.Where(e => e.IsActive))
        {
            var attendanceDays = await _attendanceRepository
                .FindAsync(a => a.EmployeeId == employee.Id && a.Date >= periodStart && a.Date <= periodEnd);

            var workingDays = attendanceDays.Count(a => a.Status != Domain.Enums.AttendanceStatus.Absent);
            var totalWorkingDays = (periodEnd - periodStart).Days + 1;
            var dailyRate = employee.BaseSalary / totalWorkingDays;
            var baseAmount = dailyRate * workingDays;

            var salary = new Salary
            {
                EmployeeId = employee.Id,
                PeriodStart = periodStart,
                PeriodEnd = periodEnd,
                BaseAmount = baseAmount,
                Deductions = 0,
                Bonuses = 0,
                IsPaid = false,
                IsAutomatic = true
            };

            await _repository.AddAsync(salary);
        }

        await _unitOfWork.CommitAsync();
    }
}
