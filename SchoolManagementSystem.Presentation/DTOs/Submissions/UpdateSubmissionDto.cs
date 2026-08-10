using Microsoft.AspNetCore.Http;

namespace SchoolManagementSystem.Presentation.DTOs.Submissions;

public class UpdateSubmissionDto
{
    public string? TextAnswer { get; set; }
    public IFormFile? File { get; set; }
    public bool RemoveExistingFile { get; set; } = false;
}
