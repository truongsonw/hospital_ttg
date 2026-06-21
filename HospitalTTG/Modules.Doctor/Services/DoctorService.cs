using Contracts.Doctor.DTOs;
using Contracts.Doctor.Interfaces;
using Microsoft.AspNetCore.Http;
using Modules.Doctor.Repositories;
using Shared.Abstractions.Exceptions;
using Shared.Abstractions.Interfaces;
using Shared.Abstractions.Responses;

namespace Modules.Doctor.Services;

public class DoctorService : IDoctorService
{
    private readonly IDoctorRepository _repo;
    private readonly IDepartmentRepository _deptRepo;
    private readonly IUnitOfWork _uow;

    public DoctorService(IDoctorRepository repo, IDepartmentRepository deptRepo, IUnitOfWork uow)
    {
        _repo = repo;
        _deptRepo = deptRepo;
        _uow = uow;
    }

    public async Task<PagedResponse<IReadOnlyList<DoctorDto>>> GetPagedAsync(
        Guid? departmentId, Guid? groupId, string? search, int page, int pageSize, CancellationToken ct = default)
    {
        IReadOnlyList<Guid>? deptIds = null;

        if (groupId.HasValue)
        {
            var children = await _deptRepo.GetChildrenAsync(groupId.Value, ct);
            deptIds = children.Select(d => d.Id).ToList();
        }
        else if (departmentId.HasValue)
        {
            deptIds = [departmentId.Value];
        }

        var (items, total) = await _repo.GetPagedAsync(deptIds, search, page, pageSize, ct);
        var deptMap = await BuildDeptMapAsync(ct);
        var dtos = items.Select(d => MapToDto(d, deptMap)).ToList();
        return new PagedResponse<IReadOnlyList<DoctorDto>>(dtos, page, pageSize, total);
    }

    public async Task<PagedResponse<IReadOnlyList<DoctorDto>>> GetPagedByDepartmentSlugAsync(
        string departmentSlug, string? search, int page, int pageSize, CancellationToken ct = default)
    {
        var dept = await _deptRepo.GetBySlugAsync(departmentSlug, ct);
        var deptId = dept?.Id;
        var (items, total) = await _repo.GetPagedAsync(
            deptId.HasValue ? [deptId.Value] : null, search, page, pageSize, ct);
        var deptMap = await BuildDeptMapAsync(ct);
        var dtos = items.Select(d => MapToDto(d, deptMap)).ToList();
        return new PagedResponse<IReadOnlyList<DoctorDto>>(dtos, page, pageSize, total);
    }

    public async Task<PagedResponse<IReadOnlyList<DoctorDto>>> GetPagedByGroupSlugAsync(
        string groupSlug, string? search, int page, int pageSize, CancellationToken ct = default)
    {
        var childIds = await _deptRepo.GetChildrenIdsByGroupSlugAsync(groupSlug, ct);
        var (items, total) = await _repo.GetPagedAsync(childIds, search, page, pageSize, ct);
        var deptMap = await BuildDeptMapAsync(ct);
        var dtos = items.Select(d => MapToDto(d, deptMap)).ToList();
        return new PagedResponse<IReadOnlyList<DoctorDto>>(dtos, page, pageSize, total);
    }

    public async Task<IReadOnlyList<DoctorDto>> GetFeaturedAsync(int limit = 4, CancellationToken ct = default)
    {
        var items = await _repo.GetFeaturedAsync(limit, ct);
        var deptMap = await BuildDeptMapAsync(ct);
        return items.Select(d => MapToDto(d, deptMap)).ToList();
    }

    public async Task<IReadOnlyList<DoctorDto>> GetHomepageFeaturedAsync(int limit, CancellationToken ct = default)
    {
        var items = await _repo.GetHomepageFeaturedAsync(limit, ct);
        var deptMap = await BuildDeptMapAsync(ct);
        return items.Select(d => MapToDto(d, deptMap)).ToList();
    }

