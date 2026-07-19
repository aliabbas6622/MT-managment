using System.Windows;
using MalirTonight.Application;
using MalirTonight.Infrastructure;
using MalirTonight.UI.ViewModels;
using MalirTonight.UI.Views;
using Microsoft.Extensions.DependencyInjection;

namespace MalirTonight.UI;

public partial class App : System.Windows.Application
{
    private ServiceProvider _serviceProvider = null!;

    protected override void OnStartup(StartupEventArgs e)
    {
        var services = new ServiceCollection();
        services.AddApplication();
        services.AddInfrastructure("Data Source=malirtonight.db");

        services.AddSingleton<DashboardViewModel>();
        services.AddSingleton<EmployeeListViewModel>();
        services.AddSingleton<EmployeeFormViewModel>();
        services.AddSingleton<AttendanceListViewModel>();
        services.AddSingleton<LeaveListViewModel>();
        services.AddSingleton<DepartmentListViewModel>();
        services.AddSingleton<ExpenseListViewModel>();
        services.AddSingleton<ReportsViewModel>();
        services.AddSingleton<SettingsViewModel>();
        services.AddSingleton<AuditLogViewModel>();
        services.AddSingleton<LicensingViewModel>();
        services.AddSingleton<MainViewModel>();
        services.AddTransient<MainWindow>();

        _serviceProvider = services.BuildServiceProvider();

        var mainWindow = _serviceProvider.GetRequiredService<MainWindow>();
        mainWindow.Show();
    }

    protected override void OnExit(ExitEventArgs e)
    {
        _serviceProvider?.Dispose();
        Serilog.Log.CloseAndFlush();
    }
}
