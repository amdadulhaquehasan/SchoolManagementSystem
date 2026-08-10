using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using SchoolManagementSystem.Business.Interfaces;
using SchoolManagementSystem.Business.Settings;
using SchoolManagementSystem.DataAccess.Exceptions;

namespace SchoolManagementSystem.Business.Services;

public class FileService : IFileService
{
    private readonly IWebHostEnvironment _env;
    private readonly FileStorageSettings _settings;

    public FileService(IWebHostEnvironment env, IOptions<FileStorageSettings> settings)
    {
        _env = env;
        _settings = settings.Value;
    }

    public Task<SavedFile> SaveAssignmentFileAsync(IFormFile file) => SaveAsync(file, _settings.AssignmentsFolder);

    public Task<SavedFile> SaveSubmissionFileAsync(IFormFile file) => SaveAsync(file, _settings.SubmissionsFolder);

    private async Task<SavedFile> SaveAsync(IFormFile file, string folder)
    {
        if (file.Length == 0)
            throw new BadRequestException("The uploaded file is empty.");

        if (file.Length > _settings.MaxFileSizeBytes)
            throw new BadRequestException($"File exceeds the maximum allowed size of {_settings.MaxFileSizeBytes / (1024 * 1024)} MB.");

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_settings.AllowedExtensions.Contains(extension))
            throw new BadRequestException($"File extension '{extension}' is not allowed.");

        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var folderPath = Path.Combine(webRoot, folder);
        Directory.CreateDirectory(folderPath);

        var storedFileName = $"{Guid.NewGuid():N}{extension}";
        var fullPath = Path.Combine(folderPath, storedFileName);

        await using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return new SavedFile
        {
            RelativePath = $"{folder}/{storedFileName}",
            OriginalFileName = file.FileName
        };
    }

    public void DeleteFile(string? relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath)) return;

        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var fullPath = Path.Combine(webRoot, relativePath.Replace('/', Path.DirectorySeparatorChar));

        if (File.Exists(fullPath))
            File.Delete(fullPath);
    }

    public string? BuildUrl(string? relativePath) =>
        string.IsNullOrWhiteSpace(relativePath) ? null : $"/{relativePath.TrimStart('/')}";
}
