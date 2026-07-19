using MalirTonight.Domain.Interfaces;

namespace MalirTonight.Infrastructure.Data;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public UnitOfWork(AppDbContext context) => _context = context;

    public async Task<int> CommitAsync() => await _context.SaveChangesAsync();
}
