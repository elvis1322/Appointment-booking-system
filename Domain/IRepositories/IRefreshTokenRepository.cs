using Domain.Entities;

namespace Domain.Interfaces;

public interface IRefreshTokenRepository
{
    // Shërben për të gjetur token-in kur përdoruesi bën Logout ose Refresh
    Task<RefreshToken?> GetByTokenAsync(string token);

    // Shërben për të ruajtur token-in e ri gjatë Login-it
    Task AddAsync(RefreshToken refreshToken);

    // Shërben për të bërë IsRevoked = true ose IsUsed = true
    void Update(RefreshToken refreshToken);

    // Shërben për të konfirmuar ndryshimet në SQL Server
    Task<bool> SaveChangesAsync();

    // Opsionale: Fshin token-ët e vjetër të një përdoruesi (për pastrim databaze)
    Task DeleteUserTokensAsync(Guid userId);
}