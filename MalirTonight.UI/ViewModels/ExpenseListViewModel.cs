using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using MalirTonight.Application.Interfaces;
using MalirTonight.Domain.Entities;
using MalirTonight.Domain.Enums;

namespace MalirTonight.UI.ViewModels;

public partial class ExpenseListViewModel : ObservableObject
{
    private readonly IExpenseService _expenseService;

    [ObservableProperty]
    private ObservableCollection<Expense> _expenses = new();

    [ObservableProperty]
    private string _title = string.Empty;

    [ObservableProperty]
    private decimal _amount;

    [ObservableProperty]
    private ExpenseCategory _selectedCategory = ExpenseCategory.Other;

    public ObservableCollection<ExpenseCategory> Categories { get; } = new(Enum.GetValues<ExpenseCategory>());

    public ExpenseListViewModel(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    [RelayCommand]
    private async Task Load()
    {
        var items = await _expenseService.GetAllAsync();
        Expenses = new ObservableCollection<Expense>(items);
    }

    [RelayCommand]
    private async Task Add()
    {
        if (string.IsNullOrWhiteSpace(Title) || Amount <= 0) return;
        await _expenseService.AddAsync(new Expense
        {
            Title = Title,
            Amount = Amount,
            Category = SelectedCategory,
            Date = DateTime.Today
        });
        Title = string.Empty;
        Amount = 0;
        await Load();
    }
}
