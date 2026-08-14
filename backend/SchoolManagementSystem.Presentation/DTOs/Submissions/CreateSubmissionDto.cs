using Microsoft.AspNetCore.Http;

namespace SchoolManagementSystem.Presentation.DTOs.Submissions;

public class CreateSubmissionDto
{
    public string? TextAnswer { get; set; }
    public IFormFile? File { get; set; }
}
