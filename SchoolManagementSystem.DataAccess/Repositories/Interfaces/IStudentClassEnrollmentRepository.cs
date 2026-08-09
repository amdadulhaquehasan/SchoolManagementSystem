using SchoolManagementSystem.Domain.Entities;

namespace SchoolManagementSystem.DataAccess.Repositories.Interfaces;

public interface IStudentClassEnrollmentRepository : IGenericRepository<StudentClassEnrollment>
{
    Task<IReadOnlyList<StudentClassEnrollment>> GetByStudentAsync(string studentId);
}
