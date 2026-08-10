using Microsoft.AspNetCore.Identity;
using SchoolManagementSystem.Business.Interfaces;
using SchoolManagementSystem.DataAccess.Exceptions;
using SchoolManagementSystem.DataAccess.Repositories.Interfaces;
using SchoolManagementSystem.Domain.Constants;
using SchoolManagementSystem.Domain.Entities;
using SchoolManagementSystem.Presentation.DTOs.Users;

namespace SchoolManagementSystem.Business.Services;

/// <summary>
/// Implements "the admin can create teacher and the student" plus general user management,
/// using ASP.NET Core Identity's UserManager under the hood.
/// </summary>
public class UserManagementService : IUserManagementService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IUnitOfWork _unitOfWork;

    public UserManagementService(UserManager<ApplicationUser> userManager, IUnitOfWork unitOfWork)
    {
        _userManager = userManager;
        _unitOfWork = unitOfWork;
    }

    public async Task<UserDto> CreateTeacherAsync(CreateTeacherDto dto)
    {
        var user = await CreateUserAsync(dto.Email, dto.Password, dto.FirstName, dto.LastName, AppRoles.Teacher);
        return await ToDtoAsync(user);
    }

    public async Task<UserDto> CreateStudentAsync(CreateStudentDto dto)
    {
        var user = await CreateUserAsync(dto.Email, dto.Password, dto.FirstName, dto.LastName, AppRoles.Student);

        if (dto.ClassCourseId.HasValue)
        {
            var classCourse = await _unitOfWork.ClassCourses.GetByIdAsync(dto.ClassCourseId.Value)
                ?? throw new NotFoundException(nameof(ClassCourse), dto.ClassCourseId.Value);

            await _unitOfWork.StudentClassEnrollments.AddAsync(new StudentClassEnrollment
            {
                StudentId = user.Id,
                ClassCourseId = classCourse.Id
            });
            await _unitOfWork.SaveChangesAsync();
        }

        return await ToDtoAsync(user);
    }

    private async Task<ApplicationUser> CreateUserAsync(string email, string password, string firstName, string lastName, string role)
    {
        var existing = await _userManager.FindByEmailAsync(email);
        if (existing is not null)
            throw new BadRequestException($"A user with email '{email}' already exists.");

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            EmailConfirmed = true,
            IsActive = true
        };

        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded)
            throw new BadRequestException(string.Join(" ", result.Errors.Select(e => e.Description)));

        await _userManager.AddToRoleAsync(user, role);
        return user;
    }

    public async Task<IReadOnlyList<UserDto>> GetUsersByRoleAsync(string? role)
    {
        List<ApplicationUser> users;
        if (string.IsNullOrWhiteSpace(role))
        {
            users = _userManager.Users.ToList();
        }
        else
        {
            var inRole = await _userManager.GetUsersInRoleAsync(role);
            users = inRole.ToList();
        }

        var dtos = new List<UserDto>();
        foreach (var user in users)
            dtos.Add(await ToDtoAsync(user));

        return dtos;
    }

    public async Task<UserDto> GetByIdAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new NotFoundException(nameof(ApplicationUser), userId);
        return await ToDtoAsync(user);
    }

    public async Task DeactivateUserAsync(string userId) => await SetActiveAsync(userId, false);

    public async Task ActivateUserAsync(string userId) => await SetActiveAsync(userId, true);

    private async Task SetActiveAsync(string userId, bool isActive)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new NotFoundException(nameof(ApplicationUser), userId);

        user.IsActive = isActive;
        await _userManager.UpdateAsync(user);
    }

    public async Task DeleteUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new NotFoundException(nameof(ApplicationUser), userId);

        var roles = await _userManager.GetRolesAsync(user);
        if (roles.Contains(AppRoles.Admin))
            throw new BadRequestException("The Admin account cannot be deleted.");

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
            throw new BadRequestException(string.Join(" ", result.Errors.Select(e => e.Description)));
    }

    private async Task<UserDto> ToDtoAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        return new UserDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email ?? string.Empty,
            Role = roles.FirstOrDefault() ?? string.Empty,
            IsActive = user.IsActive,
            CreatedAtUtc = user.CreatedAtUtc
        };
    }
}
