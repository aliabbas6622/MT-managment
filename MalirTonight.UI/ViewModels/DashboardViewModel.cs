using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using MalirTonight.Application.Interfaces;

namespace MalirTonight.UI.ViewModels;

public partial class DashboardViewModel : ObservableObject
{
    private readonly IEmployeeService _employeeService;
    private readonly IAttendanceService _attendanceService;
    private readonly ILeaveService _leaveService;
    private readonly ISalaryService _salaryService;
    private readonly IDepartmentService _departmentService;
    private readonly IExpenseService _expenseService;

    [ObservableProperty]
    private string _restaurantName = "Malir Tonight";

    [ObservableProperty]
    private int _totalEmployees;

    [ObservableProperty]
    private int _presentToday;

    [ObservableProperty]
    private int _pendingLeaves;

    [ObservableProperty]
    private decimal _unpaidSalaries;

    [ObservableProperty]
    private int _totalDepartments;

    [ObservableProperty]
    private int _monthlyExpenses;

    public DashboardViewModel(
        IEmployeeService employeeService,
        IAttendanceService attendanceService,
        ILeaveService leaveService,
        ISalaryService salaryService,
        IDepartmentService departmentService,
        IExpenseService expenseService)
    {
        _employeeService = employeeService;
        _attendanceService = attendanceService;
        _leaveService = leaveService;
        _salaryService = salaryService;
        _departmentService = departmentService;
        _expenseService = expenseService;
    }

    [RelayCommand]
    private async Task LoadDashboard()
    {
        var employees = await _employeeService.GetAllAsync();
        TotalEmployees = employees.Count();

        var todayAttendance = await _attendanceService.GetByDateRangeAsync(DateTime.Today, DateTime.Today);
        PresentToday = todayAttendance.Count();

        var allLeaves = await _leaveService.GetAllAsync();
        PendingLeaves = allLeaves.Count(l => l.Status == Domain.Enums.LeaveStatus.Pending);

        var salaries = await _salaryService.GetAllAsync();
        UnpaidSalaries = salaries.Where(s => !s.IsPaid).Sum(s => s.NetAmount);

        var departments = await _departmentService.GetAllAsync();
        TotalDepartments = departments.Count();

        var monthStart = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
        var expenses = await _expenseService.GetByDateRangeAsync(monthStart, DateTime.Today);
        MonthlyExpenses = (int)expenses.Sum(e => e.Amount);
    }
}