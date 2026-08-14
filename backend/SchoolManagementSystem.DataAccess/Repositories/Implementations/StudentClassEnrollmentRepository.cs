using Microsoft.EntityFrameworkCore;
using SchoolManagementSystem.DataAccess.Context;
using SchoolManagementSystem.DataAccess.Repositories.Interfaces;
using SchoolManagementSystem.Domain.Entities;

namespace SchoolManagementSystem.DataAccess.Repositories.Implementations;

public class StudentClassEnrollmentRepository : GenericRepository<StudentClassEnrollment>, IStudentClassEnrollmentRepository
{
    public StudentClassEnrollmentRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IReadOnlyList<StudentClassEnrollment>> GetByStudentAsync(string studentId) =>
        await DbSet.Include(e => e.ClassCourse).Where(e => e.StudentId == studentId).ToListAsync();
}
