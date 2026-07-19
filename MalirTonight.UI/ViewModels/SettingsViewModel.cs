using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using MalirTonight.Application.Interfaces;
using MalirTonight.Domain.Entities;

namespace MalirTonight.UI.ViewModels;

public partial class SettingsViewModel : ObservableObject
{
    private readonly ISettingsService _settingsService;

    [ObservableProperty]
    private ObservableCollection<Setting> _settings = new();

    [ObservableProperty]
    private string _newKey = string.Empty;

    [ObservableProperty]
    private string _newValue = string.Empty;

    public SettingsViewModel(ISettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    [RelayCommand]
    private async Task Load()
    {
        var items = await _settingsService.GetAllAsync();
        Settings = new ObservableCollection<Setting>(items);
    }

    [RelayCommand]
    private async Task Add()
    {
        if (string.IsNullOrWhiteSpace(NewKey)) return;
        await _settingsService.SetAsync(NewKey, NewValue);
        NewKey = string.Empty;
        NewValue = string.Empty;
        await Load();
    }
}
