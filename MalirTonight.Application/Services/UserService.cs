using System.Security.Cryptography;
using System.Text;
using MalirTonight.Application.Interfaces;
using MalirTonight.Domain.Entities;
using MalirTonight.Domain.Interfaces;

namespace MalirTonight.Application.Services;

public class UserService : IUserService
{
    private readonly IRepository<User> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UserService(IRepository<User> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<User>> GetAllAsync() => await _repository.GetAllAsync();

    public async Task<User?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

    public async Task AddAsync(User user)
    {
        user.PasswordHash = HashPassword(user.PasswordHash);
        await _repository.AddAsync(user);
        await _unitOfWork.CommitAsync();
    }

    public async Task UpdateAsync(User user)
    {
        _repository.Update(user);
        await _unitOfWork.CommitAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity != null)
        {
            _repository.Delete(entity);
            await _unitOfWork.CommitAsync();
        }
    }

    public async Task<User?> AuthenticateAsync(string username, string password)
    {
        var users = await _repository.FindAsync(u => u.Username == username && u.IsActive);
        var user = users.FirstOrDefault();
        if (user == null) return null;

        var hash = HashPassword(password);
        return user.PasswordHash == hash ? user : null;
    }

    private static string HashPassword(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
