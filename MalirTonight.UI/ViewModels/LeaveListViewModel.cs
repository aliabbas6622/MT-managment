using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using MalirTonight.Application.Interfaces;
using MalirTonight.Domain.Entities;

namespace MalirTonight.UI.ViewModels;

public partial class LeaveListViewModel : ObservableObject
{
    private readonly ILeaveService _leaveService;

    [ObservableProperty]
    private ObservableCollection<Leave> _leaves = new();

    public LeaveListViewModel(ILeaveService leaveService)
    {
        _leaveService = leaveService;
    }

    [RelayCommand]
    private async Task Load()
    {
        var items = await _leaveService.GetAllAsync();
        Leaves = new ObservableCollection<Leave>(items);
    }

    [RelayCommand]
    private async Task Approve(Leave leave)
    {
        await _leaveService.ApproveAsync(leave.Id);
        await Load();
    }

    [RelayCommand]
    private async Task Reject(Leave leave)
    {
        await _leaveService.RejectAsync(leave.Id);
        await Load();
    }
}
