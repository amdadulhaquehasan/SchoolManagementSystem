using Microsoft.EntityFrameworkCore;
using SchoolManagementSystem.DataAccess.Context;
using SchoolManagementSystem.DataAccess.Repositories.Interfaces;
using SchoolManagementSystem.Domain.Entities;

namespace SchoolManagementSystem.DataAccess.Repositories.Implementations;

public class ClassCourseRepository : GenericRepository<ClassCourse>, IClassCourseRepository
{
    public ClassCourseRepository(ApplicationDbContext context) : base(context) { }

    public async Task<ClassCourse?> GetWithSubjectsAsync(int id) =>
        await DbSet.Include(c => c.Subjects).FirstOrDefaultAsync(c => c.Id == id);

    public async Task<bool> IsStudentEnrolledAsync(string studentId, int classCourseId) =>
        await Context.StudentClassEnrollments
            .AnyAsync(e => e.StudentId == studentId && e.ClassCourseId == classCourseId);
}
