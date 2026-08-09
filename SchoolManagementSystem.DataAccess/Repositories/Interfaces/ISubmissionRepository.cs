using SchoolManagementSystem.Domain.Entities;

namespace SchoolManagementSystem.DataAccess.Repositories.Interfaces;

public interface ISubmissionRepository : IGenericRepository<Submission>
{
    Task<Submission?> GetByAssignmentAndStudentAsync(int assignmentId, string studentId);
    Task<IReadOnlyList<Submission>> GetByAssignmentAsync(int assignmentId);
    Task<IReadOnlyList<Submission>> GetByStudentAsync(string studentId);
    Task<Submission?> GetWithDetailsAsync(int id);
}
