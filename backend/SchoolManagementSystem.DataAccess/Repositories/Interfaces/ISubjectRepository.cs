using SchoolManagementSystem.Domain.Entities;

namespace SchoolManagementSystem.DataAccess.Repositories.Interfaces;

public interface ISubjectRepository : IGenericRepository<Subject>
{
    Task<Subject?> GetWithClassCourseAsync(int id);
    Task<bool> IsTeacherAssignedAsync(string teacherId, int subjectId);
}
