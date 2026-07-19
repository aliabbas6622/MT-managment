using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using MalirTonight.Domain.Entities;
using MaterialDesignThemes.Wpf;

namespace MalirTonight.UI.ViewModels;

public partial class MainViewModel : ObservableObject
{
    [ObservableProperty]
    private ObservableObject _currentView;

    [ObservableProperty]
    private string _currentLicenseTier = "Basic";

    public DashboardViewModel DashboardViewModel { get; }
    public EmployeeListViewModel EmployeeListViewModel { get; }
    public EmployeeFormViewModel EmployeeFormViewModel { get; }
    public AttendanceListViewModel AttendanceListViewModel { get; }
    public LeaveListViewModel LeaveListViewModel { get; }
    public DepartmentListViewModel DepartmentListViewModel { get; }
    public ExpenseListViewModel ExpenseListViewModel { get; }
    public ReportsViewModel ReportsViewModel { get; }
    public SettingsViewModel SettingsViewModel { get; }
    public AuditLogViewModel AuditLogViewModel { get; }
    public LicensingViewModel LicensingViewModel { get; }

    private readonly PaletteHelper _paletteHelper = new();

    public MainViewModel(
        DashboardViewModel dashboardViewModel,
        EmployeeListViewModel employeeListViewModel,
        EmployeeFormViewModel employeeFormViewModel,
        AttendanceListViewModel attendanceListViewModel,
        LeaveListViewModel leaveListViewModel,
        DepartmentListViewModel departmentListViewModel,
        ExpenseListViewModel expenseListViewModel,
        ReportsViewModel reportsViewModel,
        SettingsViewModel settingsViewModel,
        AuditLogViewModel auditLogViewModel,
        LicensingViewModel licensingViewModel)
    {
        DashboardViewModel = dashboardViewModel;
        EmployeeListViewModel = employeeListViewModel;
        EmployeeFormViewModel = employeeFormViewModel;
        AttendanceListViewModel = attendanceListViewModel;
        LeaveListViewModel = leaveListViewModel;
        DepartmentListViewModel = departmentListViewModel;
        ExpenseListViewModel = expenseListViewModel;
        ReportsViewModel = reportsViewModel;
        SettingsViewModel = settingsViewModel;
        AuditLogViewModel = auditLogViewModel;
        LicensingViewModel = licensingViewModel;

        _currentView = dashboardViewModel;

        EmployeeListViewModel.AddRequested += () => NavigateToAddEmployee();
        EmployeeListViewModel.EditRequested += (e) => NavigateToEditEmployee(e);
        EmployeeFormViewModel.Saved += () => CurrentView = EmployeeListViewModel;
        LicensingViewModel.TierChanged += (tier) => CurrentLicenseTier = tier;
    }

    [RelayCommand]
    private void NavigateToDashboard() => CurrentView = DashboardViewModel;

    [RelayCommand]
    private void NavigateToEmployees() => CurrentView = EmployeeListViewModel;

    [RelayCommand]
    private void NavigateToAttendance() => CurrentView = AttendanceListViewModel;

    [RelayCommand]
    private void NavigateToSalaries() => CurrentView = EmployeeListViewModel;

    [RelayCommand]
    private void NavigateToLeaves() => CurrentView = LeaveListViewModel;

    [RelayCommand]
    private void NavigateToDepartments() => CurrentView = DepartmentListViewModel;

    [RelayCommand]
    private void NavigateToExpenses() => CurrentView = ExpenseListViewModel;

    [RelayCommand]
    private void NavigateToReports() => CurrentView = ReportsViewModel;

    [RelayCommand]
    private void NavigateToSettings() => CurrentView = SettingsViewModel;

    [RelayCommand]
    private void NavigateToAuditLogs() => CurrentView = AuditLogViewModel;

    [RelayCommand]
    private void NavigateToLicensing() => CurrentView = LicensingViewModel;

    [RelayCommand]
    private void ToggleTheme()
    {
        var theme = _paletteHelper.GetTheme();
        theme.SetBaseTheme(theme.GetBaseTheme() == BaseTheme.Light ? BaseTheme.Dark : BaseTheme.Light);
        _paletteHelper.SetTheme(theme);
    }

    private void NavigateToAddEmployee()
    {
        EmployeeFormViewModel.Reset();
        CurrentView = EmployeeFormViewModel;
    }

    private void NavigateToEditEmployee(Employee employee)
    {
        EmployeeFormViewModel.SetEmployee(employee);
        CurrentView = EmployeeFormViewModel;
    }
}