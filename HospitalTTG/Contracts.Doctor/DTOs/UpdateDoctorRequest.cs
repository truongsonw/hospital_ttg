namespace Contracts.Doctor.DTOs;

public class UpdateDoctorRequest
{
    public string FullName { get; set; } = string.Empty;
    public string? AcademicTitle { get; set; }
    public string? Position { get; set; }
    public Guid? DepartmentId { get; set; }
    public string? Specialty { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public bool IsManagement { get; set; }
    public int ManagementOrder { get; set; }
}
