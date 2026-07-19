using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using MalirTonight.Application.Interfaces;
using MalirTonight.Domain.Entities;

namespace MalirTonight.UI.ViewModels;

public partial class DepartmentListViewModel : ObservableObject
{
    private readonly IDepartmentService _departmentService;

    [ObservableProperty]
    private ObservableCollection<Department> _departments = new();

    [ObservableProperty]
    private string _newDepartmentName = string.Empty;

    [ObservableProperty]
    private string _newDepartmentDescription = string.Empty;

    public DepartmentListViewModel(IDepartmentService departmentService)
    {
        _departmentService = departmentService;
    }

    [RelayCommand]
    private async Task Load()
    {
        var items = await _departmentService.GetAllAsync();
        Departments = new ObservableCollection<Department>(items);
    }

    [RelayCommand]
    private async Task Add()
    {
        if (string.IsNullOrWhiteSpace(NewDepartmentName)) return;
        await _departmentService.AddAsync(new Department
        {
            Name = NewDepartmentName,
            Description = NewDepartmentDescription
        });
        NewDepartmentName = string.Empty;
        NewDepartmentDescription = string.Empty;
        await Load();
    }

    [RelayCommand]
    private async Task Delete(Department department)
    {
        await _departmentService.DeleteAsync(department.Id);
        await Load();
    }
}
