using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using MalirTonight.Application.FeatureManagement;
using MalirTonight.Domain.Enums;

namespace MalirTonight.UI.ViewModels;

public partial class LicensingViewModel : ObservableObject
{
    private readonly FeatureManager _featureManager;

    [ObservableProperty]
    private string _currentTier = "Basic";

    public event Action<string>? TierChanged;

    public LicensingViewModel(FeatureManager featureManager)
    {
        _featureManager = featureManager;
    }

    [RelayCommand]
    private void ActivatePremium()
    {
        _featureManager.SetTier(LicenseTier.Premium);
        CurrentTier = "Premium";
        TierChanged?.Invoke("Premium");
    }

    [RelayCommand]
    private void ActivateBasic()
    {
        _featureManager.SetTier(LicenseTier.Basic);
        CurrentTier = "Basic";
        TierChanged?.Invoke("Basic");
    }
}