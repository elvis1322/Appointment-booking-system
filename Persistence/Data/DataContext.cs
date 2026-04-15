using Domain.Entities;
using Domain.Entities.Constants;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http; // E rëndësishme
using System.Security.Claims;    // Shto këtë për ClaimTypes
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Persistence.Data;

public class DataContext : DbContext
{
    // 1. Deklaro fushën private
   
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Seed();
    }
}