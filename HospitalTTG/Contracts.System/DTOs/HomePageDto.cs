using Contracts.Article.DTOs;
using Contracts.Doctor.DTOs;

namespace Contracts.System.DTOs;

public class HomePageDto
{
    public IReadOnlyList<HomePageSlideDto> HeroSlides { get; set; } = [];
    public IReadOnlyList<HomePageQuickActionDto> QuickActions { get; set; } = [];
    public IReadOnlyList<DepartmentDto> Departments { get; set; } = [];
    public HomePageSectionDto FeaturedServicesSection { get; set; } = new();
    public IReadOnlyList<ContentDto> FeaturedServices { get; set; } = [];
    public HomePageSectionDto FeaturedNewsSection { get; set; } = new();
    public IReadOnlyList<ContentDto> FeaturedNews { get; set; } = [];
    public IReadOnlyList<DoctorDto> FeaturedDoctors { get; set; } = [];
    public HomePageContactDto Contact { get; set; } = new();
}

public class HomePageSlideDto
{
    public string ImageUrl { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? LinkUrl { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public class HomePageSectionDto
{
    public string? Subtitle { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? ButtonText { get; set; }
    public string? ButtonUrl { get; set; }
}

public class HomePageQuickActionDto
{
    public string Key { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string? Url { get; set; }
    public string Kind { get; set; } = "link";
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public class HomePageContactDto
{
    public string? Hotline { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? WorkingHours { get; set; }
}
