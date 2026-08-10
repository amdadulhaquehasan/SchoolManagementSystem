using SchoolManagementSystem.Business.Interfaces;
using SchoolManagementSystem.DataAccess.Exceptions;
using SchoolManagementSystem.DataAccess.Repositories.Interfaces;
using SchoolManagementSystem.Domain.Constants;
using SchoolManagementSystem.Domain.Entities;
using SchoolManagementSystem.Domain.Enums;
using SchoolManagementSystem.Presentation.DTOs.Assignments;

namespace SchoolManagementSystem.Business.Services;

public class AssignmentService : IAssignmentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileService _fileService;

    public AssignmentService(IUnitOfWork unitOfWork, IFileService fileService)
    {
        _unitOfWork = unitOfWork;
        _fileService = fileService;
    }

    public async Task<AssignmentDto> CreateAsync(string teacherId, CreateAssignmentDto dto)
    {
        var subject = await _unitOfWork.Subjects.GetByIdAsync(dto.SubjectId)
            ?? throw new NotFoundException(nameof(Subject), dto.SubjectId);

        var classCourse = await _unitOfWork.ClassCourses.GetByIdAsync(dto.ClassCourseId)
            ?? throw new NotFoundException(nameof(ClassCourse), dto.ClassCourseId);

        if (subject.ClassCourseId != classCourse.Id)
            throw new BadRequestException("The selected subject does not belong to the selected class/course.");

        var isAssigned = await _unitOfWork.Subjects.IsTeacherAssignedAsync(teacherId, subject.Id);
        if (!isAssigned)
            throw new ForbiddenAccessException("You are not assigned to teach this subject.");

        if (string.IsNullOrWhiteSpace(dto.Description) && dto.File is null)
            throw new BadRequestException("Provide a description, a file, or both for the assignment.");

        if (dto.DeadlineUtc <= DateTime.UtcNow)
            throw new BadRequestException("Deadline must be in the future.");

        var entity = new Assignment
        {
            Title = dto.Title,
            Description = dto.Description,
            DeadlineUtc = dto.DeadlineUtc,
            MaxMarks = dto.MaxMarks,
            Status = dto.Publish ? AssignmentStatus.Published : AssignmentStatus.Draft,
            TeacherId = teacherId,
            SubjectId = subject.Id,
            ClassCourseId = classCourse.Id
        };

        if (dto.File is not null)
        {
            var saved = await _fileService.SaveAssignmentFileAsync(dto.File);
            entity.AttachmentPath = saved.RelativePath;
            entity.AttachmentOriginalFileName = saved.OriginalFileName;
        }

        await _unitOfWork.Assignments.AddAsync(entity);
        await _unitOfWork.SaveChangesAsync();

        return await ToDtoAsync(entity.Id, teacherId, AppRoles.Teacher);
    }

    public async Task<AssignmentDto> UpdateAsync(int id, string teacherId, UpdateAssignmentDto dto)
    {
        var entity = await _unitOfWork.Assignments.GetWithDetailsAsync(id)
            ?? throw new NotFoundException(nameof(Assignment), id);

        EnsureOwner(entity, teacherId);

        entity.Title = dto.Title;
        entity.Description = dto.Description;
        entity.DeadlineUtc = dto.DeadlineUtc;
        entity.MaxMarks = dto.MaxMarks;
        entity.UpdatedAtUtc = DateTime.UtcNow;

        if (dto.File is not null)
        {
            _fileService.DeleteFile(entity.AttachmentPath);
            var saved = await _fileService.SaveAssignmentFileAsync(dto.File);
            entity.AttachmentPath = saved.RelativePath;
            entity.AttachmentOriginalFileName = saved.OriginalFileName;
        }
        else if (dto.RemoveExistingFile)
        {
            _fileService.DeleteFile(entity.AttachmentPath);
            entity.AttachmentPath = null;
            entity.AttachmentOriginalFileName = null;
        }

        if (string.IsNullOrWhiteSpace(entity.Description) && entity.AttachmentPath is null)
            throw new BadRequestException("An assignment must have a description, a file, or both.");

        _unitOfWork.Assignments.Update(entity);
        await _unitOfWork.SaveChangesAsync();

        return await ToDtoAsync(entity.Id, teacherId, AppRoles.Teacher);
    }

    public async Task DeleteAsync(int id, string requesterId, bool requesterIsAdmin)
    {
        var entity = await _unitOfWork.Assignments.GetWithDetailsAsync(id)
            ?? throw new NotFoundException(nameof(Assignment), id);

        if (!requesterIsAdmin) EnsureOwner(entity, requesterId);

        _fileService.DeleteFile(entity.AttachmentPath);
        foreach (var submission in entity.Submissions)
            _fileService.DeleteFile(submission.FilePath);

        _unitOfWork.Assignments.Remove(entity);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<AssignmentDto> ChangeStatusAsync(int id, string teacherId, bool publish)
    {
        var entity = await _unitOfWork.Assignments.GetWithDetailsAsync(id)
            ?? throw new NotFoundException(nameof(Assignment), id);

        EnsureOwner(entity, teacherId);

        entity.Status = publish ? AssignmentStatus.Published : AssignmentStatus.Draft;
        entity.UpdatedAtUtc = DateTime.UtcNow;

        _unitOfWork.Assignments.Update(entity);
        await _unitOfWork.SaveChangesAsync();

        return await ToDtoAsync(entity.Id, teacherId, AppRoles.Teacher);
    }

    public async Task<AssignmentDto> GetByIdAsync(int id, string requesterId, string requesterRole)
    {
        var entity = await _unitOfWork.Assignments.GetWithDetailsAsync(id)
            ?? throw new NotFoundException(nameof(Assignment), id);

        if (requesterRole == AppRoles.Teacher && entity.TeacherId != requesterId)
            throw new ForbiddenAccessException("You can only view your own assignments.");

        if (requesterRole == AppRoles.Student)
        {
            if (entity.Status != AssignmentStatus.Published)
                throw new ForbiddenAccessException("This assignment is not yet published.");

            var enrolled = await _unitOfWork.ClassCourses.IsStudentEnrolledAsync(requesterId, entity.ClassCourseId);
            if (!enrolled)
                throw new ForbiddenAccessException("This assignment is not available to you.");
        }

        return await ToDtoAsync(id, requesterId, requesterRole);
    }

    public async Task<IReadOnlyList<AssignmentDto>> GetForAdminAsync()
    {
        var assignments = await _unitOfWork.Assignments.GetAllWithDetailsAsync();
        return assignments.Select(a => MapToDto(a, null)).ToList();
    }

    public async Task<IReadOnlyList<AssignmentDto>> GetForTeacherAsync(string teacherId)
    {
        var assignments = await _unitOfWork.Assignments.GetByTeacherAsync(teacherId);
        return assignments.Select(a => MapToDto(a, null)).ToList();
    }

    public async Task<IReadOnlyList<AssignmentDto>> GetForStudentAsync(string studentId)
    {
        var enrollments = await _unitOfWork.StudentClassEnrollments.GetByStudentAsync(studentId);
        var classCourseIds = enrollments.Select(e => e.ClassCourseId).ToList();

        var assignments = await _unitOfWork.Assignments.GetPublishedForStudentClassesAsync(classCourseIds);

        var result = new List<AssignmentDto>();
        foreach (var a in assignments)
        {
            var mySubmission = a.Submissions.FirstOrDefault(s => s.StudentId == studentId);
            result.Add(MapToDto(a, mySubmission?.Status.ToString()));
        }
        return result;
    }

    private static void EnsureOwner(Assignment entity, string teacherId)
    {
        if (entity.TeacherId != teacherId)
            throw new ForbiddenAccessException("You can only manage your own assignments.");
    }

    private async Task<AssignmentDto> ToDtoAsync(int id, string requesterId, string requesterRole)
    {
        var entity = await _unitOfWork.Assignments.GetWithDetailsAsync(id)
            ?? throw new NotFoundException(nameof(Assignment), id);

        string? myStatus = null;
        if (requesterRole == AppRoles.Student)
            myStatus = entity.Submissions.FirstOrDefault(s => s.StudentId == requesterId)?.Status.ToString();

        return MapToDto(entity, myStatus);
    }

    private AssignmentDto MapToDto(Assignment a, string? myStatus) => new()
    {
        Id = a.Id,
        Title = a.Title,
        Description = a.Description,
        DeadlineUtc = a.DeadlineUtc,
        MaxMarks = a.MaxMarks,
        Status = a.Status.ToString(),
        AttachmentUrl = _fileService.BuildUrl(a.AttachmentPath),
        AttachmentOriginalFileName = a.AttachmentOriginalFileName,
        TeacherId = a.TeacherId,
        TeacherName = a.Teacher?.FullName ?? string.Empty,
        SubjectId = a.SubjectId,
        SubjectName = a.Subject?.Name ?? string.Empty,
        ClassCourseId = a.ClassCourseId,
        ClassCourseName = a.ClassCourse?.Name ?? string.Empty,
        SubmissionCount = a.Submissions?.Count ?? 0,
        CreatedAtUtc = a.CreatedAtUtc,
        MySubmissionStatus = myStatus
    };
}
