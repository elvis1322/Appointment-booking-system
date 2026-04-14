
namespace Domain.Entities.Constants;
public static class AppDefaults
{
    // SEKSIONI I ROLEVE
    public static class Users 
{
    public static readonly Guid AUserId = Guid.Parse("c1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5c");
}
    public static class Roles
    {
        public static readonly Guid AdminId = Guid.Parse("d1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d");
        public static readonly Guid EmployeeId = Guid.Parse("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5e");
        public static readonly Guid ClientId = Guid.Parse("b1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5f");
    }

    // SEKSIONI I LEJEVE (PERMISSIONS)
    public static class UserPermissions
    {
        public static readonly Guid UsersRead = Guid.Parse("11111111-2222-3333-4444-555555555551");
        public static readonly Guid UsersCreate = Guid.Parse("11111111-2222-3333-4444-555555555552");
          public static readonly Guid UsersUpdate = Guid.Parse("11111111-2222-3333-4444-555555555553");
        public static readonly Guid UsersDelete = Guid.Parse("11111111-2222-3333-4444-555555555554");
    }

    // KËTU DO TË SHTOJË KOLEGU YT
   
}
