namespace SchoolManagementSystem.Business.Settings;

public class FileStorageSettings
{
    public const string SectionName = "FileStorage";

    /// <summary>Sub-folder under wwwroot used to store assignment attachments uploaded by teachers.</summary>
    public string AssignmentsFolder { get; set; } = "assignments";

    /// <summary>Sub-folder under wwwroot used to store submission attachments uploaded by students.</summary>
    public string SubmissionsFolder { get; set; } = "submissions";

    /// <summary>Maximum allowed upload size, in bytes. Default 10 MB.</summary>
    public long MaxFileSizeBytes { get; set; } = 10 * 1024 * 1024;

    public string[] AllowedExtensions { get; set; } =
        { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".zip", ".rar", ".jpg", ".jpeg", ".png" };
}
