using MalirTonight.Domain.Enums;

namespace MalirTonight.Domain.Entities;

public class License : BaseEntity
{
    public string LicenseKey { get; set; } = string.Empty;
    public LicenseTier Tier { get; set; } = LicenseTier.Basic;
    public DateTime ExpiryDate { get; set; }
    public bool IsActive { get; set; } = true;
    public string? LicensedTo { get; set; }
}
