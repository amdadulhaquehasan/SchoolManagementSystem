using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using SchoolManagementSystem.Domain.Constants;
using SchoolManagementSystem.Domain.Entities;

namespace SchoolManagementSystem.DataAccess.Context;

public static class DbInitializer
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var configuration = services.GetRequiredService<IConfiguration>();
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("DbInitializer");


        foreach (var role in AppRoles.All)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }


        var adminEmail = configuration["AdminSeed:Email"] ?? "admin@school.com";
        var adminPassword = configuration["AdminSeed:Password"] ?? "Admin@12345";
        var adminFirstName = configuration["AdminSeed:FirstName"] ?? "System";
        var adminLastName = configuration["AdminSeed:LastName"] ?? "Administrator";

        var existingAdmin = await userManager.FindByEmailAsync(adminEmail);
        if (existingAdmin is null)
        {
            var admin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FirstName = adminFirstName,
                LastName = adminLastName,
                EmailConfirmed = true,
                IsActive = true
            };

            var result = await userManager.CreateAsync(admin, adminPassword);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, AppRoles.Admin);
                logger.LogInformation("Seeded default Admin account with email {Email}", adminEmail);
            }
            else
            {
                logger.LogError("Failed to seed Admin account: {Errors}",
                    string.Join(", ", result.Errors.Select(e => e.Description)));
            }
        }
        else if (!await userManager.IsInRoleAsync(existingAdmin, AppRoles.Admin))
        {
            await userManager.AddToRoleAsync(existingAdmin, AppRoles.Admin);
        }
    }
}
