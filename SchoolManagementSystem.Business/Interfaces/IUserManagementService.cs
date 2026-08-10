using SchoolManagementSystem.Presentation.DTOs.Users;

namespace SchoolManagementSystem.Business.Interfaces;

public interface IUserManagementService
{
    Task<UserDto> CreateTeacherAsync(CreateTeacherDto dto);
    Task<UserDto> CreateStudentAsync(CreateStudentDto dto);
    Task<IReadOnlyList<UserDto>> GetUsersByRoleAsync(string? role);
    Task<UserDto> GetByIdAsync(string userId);
    Task DeactivateUserAsync(string userId);
    Task ActivateUserAsync(string userId);
    Task DeleteUserAsync(string userId);
}
