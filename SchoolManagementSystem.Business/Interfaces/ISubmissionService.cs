using SchoolManagementSystem.Presentation.DTOs.Submissions;

namespace SchoolManagementSystem.Business.Interfaces;

public interface ISubmissionService
{
    Task<SubmissionDto> SubmitAsync(int assignmentId, string studentId, CreateSubmissionDto dto);
    Task<SubmissionDto> UpdateAsync(int submissionId, string studentId, UpdateSubmissionDto dto);

    Task<SubmissionDto> GetByIdAsync(int submissionId, string requesterId, string requesterRole);
    Task<IReadOnlyList<SubmissionDto>> GetByAssignmentAsync(int assignmentId, string requesterId, string requesterRole);
    Task<IReadOnlyList<SubmissionDto>> GetMySubmissionsAsync(string studentId);

    Task<SubmissionDto> GradeAsync(int submissionId, string teacherId, GradeSubmissionDto dto);
    Task<SubmissionDto> ChangeStatusAsync(int submissionId, string teacherId, ChangeSubmissionStatusDto dto);
}
