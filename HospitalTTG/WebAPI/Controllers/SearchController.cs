using Contracts.Article.Interfaces;
using Contracts.Doctor.Interfaces;
using Contracts.Search.DTOs;
using Microsoft.AspNetCore.Mvc;
using Shared.Abstractions.Responses;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SearchController : ControllerBase
{
    private readonly IDoctorService _doctorService;
    private readonly IDepartmentService _departmentService;
    private readonly IContentService _contentService;

    public SearchController(
        IDoctorService doctorService,
        IDepartmentService departmentService,
        IContentService contentService)
    {
        _doctorService = doctorService;
        _departmentService = departmentService;
        _contentService = contentService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<SearchResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<SearchResponseDto>>> Search(
        [FromQuery] string q,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest(new { message = "Query parameter 'q' is required." });

        const int maxPageSize = 50;
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > maxPageSize) pageSize = maxPageSize;

        var (doctors, totalDoctors) = await _doctorService.SearchAsync(q, page, pageSize, ct);
        var (departments, totalDepartments) = await _departmentService.SearchAsync(q, page, pageSize, ct);
        var (articles, totalArticles) = await _contentService.SearchAsync(q, page, pageSize, ct);

        var doctorResults = doctors.Select(d => new SearchResultDto
        {
            Id = d.Id,
            Type = "doctor",
            Title = $"{d.AcademicTitle} {d.FullName}".Trim(),
            Subtitle = d.Specialty ?? d.Position,
            Thumbnail = d.AvatarUrl,
            Url = $"/doi-ngu-chuyen-gia/{d.Slug}",
        }).ToList();

        var departmentResults = departments.Select(d => new SearchResultDto
        {
            Id = d.Id,
            Type = "department",
            Title = d.Name,
            Subtitle = d.Description,
            Thumbnail = null,
            Url = $"/doi-ngu-chuyen-gia",
        }).ToList();

        var articleResults = articles.Select(a => new SearchResultDto
        {
            Id = a.Id,
            Type = "article",
            Title = a.Title,
            Subtitle = a.Intro,
            Thumbnail = a.Thumbnail,
            Url = $"/tin-tuc/{a.Slug}",
            PublishedAt = a.PublishedAt,
        }).ToList();

        var response = new SearchResponseDto
        {
            Doctors = doctorResults,
            Departments = departmentResults,
            Articles = articleResults,
            Query = q,
            Page = page,
            PageSize = pageSize,
            TotalDoctors = totalDoctors,
            TotalArticles = totalArticles,
            TotalDepartments = totalDepartments,
        };

        return Ok(new ApiResponse<SearchResponseDto>(response));
    }

    [HttpGet("suggest")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<SearchSuggestItemDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<SearchSuggestItemDto>>>> Suggest(
        [FromQuery] string q,
        [FromQuery] int limit = 5,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
            return Ok(new ApiResponse<IReadOnlyList<SearchSuggestItemDto>>([]));

        var doctors = await _doctorService.SearchAsync(q, limit, ct);
        var departments = await _departmentService.SearchAsync(q, limit, ct);
        var articles = await _contentService.SearchAsync(q, limit, ct);

        var suggestions = new List<SearchSuggestItemDto>();

        foreach (var d in doctors)
            suggestions.Add(new SearchSuggestItemDto
            {
                Text = $"{d.AcademicTitle} {d.FullName}".Trim(),
                Type = "Bác sĩ",
                Url = $"/doi-ngu-chuyen-gia/{d.Slug}",
            });

        foreach (var a in articles)
            suggestions.Add(new SearchSuggestItemDto
            {
                Text = a.Title,
                Type = "Tin tức",
                Url = $"/tin-tuc/{a.Slug}",
            });

        foreach (var d in departments)
            suggestions.Add(new SearchSuggestItemDto
            {
                Text = d.Name,
                Type = "Khoa",
                Url = $"/doi-ngu-chuyen-gia",
            });

        return Ok(new ApiResponse<IReadOnlyList<SearchSuggestItemDto>>(suggestions.Take(limit * 2).ToList()));
    }
}
