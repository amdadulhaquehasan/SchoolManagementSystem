using SchoolManagementSystem.Domain.Entities;

namespace SchoolManagementSystem.DataAccess.Repositories.Interfaces;

public interface ITeacherSubjectAssignmentRepository : IGenericRepository<TeacherSubjectAssignment>
{
    Task<IReadOnlyList<TeacherSubjectAssignment>> GetByTeacherAsync(string teacherId);
}
