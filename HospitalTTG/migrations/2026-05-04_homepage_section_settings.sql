-- ============================================================
-- 2026-05-04: Homepage section settings (Departments + Doctors
--   metadata, default limit cho dynamic content sections).
--   Seed defaults vào dbo.SiteSettings. Idempotent.
--
--   Lưu ý: 2 section cũ "Dịch vụ y khoa" / "Tin tức nổi bật"
--   đã chuyển sang dynamic — mỗi danh mục được tick
--   IsHomepageFeatured tự sinh 1 section. Metadata section
--   nay nằm trên chính Category.
-- ============================================================

SET NOCOUNT ON;

IF OBJECT_ID(N'dbo.SiteSettings', N'U') IS NULL
    RETURN;

DECLARE @now DATETIME2 = SYSUTCDATETIME();
DECLARE @sys NVARCHAR(100) = N'system';

-- Departments section metadata
IF NOT EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_departments_section_subtitle')
    INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
    VALUES (NEWID(), N'homepage_departments_section_subtitle', N'ĐƠN VỊ', N'homepage', @now, @sys);

IF NOT EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_departments_section_title')
    INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
    VALUES (NEWID(), N'homepage_departments_section_title', N'Chuyên khoa', N'homepage', @now, @sys);

IF NOT EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_departments_section_description')
    INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
    VALUES (NEWID(), N'homepage_departments_section_description', N'Chăm sóc sức khỏe toàn diện cho gia đình bạn', N'homepage', @now, @sys);

IF NOT EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_departments_section_button_text')
    INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
    VALUES (NEWID(), N'homepage_departments_section_button_text', N'Xem tất cả', N'homepage', @now, @sys);

IF NOT EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_departments_section_button_url')
    INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
    VALUES (NEWID(), N'homepage_departments_section_button_url', N'/doi-ngu-chuyen-gia', N'homepage', @now, @sys);

IF NOT EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_departments_limit')
    INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
    VALUES (NEWID(), N'homepage_departments_limit', N'5', N'homepage', @now, @sys);

IF NOT EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_departments_images_json')
    INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
    VALUES (NEWID(), N'homepage_departments_images_json', N'[]', N'homepage', @now, @sys);

-- Default content section limit (per featured category)
IF NOT EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_section_default_limit')
    INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
    VALUES (NEWID(), N'homepage_section_default_limit', N'4', N'homepage', @now, @sys);

-- Featured Doctors section
IF NOT EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_doctors_section_subtitle')
    INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
    VALUES (NEWID(), N'homepage_doctors_section_subtitle', N'BÁC SĨ', N'homepage', @now, @sys);

IF NOT EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_doctors_section_title')
    INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
    VALUES (NEWID(), N'homepage_doctors_section_title', N'Đội ngũ chuyên gia', N'homepage', @now, @sys);

IF NOT EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_doctors_section_description')
    INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
    VALUES (NEWID(), N'homepage_doctors_section_description', N'Hơn 1.000 bác sĩ và hơn 4.300 nhân viên y tế tận tâm phục vụ.', N'homepage', @now, @sys);

IF NOT EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_doctors_section_button_text')
    INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
    VALUES (NEWID(), N'homepage_doctors_section_button_text', N'Tìm bác sĩ', N'homepage', @now, @sys);

IF NOT EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_doctors_section_button_url')
    INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
    VALUES (NEWID(), N'homepage_doctors_section_button_url', N'/doi-ngu-chuyen-gia', N'homepage', @now, @sys);

IF NOT EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_doctors_limit')
    INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
    VALUES (NEWID(), N'homepage_doctors_limit', N'8', N'homepage', @now, @sys);
