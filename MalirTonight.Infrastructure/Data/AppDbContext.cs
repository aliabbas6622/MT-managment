using MalirTonight.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MalirTonight.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<Salary> Salaries => Set<Salary>();
    public DbSet<Leave> Leaves => Set<Leave>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<Setting> Settings => Set<Setting>();
    public DbSet<License> Licenses => Set<License>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Employee>(e =>
        {
            e.Property(x => x.FirstName).HasMaxLength(100).IsRequired();
            e.Property(x => x.LastName).HasMaxLength(100).IsRequired();
            e.Property(x => x.Phone).HasMaxLength(20);
            e.Property(x => x.Email).HasMaxLength(200);
            e.Property(x => x.Address).HasMaxLength(500);
            e.Property(x => x.BaseSalary).HasColumnType("decimal(18,2)");
            e.HasOne(x => x.Department).WithMany(d => d.Employees).HasForeignKey(x => x.DepartmentId);
        });

        modelBuilder.Entity<Attendance>(a =>
        {
            a.HasOne(x => x.Employee).WithMany(e => e.Attendances).HasForeignKey(x => x.EmployeeId);
            a.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            a.Property(x => x.Notes).HasMaxLength(500);
        });

        modelBuilder.Entity<Salary>(s =>
        {
            s.HasOne(x => x.Employee).WithMany(e => e.Salaries).HasForeignKey(x => x.EmployeeId);
            s.Property(x => x.BaseAmount).HasColumnType("decimal(18,2)");
            s.Property(x => x.Deductions).HasColumnType("decimal(18,2)");
            s.Property(x => x.Bonuses).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<Leave>(l =>
        {
            l.HasOne(x => x.Employee).WithMany(e => e.Leaves).HasForeignKey(x => x.EmployeeId);
            l.Property(x => x.Type).HasConversion<string>().HasMaxLength(20);
            l.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            l.Property(x => x.Reason).HasMaxLength(500);
        });

        modelBuilder.Entity<Department>(d =>
        {
            d.Property(x => x.Name).HasMaxLength(200).IsRequired();
            d.Property(x => x.Description).HasMaxLength(500);
        });

        modelBuilder.Entity<Expense>(e =>
        {
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.Description).HasMaxLength(500);
            e.Property(x => x.Amount).HasColumnType("decimal(18,2)");
            e.Property(x => x.Category).HasConversion<string>().HasMaxLength(50);
        });

        modelBuilder.Entity<User>(u =>
        {
            u.Property(x => x.Username).HasMaxLength(100).IsRequired();
            u.Property(x => x.PasswordHash).IsRequired();
            u.Property(x => x.DisplayName).HasMaxLength(200).IsRequired();
            u.HasOne(x => x.Role).WithMany(r => r.Users).HasForeignKey(x => x.RoleId);
        });

        modelBuilder.Entity<Role>(r =>
        {
            r.Property(x => x.Name).HasMaxLength(100).IsRequired();
            r.Property(x => x.Description).HasMaxLength(500);
        });

        modelBuilder.Entity<AuditLog>(a =>
        {
            a.Property(x => x.Action).HasMaxLength(200).IsRequired();
            a.Property(x => x.EntityName).HasMaxLength(200).IsRequired();
            a.Property(x => x.UserName).HasMaxLength(200);
        });

        modelBuilder.Entity<Setting>(s =>
        {
            s.Property(x => x.Key).HasMaxLength(200).IsRequired();
            s.Property(x => x.Value).IsRequired();
            s.Property(x => x.Description).HasMaxLength(500);
            s.HasIndex(x => x.Key).IsUnique();
        });

        modelBuilder.Entity<License>(l =>
        {
            l.Property(x => x.LicenseKey).HasMaxLength(500).IsRequired();
            l.Property(x => x.Tier).HasConversion<string>().HasMaxLength(20);
            l.Property(x => x.LicensedTo).HasMaxLength(200);
        });
    }
}
