namespace Contracts.Doctor.DTOs;

public class DoctorImportDto
{
    public string FullName { get; set; } = string.Empty;
    public string? AcademicTitle { get; set; }
    public string? Position { get; set; }
    public string? DepartmentName { get; set; }
    public string? Specialty { get; set; }
    public string? Bio { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsManagement { get; set; } = false;
    public int ManagementOrder { get; set; } = 0;
    public bool IsHomepageFeatured { get; set; } = false;
}

public class DoctorImportResultDto
{
    public int TotalRows { get; set; }
    public int SuccessCount { get; set; }
    public int FailedCount { get; set; }
    public List<DoctorImportErrorDto> Errors { get; set; } = [];
}

public class DoctorImportErrorDto
{
    public int RowNumber { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string ErrorMessage { get; set; } = string.Empty;
}

public class DoctorExportDto
{
    public string FullName { get; set; } = string.Empty;
    public string? AcademicTitle { get; set; }
    public string? Position { get; set; }
    public string? DepartmentName { get; set; }
    public string? Specialty { get; set; }
    public string? Bio { get; set; }
    public int SortOrder { get; set; }
    public string IsActive { get; set; } = "Có";
    public string IsManagement { get; set; } = "Không";
    public int ManagementOrder { get; set; }
    public string IsHomepageFeatured { get; set; } = "Không";
}
