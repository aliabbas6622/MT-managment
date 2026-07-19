using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using MalirTonight.Application.Interfaces;
using MalirTonight.Domain.Entities;

namespace MalirTonight.UI.ViewModels;

public partial class ReportsViewModel : ObservableObject
{
    private readonly IEmployeeService _employeeService;
    private readonly IAttendanceService _attendanceService;
    private readonly ISalaryService _salaryService;

    [ObservableProperty]
    private int _totalEmployees;

    [ObservableProperty]
    private decimal _totalSalary;

    [ObservableProperty]
    private int _presentToday;

    [ObservableProperty]
    private string _reportDateRange = string.Empty;

    public ReportsViewModel(
        IEmployeeService employeeService,
        IAttendanceService attendanceService,
        ISalaryService salaryService)
    {
        _employeeService = employeeService;
        _attendanceService = attendanceService;
        _salaryService = salaryService;
    }

    [RelayCommand]
    private async Task Generate()
    {
        var employees = await _employeeService.GetAllAsync();
        TotalEmployees = employees.Count();

        var today = await _attendanceService.GetByDateRangeAsync(DateTime.Today, DateTime.Today);
        PresentToday = today.Count();

        var salaries = await _salaryService.GetAllAsync();
        TotalSalary = salaries.Where(s => !s.IsPaid).Sum(s => s.NetAmount);

        ReportDateRange = $"{DateTime.Today:MMM dd, yyyy}";
    }
}
