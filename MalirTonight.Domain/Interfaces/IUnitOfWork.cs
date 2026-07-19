namespace MalirTonight.Domain.Interfaces;

public interface IUnitOfWork
{
    Task<int> CommitAsync();
}
