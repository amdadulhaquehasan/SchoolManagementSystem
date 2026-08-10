using SchoolManagementSystem.Presentation.DTOs.Subjects;

namespace SchoolManagementSystem.Business.Interfaces;

public interface ISubjectService
{
    Task<SubjectDto> CreateAsync(CreateSubjectDto dto);
    Task<SubjectDto> UpdateAsync(int id, CreateSubjectDto dto);
    Task DeleteAsync(int id);
    Task<SubjectDto> GetByIdAsync(int id);
    Task<IReadOnlyList<SubjectDto>> GetAllAsync(int? classCourseId);
    Task AssignTeacherAsync(int subjectId, string teacherId);
    Task UnassignTeacherAsync(int subjectId, string teacherId);
}