    public async Task<IReadOnlyList<DoctorDto>> GetManagementAsync(CancellationToken ct = default)
    {
        var items = await _repo.GetManagementAsync(ct);
        var deptMap = await BuildDeptMapAsync(ct);
        return items.Select(d => MapToDto(d, deptMap)).ToList();
    }

    public async Task<DoctorDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var doctor = await _repo.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Entities.Doctor), id);

        string? deptName = null;
        if (doctor.DepartmentId.HasValue)
            deptName = (await _deptRepo.GetByIdAsync(doctor.DepartmentId.Value, ct))?.Name;

        return MapToDto(doctor, null, deptName);
    }

    public async Task<DoctorDto?> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        var doctor = await _repo.GetBySlugAsync(slug, ct);
        if (doctor == null) return null;

        string? deptName = null;
        if (doctor.DepartmentId.HasValue)
            deptName = (await _deptRepo.GetByIdAsync(doctor.DepartmentId.Value, ct))?.Name;

        return MapToDto(doctor, null, deptName);
    }

    public async Task<DoctorDto> CreateAsync(CreateDoctorRequest request, CancellationToken ct = default)
    {
        var slug = string.IsNullOrWhiteSpace(request.Slug)
            ? GenerateSlug(request.FullName)
            : request.Slug;
        var doctor = new Entities.Doctor
        {
            FullName = request.FullName,
            AcademicTitle = request.AcademicTitle,
            Position = request.Position,
            DepartmentId = request.DepartmentId,
            Specialty = request.Specialty,
            AvatarUrl = request.AvatarUrl,
            Bio = request.Bio,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive,
            IsManagement = request.IsManagement,
            ManagementOrder = request.ManagementOrder,
            IsHomepageFeatured = request.IsHomepageFeatured,
            Slug = slug,
        };
        await _repo.AddAsync(doctor, ct);
        await _uow.SaveChangesAsync(ct);
        return await GetByIdAsync(doctor.Id, ct);
    }

    public async Task<DoctorDto> UpdateAsync(Guid id, UpdateDoctorRequest request, CancellationToken ct = default)
    {
        var doctor = await _repo.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Entities.Doctor), id);

        doctor.FullName = request.FullName;
        doctor.AcademicTitle = request.AcademicTitle;
        doctor.Position = request.Position;
        doctor.DepartmentId = request.DepartmentId;
        doctor.Specialty = request.Specialty;
        doctor.AvatarUrl = request.AvatarUrl;
        doctor.Bio = request.Bio;
        doctor.SortOrder = request.SortOrder;
        doctor.IsActive = request.IsActive;
        doctor.IsManagement = request.IsManagement;
        doctor.ManagementOrder = request.ManagementOrder;
        doctor.IsHomepageFeatured = request.IsHomepageFeatured;
        doctor.Slug = string.IsNullOrWhiteSpace(request.Slug) ? doctor.Slug : request.Slug;

        _repo.Update(doctor);
        await _uow.SaveChangesAsync(ct);
        return await GetByIdAsync(doctor.Id, ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var doctor = await _repo.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(Entities.Doctor), id);
        _repo.Delete(doctor);
        await _uow.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<DoctorDto>> SearchAsync(string search, int limit, CancellationToken ct = default)
    {
        var items = await _repo.SearchAsync(search, limit, ct);
        var deptMap = await BuildDeptMapAsync(ct);
        return items.Select(d => MapToDto(d, deptMap)).ToList();
    }

    public async Task<(IReadOnlyList<DoctorDto> Items, int Total)> SearchAsync(string search, int page, int pageSize, CancellationToken ct = default)
    {
        var (items, total) = await _repo.SearchAsync(search, page, pageSize, ct);
        var deptMap = await BuildDeptMapAsync(ct);
        return (items.Select(d => MapToDto(d, deptMap)).ToList(), total);
    }

    public async Task<DoctorImportResultDto> ImportAsync(IFormFile file, CancellationToken ct = default)
    {
        var result = new DoctorImportResultDto();
        var departments = await _deptRepo.GetAllAsync(null, ct);
        var deptByName = departments.ToDictionary(d => d.Name.Trim(), d => d.Id, StringComparer.OrdinalIgnoreCase);

        using var stream = file.OpenReadStream();
        using var workbook = new ClosedXML.Excel.XLWorkbook(stream);
        var worksheet = workbook.Worksheet(1);
        var rows = worksheet.RangeUsed()?.RowsUsed().Skip(1) ?? [];

        foreach (var row in rows)
        {
            result.TotalRows++;
            var rowNumber = result.TotalRows + 1;

            try
            {
                var fullName = row.Cell(1).GetString().Trim();
                if (string.IsNullOrWhiteSpace(fullName))
                {
                    result.Errors.Add(new DoctorImportErrorDto
                    {
                        RowNumber = rowNumber,
                        FullName = "",
                        ErrorMessage = "Họ tên không được để trống"
                    });
                    result.FailedCount++;
                    continue;
                }

                var departmentName = row.Cell(4).GetString().Trim();
                Guid? departmentId = null;
                if (!string.IsNullOrEmpty(departmentName))
                {
                    if (deptByName.TryGetValue(departmentName, out var deptId))
                        departmentId = deptId;
                }

                var isActiveStr = row.Cell(8).GetString().Trim();
                var isActive = isActiveStr.Equals("Có", StringComparison.OrdinalIgnoreCase) || isActiveStr == "1" || isActiveStr.Equals("true", StringComparison.OrdinalIgnoreCase) || isActiveStr.Equals("yes", StringComparison.OrdinalIgnoreCase);

                var isManagementStr = row.Cell(10).GetString().Trim();
                var isManagement = isManagementStr.Equals("Có", StringComparison.OrdinalIgnoreCase) || isManagementStr == "1" || isManagementStr.Equals("true", StringComparison.OrdinalIgnoreCase) || isManagementStr.Equals("yes", StringComparison.OrdinalIgnoreCase);

                var isHomepageFeaturedStr = row.Cell(12).GetString().Trim();
                var isHomepageFeatured = isHomepageFeaturedStr.Equals("Có", StringComparison.OrdinalIgnoreCase) || isHomepageFeaturedStr == "1" || isHomepageFeaturedStr.Equals("true", StringComparison.OrdinalIgnoreCase) || isHomepageFeaturedStr.Equals("yes", StringComparison.OrdinalIgnoreCase);

                var sortOrderStr = row.Cell(7).GetString().Trim();
                var sortOrder = int.TryParse(sortOrderStr, out var so) ? so : 0;

                var managementOrderStr = row.Cell(11).GetString().Trim();
                var managementOrder = int.TryParse(managementOrderStr, out var mo) ? mo : 0;

                var doctor = new Entities.Doctor
                {
                    FullName = fullName,
                    AcademicTitle = string.IsNullOrWhiteSpace(row.Cell(2).GetString()) ? null : row.Cell(2).GetString().Trim(),
                    Position = string.IsNullOrWhiteSpace(row.Cell(3).GetString()) ? null : row.Cell(3).GetString().Trim(),
                    DepartmentId = departmentId,
                    Specialty = string.IsNullOrWhiteSpace(row.Cell(5).GetString()) ? null : row.Cell(5).GetString().Trim(),
                    Bio = string.IsNullOrWhiteSpace(row.Cell(6).GetString()) ? null : row.Cell(6).GetString().Trim(),
                    SortOrder = sortOrder,
                    IsActive = isActive,
                    IsManagement = isManagement,
                    ManagementOrder = managementOrder,
                    IsHomepageFeatured = isHomepageFeatured,
                    Slug = GenerateSlug(fullName),
                };

                await _repo.AddAsync(doctor, ct);
                result.SuccessCount++;
            }
            catch (Exception ex)
            {
                result.Errors.Add(new DoctorImportErrorDto
                {
                    RowNumber = rowNumber,
                    FullName = row.Cell(1).GetString(),
                    ErrorMessage = ex.Message
                });
                result.FailedCount++;
            }
        }

        if (result.SuccessCount > 0)
            await _uow.SaveChangesAsync(ct);

        return result;
    }

    public async Task<byte[]> ExportAsync(CancellationToken ct = default)
    {
        var doctors = await _repo.GetAllAsync(ct);
        var departments = await _deptRepo.GetAllAsync(null, ct);
        var deptMap = departments.ToDictionary(d => d.Id, d => d.Name);

        using var workbook = new ClosedXML.Excel.XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Danh sach bac si");

        var headers = new[] { "Họ tên", "Học hàm/Học vị", "Chức vụ", "Khoa", "Chuyên khoa", "Giới thiệu", "Thứ tự", "Trạng thái", "Ngày tạo", "Ban lãnh đạo", "Thứ tự BLĐ", "Hiển thị trang chủ" };
        for (var i = 0; i < headers.Length; i++)
        {
            worksheet.Cell(1, i + 1).Value = headers[i];
            worksheet.Cell(1, i + 1).Style.Font.Bold = true;
            worksheet.Cell(1, i + 1).Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.LightGray;
        }

        var rowIndex = 2;
        foreach (var doctor in doctors)
        {
            worksheet.Cell(rowIndex, 1).Value = doctor.FullName;
            worksheet.Cell(rowIndex, 2).Value = doctor.AcademicTitle ?? "";
            worksheet.Cell(rowIndex, 3).Value = doctor.Position ?? "";
            worksheet.Cell(rowIndex, 4).Value = doctor.DepartmentId.HasValue && deptMap.TryGetValue(doctor.DepartmentId.Value, out var deptName) ? deptName : "";
            worksheet.Cell(rowIndex, 5).Value = doctor.Specialty ?? "";
            worksheet.Cell(rowIndex, 6).Value = doctor.Bio ?? "";
            worksheet.Cell(rowIndex, 7).Value = doctor.SortOrder;
            worksheet.Cell(rowIndex, 8).Value = doctor.IsActive ? "Có" : "Không";
            worksheet.Cell(rowIndex, 9).Value = doctor.CreatedAt.ToString("yyyy-MM-dd HH:mm");
            worksheet.Cell(rowIndex, 10).Value = doctor.IsManagement ? "Có" : "Không";
            worksheet.Cell(rowIndex, 11).Value = doctor.ManagementOrder;
            worksheet.Cell(rowIndex, 12).Value = doctor.IsHomepageFeatured ? "Có" : "Không";
            rowIndex++;
        }

        worksheet.Columns().AdjustToContents();
        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return ms.ToArray();
    }

    public async Task<byte[]> GenerateTemplateAsync(CancellationToken ct = default)
    {
        var departments = await _deptRepo.GetAllAsync(null, ct);

        using var workbook = new ClosedXML.Excel.XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Danh sach bac si");

        // Headers
        var headers = new[] { "Họ tên *", "Học hàm/Học vị", "Chức vụ", "Khoa", "Chuyên khoa", "Giới thiệu", "Thứ tự", "Trạng thái (Có/Không)", "Ban lãnh đạo (Có/Không)", "Thứ tự BLĐ", "Hiển thị trang chủ (Có/Không)" };
        for (var i = 0; i < headers.Length; i++)
        {
            worksheet.Cell(1, i + 1).Value = headers[i];
            worksheet.Cell(1, i + 1).Style.Font.Bold = true;
            worksheet.Cell(1, i + 1).Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.LightGray;
            worksheet.Cell(1, i + 1).Style.Alignment.WrapText = true;
        }

        // Sample data row
        worksheet.Cell(2, 1).Value = "Nguyễn Văn A";
        worksheet.Cell(2, 2).Value = "PGS.TS.";
        worksheet.Cell(2, 3).Value = "Trưởng khoa";
        worksheet.Cell(2, 4).Value = departments.FirstOrDefault()?.Name ?? "Khoa Nội tổng hợp";
        worksheet.Cell(2, 5).Value = "Nội khoa";
        worksheet.Cell(2, 6).Value = "Bác sĩ chuyên ngành nội khoa với hơn 10 năm kinh nghiệm.";
        worksheet.Cell(2, 7).Value = 1;
        worksheet.Cell(2, 8).Value = "Có";
        worksheet.Cell(2, 9).Value = "Không";
        worksheet.Cell(2, 10).Value = 0;
        worksheet.Cell(2, 11).Value = "Không";

        // Department list sheet
        var deptSheet = workbook.Worksheets.Add("Danh sach khoa");
        var deptHeaders = new[] { "Tên khoa" };
        for (var i = 0; i < deptHeaders.Length; i++)
        {
            deptSheet.Cell(1, i + 1).Value = deptHeaders[i];
            deptSheet.Cell(1, i + 1).Style.Font.Bold = true;
            deptSheet.Cell(1, i + 1).Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.LightGray;
        }
        var rowIdx = 2;
        foreach (var dept in departments)
        {
            deptSheet.Cell(rowIdx, 1).Value = dept.Name;
            rowIdx++;
        }
        deptSheet.Column(1).AdjustToContents();

        // Format main sheet
        worksheet.Column(1).Width = 20;
        worksheet.Column(4).Width = 25;
        worksheet.Column(6).Width = 40;
        worksheet.Columns().AdjustToContents();

        // Add note
        worksheet.Cell(4, 1).Value = "Ghi chú: Các cột đánh dấu (*) là bắt buộc. Cột 'Khoa' phải khớp chính xác với tên khoa trong sheet 'Danh sach khoa'.";
        worksheet.Range(4, 1, 4, headers.Length).Style.Font.Italic = true;
        worksheet.Range(4, 1, 4, headers.Length).Style.Font.FontSize = 10;

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return ms.ToArray();
    }

    private async Task<Dictionary<Guid, string>> BuildDeptMapAsync(CancellationToken ct)
    {
        var depts = await _deptRepo.GetAllAsync(null, ct);
        return depts.ToDictionary(d => d.Id, d => d.Name);
    }

    private static DoctorDto MapToDto(Entities.Doctor d, Dictionary<Guid, string>? deptMap, string? deptName = null) => new()
    {
        Id = d.Id,
        FullName = d.FullName,
        AcademicTitle = d.AcademicTitle,
        Position = d.Position,
        DepartmentId = d.DepartmentId,
        DepartmentName = deptName ?? (d.DepartmentId.HasValue && deptMap != null
            ? deptMap.GetValueOrDefault(d.DepartmentId.Value)
            : null),
        Specialty = d.Specialty,
        AvatarUrl = d.AvatarUrl,
        Bio = d.Bio,
        SortOrder = d.SortOrder,
        IsActive = d.IsActive,
        IsManagement = d.IsManagement,
        ManagementOrder = d.ManagementOrder,
        IsHomepageFeatured = d.IsHomepageFeatured,
        CreatedAt = d.CreatedAt,
        Slug = d.Slug,
    };

    private static string GenerateSlug(string name)
    {
        var slug = name.ToLowerInvariant();
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[àáạảãâầấậẩẫăằắặẳẵ]", "a");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[èéẹẻẽêềếệểễ]", "e");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[ìíịỉĩ]", "i");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[òóọỏõôồốộổỗơờớợởỡ]", "o");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[ùúụủũưừứựửữ]", "u");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[ỳýỵỷỹ]", "y");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[đ]", "d");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"\s+", "-");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"-+", "-");
        return slug.Trim('-');
    }
}
