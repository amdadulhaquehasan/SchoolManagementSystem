using SchoolManagementSystem.Presentation.DTOs.ClassCourses;

namespace SchoolManagementSystem.Business.Interfaces;

public interface IClassCourseService
{
    Task<ClassCourseDto> CreateAsync(CreateClassCourseDto dto);
    Task<ClassCourseDto> UpdateAsync(int id, CreateClassCourseDto dto);
    Task DeleteAsync(int id);
    Task<ClassCourseDto> GetByIdAsync(int id);
    Task<IReadOnlyList<ClassCourseDto>> GetAllAsync();
    Task EnrollStudentAsync(int classCourseId, string studentId);
    Task UnenrollStudentAsync(int classCourseId, string studentId);
}
