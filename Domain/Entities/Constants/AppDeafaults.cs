
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

<<<<<<< HEAD
    
    //Member 2
    public static class StaffPermissions
    {
        public static readonly Guid StaffRead = Guid.Parse("22222222-1111-1111-1111-222222222221");
        public static readonly Guid StaffCreate = Guid.Parse("22222222-1111-1111-1111-222222222222");
        public static readonly Guid StaffUpdate = Guid.Parse("22222222-1111-1111-1111-222222222223");
        public static readonly Guid StaffDelete = Guid.Parse("22222222-1111-1111-1111-222222222224");
    }

    public static class SchedulePermissions
    {
        public static readonly Guid SchedulesRead = Guid.Parse("44444444-1111-1111-1111-444444444441");
        public static readonly Guid SchedulesUpdate = Guid.Parse("44444444-1111-1111-1111-444444444442");
=======
    //Member 3
    
     public static class AppointmentPermissions
    {
        public static readonly Guid AppointmentsRead   = Guid.Parse("55555555-1111-1111-1111-511111111211");
        public static readonly Guid AppointmentsCreate = Guid.Parse("55555555-1111-1111-1111-005522222112"); // Shtuar dy 0 para
        public static readonly Guid AppointmentsUpdate = Guid.Parse("55555555-1111-1111-1111-005533333313"); // Shtuar dy 0 para
        public static readonly Guid AppointmentsDelete = Guid.Parse("55555555-1111-1111-1111-055544444444"); // Shtuar një 0 para
    }
    public static class AppointmentStatus
    {
        public static readonly Guid Pending   = Guid.Parse("11111111-1111-1111-1111-111111111111");
        public static readonly Guid Confirmed = Guid.Parse("22222222-2222-2222-2222-222222222222");
        public static readonly Guid Cancelled = Guid.Parse("33333333-3333-3333-3333-333333333333");
        public static readonly Guid Completed = Guid.Parse("44444444-4444-4444-4444-444444444444");
>>>>>>> origin/main
    }
   
}
