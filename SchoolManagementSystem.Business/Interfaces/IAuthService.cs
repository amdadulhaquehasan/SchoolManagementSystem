using SchoolManagementSystem.Presentation.DTOs.Auth;

namespace SchoolManagementSystem.Business.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
}
