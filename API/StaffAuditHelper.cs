using System.Security.Claims;

namespace API;

internal static class StaffAuditHelper
{
    public static string? Actor(ClaimsPrincipal user) =>
        user.FindFirstValue(ClaimTypes.Email) ?? user.FindFirstValue(ClaimTypes.Name);
}
