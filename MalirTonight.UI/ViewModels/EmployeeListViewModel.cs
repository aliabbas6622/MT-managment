using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using MalirTonight.Application.Interfaces;
using MalirTonight.Domain.Entities;

namespace MalirTonight.UI.ViewModels;

public partial class EmployeeListViewModel : ObservableObject
{
    private readonly IEmployeeService _employeeService;

    [ObservableProperty]
    private ObservableCollection<Employee> _employees = new();

    [ObservableProperty]
    private string _searchText = string.Empty;

    [ObservableProperty]
    private Employee? _selectedEmployee;

    public event Action? AddRequested;
    public event Action<Employee>? EditRequested;

    public EmployeeListViewModel(IEmployeeService employeeService)
    {
        _employeeService = employeeService;
    }

    [RelayCommand]
    private async Task LoadEmployees()
    {
        var employees = await _employeeService.GetAllAsync();
        Employees = new ObservableCollection<Employee>(employees);
    }

    [RelayCommand]
    private async Task Search()
    {
        var all = await _employeeService.GetAllAsync();
        if (string.IsNullOrWhiteSpace(SearchText))
        {
            Employees = new ObservableCollection<Employee>(all);
            return;
        }
        var filtered = all.Where(e =>
            e.FullName.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ||
            (e.Phone?.Contains(SearchText) ?? false));
        Employees = new ObservableCollection<Employee>(filtered);
    }

    [RelayCommand]
    private void AddEmployee()
    {
        AddRequested?.Invoke();
    }

    [RelayCommand]
    private void EditEmployee(Employee employee)
    {
        EditRequested?.Invoke(employee);
    }

    [RelayCommand]
    private async Task DeleteEmployee()
    {
        if (SelectedEmployee == null) return;
        await _employeeService.DeleteAsync(SelectedEmployee.Id);
        await LoadEmployees();
    }
}
