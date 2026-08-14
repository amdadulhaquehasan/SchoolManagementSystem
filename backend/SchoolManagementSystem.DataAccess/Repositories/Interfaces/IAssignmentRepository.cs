using SchoolManagementSystem.Domain.Entities;

namespace SchoolManagementSystem.DataAccess.Repositories.Interfaces;

public interface IAssignmentRepository : IGenericRepository<Assignment>
{
    Task<Assignment?> GetWithDetailsAsync(int id);
    Task<IReadOnlyList<Assignment>> GetByTeacherAsync(string teacherId);
    Task<IReadOnlyList<Assignment>> GetPublishedForStudentClassesAsync(IEnumerable<int> classCourseIds);
    Task<IReadOnlyList<Assignment>> GetAllWithDetailsAsync();
}
