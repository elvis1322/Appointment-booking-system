
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
        public static readonly Guid UsersCreateClient = Guid.Parse("11111661-2222-3333-4444-555555555555");
         public static readonly Guid UsersCreateEmployee = Guid.Parse("11111781-2222-3333-4444-555555555556");

    }

    //Member 2
    public static class StaffPermissions
    {
        public static readonly Guid StaffRead = Guid.Parse("22222222-1111-1111-1111-222222222221");
        public static readonly Guid StaffCreate = Guid.Parse("22222222-1111-1111-1111-222222222222");
        public static readonly Guid StaffUpdate = Guid.Parse("22222222-1111-1111-1111-222222222223");
        public static readonly Guid StaffDelete = Guid.Parse("22222222-1111-1111-1111-222222222224");
    }

    public static class ServicePermissions
    {
        public static readonly Guid ServicesRead = Guid.Parse("33333333-1111-1111-1111-333333333331");
        public static readonly Guid ServicesCreate = Guid.Parse("33333333-1111-1111-1111-333333333332");
        public static readonly Guid ServicesUpdate = Guid.Parse("33333333-1111-1111-1111-333333333333");
        public static readonly Guid ServicesDelete = Guid.Parse("33333333-1111-1111-1111-333333333334");
    }

    public static class SchedulePermissions
    {
        public static readonly Guid SchedulesRead = Guid.Parse("44444444-1111-1111-1111-444444444441");
        public static readonly Guid SchedulesUpdate = Guid.Parse("44444444-1111-1111-1111-444444444442");
    }
    
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
    }
    public static class OrdersPermissions
    {
        public static readonly Guid OrdersRead = Guid.Parse("66666666-1111-1111-1111-666666666661");
        public static readonly Guid OrdersCreate = Guid.Parse("66666666-1111-1111-1111-666666666662");
        public static readonly Guid OrdersUpdate = Guid.Parse("66666666-1111-1111-1111-666666666663");
        public static readonly Guid OrdersDelete = Guid.Parse("66666666-1111-1111-1111-666666666664");
    }
    public static class OrderItemPermissions
    {
        public static readonly Guid OrderItemsRead = Guid.Parse("77777777-1111-1111-1111-777777777771");
        public static readonly Guid OrderItemsCreate = Guid.Parse("77777777-1111-1111-1111-777777777772");
        public static readonly Guid OrderItemsUpdate = Guid.Parse("77777777-1111-1111-1111-777777777773");
        public static readonly Guid OrderItemsDelete = Guid.Parse("77777777-1111-1111-1111-777777777774");
    }
    public static class PaymentPermissions
    {
        public static readonly Guid PaymentsRead = Guid.Parse("88888888-1111-1111-1111-888888888881");
        public static readonly Guid PaymentsCreate = Guid.Parse("88888888-1111-1111-1111-888888888882");
        public static readonly Guid PaymentsUpdate = Guid.Parse("88888888-1111-1111-1111-888888888883");
        public static readonly Guid PaymentsDelete = Guid.Parse("88888888-1111-1111-1111-888888888884");
    }
    public static class InvoicePermissions
    {
        public static readonly Guid InvoicesRead = Guid.Parse("99999999-1111-1111-1111-999999999991");
        public static readonly Guid InvoicesCreate = Guid.Parse("99999999-1111-1111-1111-999999999992");
        public static readonly Guid InvoicesUpdate = Guid.Parse("99999999-1111-1111-1111-999999999993");
        public static readonly Guid InvoicesDelete = Guid.Parse("99999999-1111-1111-1111-999999999994");
    }
    public static class ReviewPermissions
    {
        public static readonly Guid ReviewsRead = Guid.Parse("aaaaaaaa-1111-1111-1111-aaaaaaaaaa11");
        public static readonly Guid ReviewsCreate = Guid.Parse("aaaaaaaa-1111-1111-1111-aaaaaaaaaa12");
        public static readonly Guid ReviewsUpdate = Guid.Parse("aaaaaaaa-1111-1111-1111-aaaaaaaaaa13");
        public static readonly Guid ReviewsDelete = Guid.Parse("aaaaaaaa-1111-1111-1111-aaaaaaaaaa14");
    }
   
}

   

