using MalirTonight.Application.FeatureManagement;
using MalirTonight.Application.Interfaces;
using MalirTonight.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace MalirTonight.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddSingleton<FeatureManager>();
        services.AddScoped<IEmployeeService, EmployeeService>();
        services.AddScoped<IAttendanceService, AttendanceService>();
        services.AddScoped<ISalaryService, SalaryService>();
        services.AddScoped<ILeaveService, LeaveService>();
        services.AddScoped<IDepartmentService, DepartmentService>();
        services.AddScoped<IExpenseService, ExpenseService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAuditLogService, AuditLogService>();
        services.AddScoped<ISettingsService, SettingsService>();

        return services;
    }
}
