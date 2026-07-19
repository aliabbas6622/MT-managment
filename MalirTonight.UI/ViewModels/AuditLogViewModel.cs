using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using MalirTonight.Application.Interfaces;
using MalirTonight.Domain.Entities;

namespace MalirTonight.UI.ViewModels;

public partial class AuditLogViewModel : ObservableObject
{
    private readonly IAuditLogService _auditLogService;

    [ObservableProperty]
    private ObservableCollection<AuditLog> _logs = new();

    public AuditLogViewModel(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    [RelayCommand]
    private async Task Load()
    {
        var items = await _auditLogService.GetAllAsync();
        Logs = new ObservableCollection<AuditLog>(items);
    }
}
