using System.Text.Json;
using Contracts.Article.Interfaces;
using Contracts.Doctor.Interfaces;
using Contracts.System.DTOs;
using Contracts.System.Interfaces;

namespace Modules.System.Services;

internal sealed class HomePageService : IHomePageService
{
    private const string DefaultBannerImage = "/images/banner/Ngoai.png";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly ISiteSettingService _siteSettingService;
    private readonly IContentService _contentService;
    private readonly IDepartmentService _departmentService;
    private readonly IDoctorService _doctorService;

    public HomePageService(
        ISiteSettingService siteSettingService,
        IContentService contentService,
        IDepartmentService departmentService,
        IDoctorService doctorService)
    {
        _siteSettingService = siteSettingService;
        _contentService = contentService;
        _departmentService = departmentService;
        _doctorService = doctorService;
    }

    public async Task<HomePageDto> GetAsync(CancellationToken ct = default)
    {
        var settingsTask = _siteSettingService.GetAllAsync(ct);
        var departmentsTask = _departmentService.GetAllAsync(true, ct);
        var doctorsTask = _doctorService.GetFeaturedAsync(8, ct);
        var newsTask = _contentService.GetHotAsync(1, 4, ct);
        var servicesTask = _contentService.GetPagedAsync("service", null, 1, 1, 2, ct);

        await Task.WhenAll(settingsTask, departmentsTask, doctorsTask, newsTask, servicesTask);

        var settings = settingsTask.Result.ToDictionary(x => x.Key, x => x.Value ?? string.Empty);
        var departments = departmentsTask.Result
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Name)
            .Take(5)
            .ToList();

        return new HomePageDto
        {
            HeroSlides = ResolveSlides(settings),
            QuickActions = ResolveQuickActions(settings),
            Departments = departments,
            FeaturedServicesSection = new HomePageSectionDto
            {
                Subtitle = GetSetting(settings, "homepage_featured_services_subtitle") ?? "ĐƠN VỊ",
                Title = GetSetting(settings, "homepage_featured_services_title") ?? "Dịch vụ y khoa",
                Description = GetSetting(settings, "homepage_featured_services_description") ?? "Chăm sóc sức khỏe toàn diện cho gia đình bạn",
                ButtonText = GetSetting(settings, "homepage_featured_services_button_text") ?? "Xem tất cả",
                ButtonUrl = GetSetting(settings, "homepage_featured_services_button_url") ?? "/tin-tuc?type=service"
            },
            FeaturedServices = servicesTask.Result.Data ?? [],
            FeaturedNewsSection = new HomePageSectionDto
            {
                Subtitle = GetSetting(settings, "homepage_featured_news_subtitle") ?? "TIN TỨC",
                Title = GetSetting(settings, "homepage_featured_news_title") ?? "Tin tức nổi bật",
                Description = GetSetting(settings, "homepage_featured_news_description") ?? "Cập nhật thông tin y tế và hoạt động mới nhất của bệnh viện",
                ButtonText = GetSetting(settings, "homepage_featured_news_button_text") ?? "Xem tất cả",
                ButtonUrl = GetSetting(settings, "homepage_featured_news_button_url") ?? "/tin-tuc"
            },
            FeaturedNews = newsTask.Result.Data ?? [],
            FeaturedDoctors = doctorsTask.Result,
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

    private static string? GetSetting(IReadOnlyDictionary<string, string> settings, string key)
    {
        return settings.TryGetValue(key, out var value) && !string.IsNullOrWhiteSpace(value)
            ? value
            : null;
    }
}
