-- ============================================================
-- 2026-05-04: Homepage public data settings
--   Seed SiteSettings rows used by GET /api/homepage.
--
-- Idempotent and additive. No schema changes, no FK constraints.
-- ============================================================

SET NOCOUNT ON;

IF OBJECT_ID(N'dbo.SiteSettings', N'U') IS NOT NULL
BEGIN
    DECLARE @now DATETIME2 = SYSUTCDATETIME();
    DECLARE @sys NVARCHAR(100) = N'system';

    IF NOT EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_slides_json')
        INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
        VALUES (
            NEWID(),
            N'homepage_slides_json',
            N'[
  {
    "imageUrl": "/images/banner/Ngoai.png",
    "altText": "Bệnh viện TTG",
    "title": null,
    "description": null,
    "linkUrl": null,
    "sortOrder": 1,
    "isActive": true
  }
]',
            N'homepage',
            @now,
            @sys
        );

    IF NOT EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_quick_actions_json')
        INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
        VALUES (
            NEWID(),
            N'homepage_quick_actions_json',
            N'[
  {
    "key": "hotline",
    "title": "Gọi tổng đài",
    "description": "Đặt lịch khám nhanh qua tổng đài 1900.888.866",
    "icon": "phone",
    "url": "tel:1900888866",
    "kind": "link",
    "sortOrder": 1,
    "isActive": true
  },
  {
    "key": "booking",
    "title": "Đặt lịch khám",
    "description": "Đặt lịch khám online tại website",
    "icon": "calendar",
    "url": null,
    "kind": "booking",
    "sortOrder": 2,
    "isActive": true
  },
  {
    "key": "lab-result",
    "title": "Kết quả xét nghiệm",
    "description": "Tra cứu kết quả xét nghiệm của bạn",
    "icon": "clipboard-list",
    "url": "#ket-qua-xet-nghiem",
    "kind": "link",
    "sortOrder": 3,
    "isActive": true
  }
]',
            N'homepage',
            @now,
            @sys
        );

    IF NOT EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_featured_services_title')
        INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
        VALUES (NEWID(), N'homepage_featured_services_title', N'Dịch vụ y khoa', N'homepage', @now, @sys);

    IF NOT EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_featured_services_subtitle')
        INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
        VALUES (NEWID(), N'homepage_featured_services_subtitle', N'ĐƠN VỊ', N'homepage', @now, @sys);

    IF NOT EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_featured_services_description')
        INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
        VALUES (NEWID(), N'homepage_featured_services_description', N'Chăm sóc sức khỏe toàn diện cho gia đình bạn', N'homepage', @now, @sys);

    IF NOT EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_featured_news_title')
        INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
        VALUES (NEWID(), N'homepage_featured_news_title', N'Tin tức nổi bật', N'homepage', @now, @sys);

    IF NOT EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_featured_news_subtitle')
        INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
        VALUES (NEWID(), N'homepage_featured_news_subtitle', N'TIN TỨC', N'homepage', @now, @sys);

    IF NOT EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_featured_news_description')
        INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
        VALUES (NEWID(), N'homepage_featured_news_description', N'Cập nhật thông tin y tế và hoạt động mới nhất của bệnh viện', N'homepage', @now, @sys);
END;
