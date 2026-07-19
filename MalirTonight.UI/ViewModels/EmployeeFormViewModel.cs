using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using MalirTonight.Application.Interfaces;
using MalirTonight.Domain.Entities;

namespace MalirTonight.UI.ViewModels;

public partial class EmployeeFormViewModel : ObservableObject
{
    private readonly IEmployeeService _employeeService;
    private readonly IDepartmentService _departmentService;

    [ObservableProperty]
    private string _firstName = string.Empty;

    [ObservableProperty]
    private string _lastName = string.Empty;

    [ObservableProperty]
    private string? _phone;

    [ObservableProperty]
    private string? _email;

    [ObservableProperty]
    private string? _address;

    [ObservableProperty]
    private decimal _baseSalary;

    [ObservableProperty]
    private int _departmentId;

    [ObservableProperty]
    private ObservableCollection<Department> _departments = new();

    [ObservableProperty]
    private bool _isEditing;

    public event Action? Saved;

    private Employee? _editingEmployee;

    public EmployeeFormViewModel(IEmployeeService employeeService, IDepartmentService departmentService)
    {
        _employeeService = employeeService;
        _departmentService = departmentService;
    }

    [RelayCommand]
    private async Task Initialize()
    {
        var depts = await _departmentService.GetAllAsync();
        Departments = new ObservableCollection<Department>(depts);
    }

    public void SetEmployee(Employee employee)
    {
        _editingEmployee = employee;
        FirstName = employee.FirstName;
        LastName = employee.LastName;
        Phone = employee.Phone;
        Email = employee.Email;
        Address = employee.Address;
        BaseSalary = employee.BaseSalary;
        DepartmentId = employee.DepartmentId;
        IsEditing = true;
    }

    public void Reset()
    {
        FirstName = string.Empty;
        LastName = string.Empty;
        Phone = null;
        Email = null;
        Address = null;
        BaseSalary = 0;
        DepartmentId = 0;
        _editingEmployee = null;
        IsEditing = false;
    }

    [RelayCommand]
    private async Task Save()
    {
        if (_editingEmployee != null)
        {
            _editingEmployee.FirstName = FirstName;
            _editingEmployee.LastName = LastName;
            _editingEmployee.Phone = Phone;
            _editingEmployee.Email = Email;
            _editingEmployee.Address = Address;
            _editingEmployee.BaseSalary = BaseSalary;
            _editingEmployee.DepartmentId = DepartmentId;
            await _employeeService.UpdateAsync(_editingEmployee);
        }
        else
        {
            var employee = new Employee
            {
                FirstName = FirstName,
                LastName = LastName,
                Phone = Phone,
                Email = Email,
                Address = Address,
                BaseSalary = BaseSalary,
                DepartmentId = DepartmentId,
                HireDate = DateTime.UtcNow
            };
            await _employeeService.AddAsync(employee);
        }
        Saved?.Invoke();
    }

    [RelayCommand]
    private void Cancel()
    {
        Saved?.Invoke();
    }
}
