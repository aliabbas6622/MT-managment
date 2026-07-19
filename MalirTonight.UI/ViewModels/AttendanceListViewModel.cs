using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using MalirTonight.Application.Interfaces;
using MalirTonight.Domain.Entities;
using MalirTonight.Domain.Enums;

namespace MalirTonight.UI.ViewModels;

public partial class AttendanceListViewModel : ObservableObject
{
    private readonly IAttendanceService _attendanceService;

    [ObservableProperty]
    private ObservableCollection<Attendance> _attendances = new();

    [ObservableProperty]
    private DateTime _selectedDate = DateTime.Today;

    [ObservableProperty]
    private AttendanceStatus _selectedStatus = AttendanceStatus.Present;

    public AttendanceListViewModel(IAttendanceService attendanceService)
    {
        _attendanceService = attendanceService;
    }

    [RelayCommand]
    private async Task Load()
    {
        var records = await _attendanceService.GetByDateRangeAsync(SelectedDate, SelectedDate);
        Attendances = new ObservableCollection<Attendance>(records);
    }

    [RelayCommand]
    private async Task MarkAttendance(Attendance attendance)
    {
        if (attendance.Id == 0)
            await _attendanceService.AddAsync(attendance);
        else
            await _attendanceService.UpdateAsync(attendance);
        await Load();
    }
}
