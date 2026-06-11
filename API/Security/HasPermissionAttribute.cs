using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace API.Security;
public class HasPermissionAttribute : AuthorizeAttribute, IAuthorizationFilter
{
    private readonly string _permission;
    public HasPermissionAttribute(string permission) => _permission = permission;

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var hasClaim = context.HttpContext.User.Claims
            .Any(c => c.Type == "permission" && c.Value == _permission);

        if (!hasClaim)
        {
            context.Result = new ForbidResult();
        }
    }
}