using System.Text.Json;
using Contracts.Article.Interfaces;
using Contracts.Doctor.Interfaces;
using Contracts.System.DTOs;
using Contracts.System.Interfaces;

namespace Modules.System.Services;

internal sealed class HomePageService : IHomePageService
{
    private const string DefaultBannerImage = "/images/banner/Ngoai.png";
    private const int DefaultSectionLimit = 4;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly ISiteSettingService _siteSettingService;
    private readonly IContentService _contentService;
    private readonly ICategoryService _categoryService;
    private readonly IDepartmentService _departmentService;
    private readonly IDoctorService _doctorService;

    public HomePageService(
        ISiteSettingService siteSettingService,
        IContentService contentService,
        ICategoryService categoryService,
        IDepartmentService departmentService,
        IDoctorService doctorService)
    {
        _siteSettingService = siteSettingService;
        _contentService = contentService;
        _categoryService = categoryService;
        _departmentService = departmentService;
        _doctorService = doctorService;
    }

    public async Task<HomePageDto> GetAsync(CancellationToken ct = default)
    {
        var settingsResult = await _siteSettingService.GetAllAsync(ct);
        var settings = settingsResult.ToDictionary(x => x.Key, x => x.Value ?? string.Empty);

        var departmentsLimit = ReadInt(settings, "homepage_departments_limit", 5);
        var doctorsLimit = ReadInt(settings, "homepage_doctors_limit", 8);
        var defaultSectionLimit = ReadInt(settings, "homepage_section_default_limit", DefaultSectionLimit);

        var departments = await _departmentService.GetHomepageFeaturedAsync(departmentsLimit, ct);
        var doctors = await _doctorService.GetHomepageFeaturedAsync(doctorsLimit, ct);

        var featuredCategories = await _categoryService.GetHomepageFeaturedAsync(null, ct);
        var contentSections = new List<HomePageContentSectionDto>();

        foreach (var cat in featuredCategories.OrderBy(c => c.SortOrder).ThenBy(c => c.Name))
        {
            var limit = cat.HomepageLimit is > 0 ? cat.HomepageLimit.Value : defaultSectionLimit;
            var contents = await _contentService.GetForHomepageCategoryAsync(cat.Id, limit, ct);

            contentSections.Add(new HomePageContentSectionDto
            {
                CategoryId = cat.Id,
                CategorySlug = cat.Slug,
                CategoryType = cat.Type,
                Subtitle = !string.IsNullOrWhiteSpace(cat.HomepageSubtitle)
                    ? cat.HomepageSubtitle
                    : cat.Type.ToUpperInvariant(),
                Title = cat.Name,
                Description = cat.HomepageDescription,
                ButtonText = !string.IsNullOrWhiteSpace(cat.HomepageButtonText) ? cat.HomepageButtonText : "Xem tất cả",
                ButtonUrl = !string.IsNullOrWhiteSpace(cat.HomepageButtonUrl)
                    ? cat.HomepageButtonUrl
                    : $"/tin-tuc?type={cat.Type}&categoryId={cat.Id}",
                SortOrder = cat.SortOrder,
                Contents = contents
            });
        }

        return new HomePageDto
        {
            HeroSlides = ResolveSlides(settings),
            QuickActions = ResolveQuickActions(settings),
            DepartmentsSection = new HomePageSectionDto
            {
                Subtitle = GetSetting(settings, "homepage_departments_section_subtitle") ?? "ĐƠN VỊ",
                Title = GetSetting(settings, "homepage_departments_section_title") ?? "Chuyên khoa",
                Description = GetSetting(settings, "homepage_departments_section_description") ?? "Chăm sóc sức khỏe toàn diện cho gia đình bạn",
                ButtonText = GetSetting(settings, "homepage_departments_section_button_text") ?? "Xem tất cả",
                ButtonUrl = GetSetting(settings, "homepage_departments_section_button_url") ?? "/doi-ngu-chuyen-gia"
            },
            Departments = departments,
            DepartmentsImages = ReadJsonSetting<List<string>>(settings, "homepage_departments_images_json") ?? [],
            ContentSections = contentSections,
            FeaturedDoctorsSection = new HomePageSectionDto
            {
                Subtitle = GetSetting(settings, "homepage_doctors_section_subtitle") ?? "BÁC SĨ",
                Title = GetSetting(settings, "homepage_doctors_section_title") ?? "Đội ngũ chuyên gia",
                Description = GetSetting(settings, "homepage_doctors_section_description") ?? "Hơn 1.000 bác sĩ và hơn 4.300 nhân viên y tế tận tâm phục vụ.",
                ButtonText = GetSetting(settings, "homepage_doctors_section_button_text") ?? "Tìm bác sĩ",
                ButtonUrl = GetSetting(settings, "homepage_doctors_section_button_url") ?? "/doi-ngu-chuyen-gia"
            },
            FeaturedDoctors = doctors,
            Contact = new HomePageContactDto
            {
                Hotline = GetSetting(settings, "hotline"),
                Phone = GetSetting(settings, "phone"),
                Email = GetSetting(settings, "email"),
                Address = GetSetting(settings, "address"),
                WorkingHours = GetSetting(settings, "working_hours")
            }
        };
    }

