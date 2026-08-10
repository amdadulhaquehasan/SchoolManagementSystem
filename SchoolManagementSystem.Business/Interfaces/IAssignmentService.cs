using SchoolManagementSystem.Presentation.DTOs.Assignments;

namespace SchoolManagementSystem.Business.Interfaces;

public interface IAssignmentService
{
    Task<AssignmentDto> CreateAsync(string teacherId, CreateAssignmentDto dto);
    Task<AssignmentDto> UpdateAsync(int id, string teacherId, UpdateAssignmentDto dto);
    Task DeleteAsync(int id, string requesterId, bool requesterIsAdmin);
    Task<AssignmentDto> ChangeStatusAsync(int id, string teacherId, bool publish);

    Task<AssignmentDto> GetByIdAsync(int id, string requesterId, string requesterRole);
    Task<IReadOnlyList<AssignmentDto>> GetForAdminAsync();
    Task<IReadOnlyList<AssignmentDto>> GetForTeacherAsync(string teacherId);
    Task<IReadOnlyList<AssignmentDto>> GetForStudentAsync(string studentId);
}
