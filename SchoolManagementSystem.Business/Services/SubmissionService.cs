using SchoolManagementSystem.Business.Interfaces;
using SchoolManagementSystem.DataAccess.Exceptions;
using SchoolManagementSystem.DataAccess.Repositories.Interfaces;
using SchoolManagementSystem.Domain.Constants;
using SchoolManagementSystem.Domain.Entities;
using SchoolManagementSystem.Domain.Enums;
using SchoolManagementSystem.Presentation.DTOs.Submissions;

namespace SchoolManagementSystem.Business.Services;

public class SubmissionService : ISubmissionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileService _fileService;

    public SubmissionService(IUnitOfWork unitOfWork, IFileService fileService)
    {
        _unitOfWork = unitOfWork;
        _fileService = fileService;
    }

    public async Task<SubmissionDto> SubmitAsync(int assignmentId, string studentId, CreateSubmissionDto dto)
    {
        var assignment = await _unitOfWork.Assignments.GetWithDetailsAsync(assignmentId)
            ?? throw new NotFoundException(nameof(Assignment), assignmentId);

        if (assignment.Status != AssignmentStatus.Published)
            throw new BadRequestException("This assignment is not currently published.");

        var enrolled = await _unitOfWork.ClassCourses.IsStudentEnrolledAsync(studentId, assignment.ClassCourseId);
        if (!enrolled)
            throw new ForbiddenAccessException("You are not enrolled in the class/course for this assignment.");

        var existing = await _unitOfWork.Submissions.GetByAssignmentAndStudentAsync(assignmentId, studentId);
        if (existing is not null)
            throw new BadRequestException("You have already submitted this assignment. Use update instead.");

        if (string.IsNullOrWhiteSpace(dto.TextAnswer) && dto.File is null)
            throw new BadRequestException("Provide a text answer, a file, or both.");

        var submission = new Submission
        {
            AssignmentId = assignmentId,
            StudentId = studentId,
            TextAnswer = dto.TextAnswer,
            SubmittedAtUtc = DateTime.UtcNow,
            Status = DateTime.UtcNow > assignment.DeadlineUtc ? SubmissionStatus.Late : SubmissionStatus.Submitted
        };

        if (dto.File is not null)
        {
            var saved = await _fileService.SaveSubmissionFileAsync(dto.File);
            submission.FilePath = saved.RelativePath;
            submission.OriginalFileName = saved.OriginalFileName;
        }

        await _unitOfWork.Submissions.AddAsync(submission);
        await _unitOfWork.SaveChangesAsync();

        return await ToDtoAsync(submission.Id);
    }

    public async Task<SubmissionDto> UpdateAsync(int submissionId, string studentId, UpdateSubmissionDto dto)
    {
        var submission = await _unitOfWork.Submissions.GetWithDetailsAsync(submissionId)
            ?? throw new NotFoundException(nameof(Submission), submissionId);

        if (submission.StudentId != studentId)
            throw new ForbiddenAccessException("You can only update your own submission.");

        if (DateTime.UtcNow > submission.Assignment.DeadlineUtc)
            throw new BadRequestException("The deadline has passed; this submission can no longer be updated.");

        if (submission.Status == SubmissionStatus.Graded)
            throw new BadRequestException("This submission has already been graded and cannot be updated.");

        if (dto.TextAnswer is not null)
            submission.TextAnswer = dto.TextAnswer;

        if (dto.File is not null)
        {
            _fileService.DeleteFile(submission.FilePath);
            var saved = await _fileService.SaveSubmissionFileAsync(dto.File);
            submission.FilePath = saved.RelativePath;
            submission.OriginalFileName = saved.OriginalFileName;
        }
        else if (dto.RemoveExistingFile)
        {
            _fileService.DeleteFile(submission.FilePath);
            submission.FilePath = null;
            submission.OriginalFileName = null;
        }

        if (string.IsNullOrWhiteSpace(submission.TextAnswer) && submission.FilePath is null)
            throw new BadRequestException("A submission must have a text answer, a file, or both.");

        submission.Status = SubmissionStatus.Resubmitted;
        submission.LastUpdatedAtUtc = DateTime.UtcNow;

        _unitOfWork.Submissions.Update(submission);
        await _unitOfWork.SaveChangesAsync();

        return await ToDtoAsync(submission.Id);
    }

    public async Task<SubmissionDto> GetByIdAsync(int submissionId, string requesterId, string requesterRole)
    {
        var submission = await _unitOfWork.Submissions.GetWithDetailsAsync(submissionId)
            ?? throw new NotFoundException(nameof(Submission), submissionId);

        await EnsureCanViewAsync(submission, requesterId, requesterRole);

        return await ToDtoAsync(submissionId);
    }

    public async Task<IReadOnlyList<SubmissionDto>> GetByAssignmentAsync(int assignmentId, string requesterId, string requesterRole)
    {
        var assignment = await _unitOfWork.Assignments.GetByIdAsync(assignmentId)
            ?? throw new NotFoundException(nameof(Assignment), assignmentId);

        if (requesterRole == AppRoles.Teacher && assignment.TeacherId != requesterId)
            throw new ForbiddenAccessException("You can only view submissions for your own assignments.");

        var submissions = await _unitOfWork.Submissions.GetByAssignmentAsync(assignmentId);
        var result = new List<SubmissionDto>();
        foreach (var s in submissions)
            result.Add(MapToDto(s, assignment.MaxMarks));

        return result;
    }

    public async Task<IReadOnlyList<SubmissionDto>> GetMySubmissionsAsync(string studentId)
    {
        var submissions = await _unitOfWork.Submissions.GetByStudentAsync(studentId);
        var result = new List<SubmissionDto>();
        foreach (var s in submissions)
            result.Add(MapToDto(s, s.Assignment.MaxMarks));

        return result;
    }

    public async Task<SubmissionDto> GradeAsync(int submissionId, string teacherId, GradeSubmissionDto dto)
    {
        var submission = await _unitOfWork.Submissions.GetWithDetailsAsync(submissionId)
            ?? throw new NotFoundException(nameof(Submission), submissionId);

        var assignment = await _unitOfWork.Assignments.GetByIdAsync(submission.AssignmentId)
            ?? throw new NotFoundException(nameof(Assignment), submission.AssignmentId);

        if (assignment.TeacherId != teacherId)
            throw new ForbiddenAccessException("You can only grade submissions for your own assignments.");

        if (dto.MarksObtained > assignment.MaxMarks)
            throw new BadRequestException($"Marks cannot exceed the maximum of {assignment.MaxMarks}.");

        submission.MarksObtained = dto.MarksObtained;
        submission.Feedback = dto.Feedback;
        submission.Status = SubmissionStatus.Graded;
        submission.GradedAtUtc = DateTime.UtcNow;

        _unitOfWork.Submissions.Update(submission);
        await _unitOfWork.SaveChangesAsync();

        return await ToDtoAsync(submissionId);
    }

    public async Task<SubmissionDto> ChangeStatusAsync(int submissionId, string teacherId, ChangeSubmissionStatusDto dto)
    {
        var submission = await _unitOfWork.Submissions.GetWithDetailsAsync(submissionId)
            ?? throw new NotFoundException(nameof(Submission), submissionId);

        var assignment = await _unitOfWork.Assignments.GetByIdAsync(submission.AssignmentId)
            ?? throw new NotFoundException(nameof(Assignment), submission.AssignmentId);

        if (assignment.TeacherId != teacherId)
            throw new ForbiddenAccessException("You can only manage submissions for your own assignments.");

        if (!Enum.TryParse<SubmissionStatus>(dto.Status, ignoreCase: true, out var newStatus))
            throw new BadRequestException($"Invalid status '{dto.Status}'.");

        submission.Status = newStatus;
        _unitOfWork.Submissions.Update(submission);
        await _unitOfWork.SaveChangesAsync();

        return await ToDtoAsync(submissionId);
    }

    private async Task EnsureCanViewAsync(Submission submission, string requesterId, string requesterRole)
    {
        if (requesterRole == AppRoles.Student && submission.StudentId != requesterId)
            throw new ForbiddenAccessException("You can only view your own submission.");

        if (requesterRole == AppRoles.Teacher)
        {
            var assignment = await _unitOfWork.Assignments.GetByIdAsync(submission.AssignmentId);
            if (assignment is null || assignment.TeacherId != requesterId)
                throw new ForbiddenAccessException("You can only view submissions for your own assignments.");
        }
    }

    private async Task<SubmissionDto> ToDtoAsync(int submissionId)
    {
        var submission = await _unitOfWork.Submissions.GetWithDetailsAsync(submissionId)
            ?? throw new NotFoundException(nameof(Submission), submissionId);

        var assignment = await _unitOfWork.Assignments.GetByIdAsync(submission.AssignmentId);
        return MapToDto(submission, assignment?.MaxMarks ?? 0);
    }

    private SubmissionDto MapToDto(Submission s, int maxMarks) => new()
    {
        Id = s.Id,
        AssignmentId = s.AssignmentId,
        AssignmentTitle = s.Assignment?.Title ?? string.Empty,
        StudentId = s.StudentId,
        StudentName = s.Student?.FullName ?? string.Empty,
        TextAnswer = s.TextAnswer,
        FileUrl = _fileService.BuildUrl(s.FilePath),
        OriginalFileName = s.OriginalFileName,
        SubmittedAtUtc = s.SubmittedAtUtc,
        LastUpdatedAtUtc = s.LastUpdatedAtUtc,
        Status = s.Status.ToString(),
        MarksObtained = s.MarksObtained,
        MaxMarks = maxMarks,
        Feedback = s.Feedback,
        GradedAtUtc = s.GradedAtUtc
    };
}
