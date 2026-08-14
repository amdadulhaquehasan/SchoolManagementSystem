using Microsoft.AspNetCore.Http;

namespace SchoolManagementSystem.Business.Interfaces;

public class SavedFile
{
    public string RelativePath { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
}

public interface IFileService
{
    Task<SavedFile> SaveAssignmentFileAsync(IFormFile file);
    Task<SavedFile> SaveSubmissionFileAsync(IFormFile file);
    void DeleteFile(string? relativePath);
    string? BuildUrl(string? relativePath);
}
