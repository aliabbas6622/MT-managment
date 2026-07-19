namespace MalirTonight.Domain.Entities;

public class Salary : BaseEntity
{
    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
    public decimal BaseAmount { get; set; }
    public decimal Deductions { get; set; }
    public decimal Bonuses { get; set; }
    public decimal NetAmount => BaseAmount + Bonuses - Deductions;
    public bool IsPaid { get; set; }
    public DateTime? PaidDate { get; set; }
    public bool IsAutomatic { get; set; }
}
