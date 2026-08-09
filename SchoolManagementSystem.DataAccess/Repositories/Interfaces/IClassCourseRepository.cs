using SchoolManagementSystem.Domain.Entities;

namespace SchoolManagementSystem.DataAccess.Repositories.Interfaces;

public interface IClassCourseRepository : IGenericRepository<ClassCourse>
{
    Task<ClassCourse?> GetWithSubjectsAsync(int id);
    Task<bool> IsStudentEnrolledAsync(string studentId, int classCourseId);
}
