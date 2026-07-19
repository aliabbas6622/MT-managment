using MalirTonight.Domain.Enums;

namespace MalirTonight.Application.FeatureManagement;

public class FeatureManager
{
    private LicenseTier _currentTier = LicenseTier.Basic;

    public void SetTier(LicenseTier tier) => _currentTier = tier;

    public bool IsEnabled(string featureName)
    {
        return _currentTier switch
        {
            LicenseTier.Premium => true,
            LicenseTier.Basic => featureName switch
            {
                "AutomaticPayroll" => false,
                "Analytics" => false,
                "Expenses" => false,
                "AuditLogs" => false,
                "Notifications" => false,
                "AdvancedReports" => false,
                "MultiUser" => false,
                _ => true
            },
            _ => false
        };
    }

    public LicenseTier CurrentTier => _currentTier;
}