    private static IReadOnlyList<HomePageSlideDto> ResolveSlides(IReadOnlyDictionary<string, string> settings)
    {
        var slides = ReadJsonSetting<List<HomePageSlideDto>>(settings, "homepage_slides_json") ?? [];
        slides = slides
            .Where(x => x.IsActive && !string.IsNullOrWhiteSpace(x.ImageUrl))
            .OrderBy(x => x.SortOrder)
            .ToList();

        return slides.Count > 0
            ? slides
            : [
                new HomePageSlideDto
                {
                    ImageUrl = DefaultBannerImage,
                    AltText = "Bệnh viện TTG",
                    SortOrder = 1,
                    IsActive = true
                }
            ];
    }

    private static IReadOnlyList<HomePageQuickActionDto> ResolveQuickActions(IReadOnlyDictionary<string, string> settings)
    {
        var actions = ReadJsonSetting<List<HomePageQuickActionDto>>(settings, "homepage_quick_actions_json") ?? [];
        actions = actions
            .Where(x => x.IsActive && !string.IsNullOrWhiteSpace(x.Title))
            .OrderBy(x => x.SortOrder)
            .ToList();

        if (actions.Count > 0)
        {
            return actions;
        }

        var hotline = GetSetting(settings, "hotline") ?? "1900.888.866";
        var tel = new string(hotline.Where(char.IsDigit).ToArray());

        return [
            new HomePageQuickActionDto
            {
                Key = "hotline",
                Title = "Gọi tổng đài",
                Description = $"Đặt lịch khám nhanh qua tổng đài {hotline}",
                Icon = "phone",
                Url = string.IsNullOrWhiteSpace(tel) ? null : $"tel:{tel}",
                Kind = "link",
                SortOrder = 1
            },
            new HomePageQuickActionDto
            {
                Key = "booking",
                Title = "Đặt lịch khám",
                Description = "Đặt lịch khám online tại website",
                Icon = "calendar",
                Kind = "booking",
                SortOrder = 2
            },
            new HomePageQuickActionDto
            {
                Key = "lab-result",
                Title = "Kết quả xét nghiệm",
                Description = "Tra cứu kết quả xét nghiệm của bạn",
                Icon = "clipboard-list",
                Url = "#ket-qua-xet-nghiem",
                Kind = "link",
                SortOrder = 3
            }
        ];
    }

    private static T? ReadJsonSetting<T>(IReadOnlyDictionary<string, string> settings, string key)
    {
        var value = GetSetting(settings, key);
        if (string.IsNullOrWhiteSpace(value))
        {
            return default;
        }

        try
        {
            return JsonSerializer.Deserialize<T>(value, JsonOptions);
        }
        catch (JsonException)
        {
            return default;
        }
    }

    private static int ReadInt(IReadOnlyDictionary<string, string> settings, string key, int fallback)
    {
        var value = GetSetting(settings, key);
        return int.TryParse(value, out var parsed) && parsed > 0 ? parsed : fallback;
    }

    private static string? GetSetting(IReadOnlyDictionary<string, string> settings, string key)
    {
        return settings.TryGetValue(key, out var value) && !string.IsNullOrWhiteSpace(value)
            ? value
            : null;
    }
}
