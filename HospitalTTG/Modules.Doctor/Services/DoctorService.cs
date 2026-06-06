using Contracts.Doctor.DTOs;
using Contracts.Doctor.Interfaces;
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
