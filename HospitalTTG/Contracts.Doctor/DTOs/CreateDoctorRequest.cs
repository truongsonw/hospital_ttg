namespace Contracts.Doctor.DTOs;

public class CreateDoctorRequest
{
    public string FullName { get; set; } = string.Empty;
    public string? AcademicTitle { get; set; }
    public string? Position { get; set; }
    public Guid? DepartmentId { get; set; }
    public string? Specialty { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public bool IsManagement { get; set; } = false;
    public int ManagementOrder { get; set; } = 0;
}
