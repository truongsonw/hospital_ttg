-- ============================================================
-- 2026-05-04: Homepage demo seed for dashboard/settings/website
--   Scope:
--   - Tab "Section trang chu": upsert section metadata in SiteSettings
--   - Tab "Hien thi trang chu": insert demo Categories/Contents/
--     Departments/Doctors and mark them featured
--
--   Prerequisites:
--   - Run 2026-05-04_homepage_featured_flags.sql first
--   - Run 2026-05-04_homepage_section_settings.sql first
--
--   Idempotency:
--   - Re-runnable without duplicating demo rows
--   - Uses demo slugs/names as stable keys
-- ============================================================

SET NOCOUNT ON;

DECLARE @now DATETIME2 = SYSUTCDATETIME();
DECLARE @sys NVARCHAR(100) = N'system-demo';

DECLARE @catServiceSlug NVARCHAR(255) = N'demo-dich-vu-y-khoa-trang-chu';
DECLARE @catNewsSlug NVARCHAR(255) = N'demo-tin-tuc-trang-chu';

DECLARE @deptCardioName NVARCHAR(200) = N'[Demo] Khoa Tim mach';
DECLARE @deptPediName NVARCHAR(200) = N'[Demo] Khoa Nhi';
DECLARE @deptImagingName NVARCHAR(200) = N'[Demo] Chan doan hinh anh';

DECLARE @docCardioName NVARCHAR(200) = N'[Demo] BS Nguyen Minh An';
DECLARE @docPediName NVARCHAR(200) = N'[Demo] ThS.BS Tran Bao Chau';
DECLARE @docImagingName NVARCHAR(200) = N'[Demo] BSCKI Le Hoang Duc';

IF OBJECT_ID(N'dbo.SiteSettings', N'U') IS NOT NULL
BEGIN
    -- Departments section
    IF EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_departments_section_subtitle')
        UPDATE dbo.SiteSettings
        SET [Value] = N'DON VI', [Group] = N'homepage', UpdatedAt = @now, UpdatedBy = @sys
        WHERE [Key] = N'homepage_departments_section_subtitle';
    ELSE
        INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
        VALUES (NEWID(), N'homepage_departments_section_subtitle', N'DON VI', N'homepage', @now, @sys);

    IF EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_departments_section_title')
        UPDATE dbo.SiteSettings
        SET [Value] = N'Chuyen khoa noi bat', [Group] = N'homepage', UpdatedAt = @now, UpdatedBy = @sys
        WHERE [Key] = N'homepage_departments_section_title';
    ELSE
        INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
        VALUES (NEWID(), N'homepage_departments_section_title', N'Chuyen khoa noi bat', N'homepage', @now, @sys);

    IF EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_departments_section_description')
        UPDATE dbo.SiteSettings
        SET [Value] = N'Du lieu demo de test hien thi section khoa tren trang chu.', [Group] = N'homepage', UpdatedAt = @now, UpdatedBy = @sys
        WHERE [Key] = N'homepage_departments_section_description';
    ELSE
        INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
        VALUES (NEWID(), N'homepage_departments_section_description', N'Du lieu demo de test hien thi section khoa tren trang chu.', N'homepage', @now, @sys);

    IF EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_departments_section_button_text')
        UPDATE dbo.SiteSettings
        SET [Value] = N'Xem tat ca khoa', [Group] = N'homepage', UpdatedAt = @now, UpdatedBy = @sys
        WHERE [Key] = N'homepage_departments_section_button_text';
    ELSE
        INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
        VALUES (NEWID(), N'homepage_departments_section_button_text', N'Xem tat ca khoa', N'homepage', @now, @sys);

    IF EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_departments_section_button_url')
        UPDATE dbo.SiteSettings
        SET [Value] = N'/doi-ngu-chuyen-gia', [Group] = N'homepage', UpdatedAt = @now, UpdatedBy = @sys
        WHERE [Key] = N'homepage_departments_section_button_url';
    ELSE
        INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
        VALUES (NEWID(), N'homepage_departments_section_button_url', N'/doi-ngu-chuyen-gia', N'homepage', @now, @sys);

    IF EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_departments_limit')
        UPDATE dbo.SiteSettings
        SET [Value] = N'3', [Group] = N'homepage', UpdatedAt = @now, UpdatedBy = @sys
        WHERE [Key] = N'homepage_departments_limit';
    ELSE
        INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
        VALUES (NEWID(), N'homepage_departments_limit', N'3', N'homepage', @now, @sys);

    IF EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_departments_images_json')
        UPDATE dbo.SiteSettings
        SET [Value] = N'[]', [Group] = N'homepage', UpdatedAt = @now, UpdatedBy = @sys
        WHERE [Key] = N'homepage_departments_images_json';
    ELSE
        INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
        VALUES (NEWID(), N'homepage_departments_images_json', N'[]', N'homepage', @now, @sys);

    -- Dynamic content sections
    IF EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_section_default_limit')
        UPDATE dbo.SiteSettings
        SET [Value] = N'4', [Group] = N'homepage', UpdatedAt = @now, UpdatedBy = @sys
        WHERE [Key] = N'homepage_section_default_limit';
    ELSE
        INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
        VALUES (NEWID(), N'homepage_section_default_limit', N'4', N'homepage', @now, @sys);

    -- Doctors section
    IF EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_doctors_section_subtitle')
        UPDATE dbo.SiteSettings
        SET [Value] = N'BAC SI', [Group] = N'homepage', UpdatedAt = @now, UpdatedBy = @sys
        WHERE [Key] = N'homepage_doctors_section_subtitle';
    ELSE
        INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
        VALUES (NEWID(), N'homepage_doctors_section_subtitle', N'BAC SI', N'homepage', @now, @sys);

    IF EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_doctors_section_title')
        UPDATE dbo.SiteSettings
        SET [Value] = N'Doi ngu chuyen gia demo', [Group] = N'homepage', UpdatedAt = @now, UpdatedBy = @sys
        WHERE [Key] = N'homepage_doctors_section_title';
    ELSE
        INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
        VALUES (NEWID(), N'homepage_doctors_section_title', N'Doi ngu chuyen gia demo', N'homepage', @now, @sys);

    IF EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_doctors_section_description')
        UPDATE dbo.SiteSettings
        SET [Value] = N'Du lieu demo de test section bac si noi bat tren trang chu.', [Group] = N'homepage', UpdatedAt = @now, UpdatedBy = @sys
        WHERE [Key] = N'homepage_doctors_section_description';
    ELSE
        INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
        VALUES (NEWID(), N'homepage_doctors_section_description', N'Du lieu demo de test section bac si noi bat tren trang chu.', N'homepage', @now, @sys);

    IF EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_doctors_section_button_text')
        UPDATE dbo.SiteSettings
        SET [Value] = N'Xem doi ngu', [Group] = N'homepage', UpdatedAt = @now, UpdatedBy = @sys
        WHERE [Key] = N'homepage_doctors_section_button_text';
    ELSE
        INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
        VALUES (NEWID(), N'homepage_doctors_section_button_text', N'Xem doi ngu', N'homepage', @now, @sys);

    IF EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_doctors_section_button_url')
        UPDATE dbo.SiteSettings
        SET [Value] = N'/doi-ngu-chuyen-gia', [Group] = N'homepage', UpdatedAt = @now, UpdatedBy = @sys
        WHERE [Key] = N'homepage_doctors_section_button_url';
    ELSE
        INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
        VALUES (NEWID(), N'homepage_doctors_section_button_url', N'/doi-ngu-chuyen-gia', N'homepage', @now, @sys);

    IF EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_doctors_limit')
        UPDATE dbo.SiteSettings
        SET [Value] = N'3', [Group] = N'homepage', UpdatedAt = @now, UpdatedBy = @sys
        WHERE [Key] = N'homepage_doctors_limit';
    ELSE
        INSERT INTO dbo.SiteSettings (Id, [Key], [Value], [Group], UpdatedAt, UpdatedBy)
        VALUES (NEWID(), N'homepage_doctors_limit', N'3', N'homepage', @now, @sys);
END;

IF OBJECT_ID(N'dbo.Categories', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Categories', N'IsHomepageFeatured') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Slug = @catServiceSlug AND Lang = N'vi')
    BEGIN
        INSERT INTO dbo.Categories
        (
            Id, ParentId, Name, Slug, Type, Lang, SortOrder, IsActive,
            IsHomepageFeatured, HomepageSubtitle, HomepageDescription,
            HomepageButtonText, HomepageButtonUrl, HomepageLimit,
            CreatedAt, UpdatedAt, CreatedBy, UpdatedBy
        )
        VALUES
        (
            NEWID(), NULL, N'Dich vu y khoa demo', @catServiceSlug, N'service', N'vi', 10, 1,
            1, N'DICH VU', N'Section demo de test tab Hien thi trang chu cho dich vu y khoa.',
            N'Xem dich vu', N'/tin-tuc?type=service', 4,
            @now, @now, @sys, @sys
        );
    END
    ELSE
    BEGIN
        UPDATE dbo.Categories
        SET Name = N'Dich vu y khoa demo',
            Type = N'service',
            Lang = N'vi',
            SortOrder = 10,
            IsActive = 1,
            IsHomepageFeatured = 1,
            HomepageSubtitle = N'DICH VU',
            HomepageDescription = N'Section demo de test tab Hien thi trang chu cho dich vu y khoa.',
            HomepageButtonText = N'Xem dich vu',
            HomepageButtonUrl = N'/tin-tuc?type=service',
            HomepageLimit = 4,
            UpdatedAt = @now,
            UpdatedBy = @sys
        WHERE Slug = @catServiceSlug AND Lang = N'vi';
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Slug = @catNewsSlug AND Lang = N'vi')
    BEGIN
        INSERT INTO dbo.Categories
        (
            Id, ParentId, Name, Slug, Type, Lang, SortOrder, IsActive,
            IsHomepageFeatured, HomepageSubtitle, HomepageDescription,
            HomepageButtonText, HomepageButtonUrl, HomepageLimit,
            CreatedAt, UpdatedAt, CreatedBy, UpdatedBy
        )
        VALUES
        (
            NEWID(), NULL, N'Tin tuc suc khoe demo', @catNewsSlug, N'article', N'vi', 20, 1,
            1, N'TIN TUC', N'Section demo de test tab Hien thi trang chu cho bai viet.',
            N'Xem tin tuc', N'/tin-tuc?type=article', 4,
            @now, @now, @sys, @sys
        );
    END
    ELSE
    BEGIN
        UPDATE dbo.Categories
        SET Name = N'Tin tuc suc khoe demo',
            Type = N'article',
            Lang = N'vi',
            SortOrder = 20,
            IsActive = 1,
            IsHomepageFeatured = 1,
            HomepageSubtitle = N'TIN TUC',
            HomepageDescription = N'Section demo de test tab Hien thi trang chu cho bai viet.',
            HomepageButtonText = N'Xem tin tuc',
            HomepageButtonUrl = N'/tin-tuc?type=article',
            HomepageLimit = 4,
            UpdatedAt = @now,
            UpdatedBy = @sys
        WHERE Slug = @catNewsSlug AND Lang = N'vi';
    END;
END;

DECLARE @catServiceId UNIQUEIDENTIFIER = NULL;
DECLARE @catNewsId UNIQUEIDENTIFIER = NULL;

IF OBJECT_ID(N'dbo.Categories', N'U') IS NOT NULL
BEGIN
    SET @catServiceId =
    (
        SELECT TOP (1) Id
        FROM dbo.Categories
        WHERE Slug = @catServiceSlug AND Lang = N'vi'
    );

    SET @catNewsId =
    (
        SELECT TOP (1) Id
        FROM dbo.Categories
        WHERE Slug = @catNewsSlug AND Lang = N'vi'
    );
END;

IF OBJECT_ID(N'dbo.Contents', N'U') IS NOT NULL
   AND @catServiceId IS NOT NULL
   AND @catNewsId IS NOT NULL
   AND COL_LENGTH(N'dbo.Contents', N'IsHomepageFeatured') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.Contents WHERE Slug = N'demo-goi-kham-tong-quat-trang-chu')
    BEGIN
        INSERT INTO dbo.Contents
        (
            Id, CategoryId, ContentType, Title, Slug, Intro, Body, Thumbnail, FileAttach, Tags,
            Status, IsHot, IsHomepageFeatured, ViewCount, PublishedAt,
            CreatedAt, UpdatedAt, CreatedBy, UpdatedBy
        )
        VALUES
        (
            NEWID(), @catServiceId, N'service', N'Goi kham tong quat demo', N'demo-goi-kham-tong-quat-trang-chu',
            N'Noi dung demo de test section Dich vu y khoa.',
            N'<p>Du lieu demo danh cho homepage settings.</p>',
            NULL, NULL, N'demo,homepage,service',
            1, 0, 1, 0, DATEADD(DAY, -1, @now),
            @now, @now, @sys, @sys
        );
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.Contents WHERE Slug = N'demo-kham-tim-mach-trang-chu')
    BEGIN
        INSERT INTO dbo.Contents
        (
            Id, CategoryId, ContentType, Title, Slug, Intro, Body, Thumbnail, FileAttach, Tags,
            Status, IsHot, IsHomepageFeatured, ViewCount, PublishedAt,
            CreatedAt, UpdatedAt, CreatedBy, UpdatedBy
        )
        VALUES
        (
            NEWID(), @catServiceId, N'service', N'Kham tim mach chuyen sau demo', N'demo-kham-tim-mach-trang-chu',
            N'Ban ghi demo thu hai cho section Dich vu y khoa.',
            N'<p>Ban ghi demo de sap xep trong category featured.</p>',
            NULL, NULL, N'demo,homepage,service',
            1, 0, 0, 0, DATEADD(DAY, -2, @now),
            @now, @now, @sys, @sys
        );
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.Contents WHERE Slug = N'demo-7-thoi-quen-song-khoe-trang-chu')
    BEGIN
        INSERT INTO dbo.Contents
        (
            Id, CategoryId, ContentType, Title, Slug, Intro, Body, Thumbnail, FileAttach, Tags,
            Status, IsHot, IsHomepageFeatured, ViewCount, PublishedAt,
            CreatedAt, UpdatedAt, CreatedBy, UpdatedBy
        )
        VALUES
        (
            NEWID(), @catNewsId, N'article', N'7 thoi quen song khoe demo', N'demo-7-thoi-quen-song-khoe-trang-chu',
            N'Noi dung demo de test section Tin tuc suc khoe.',
            N'<p>Bai viet demo de hien thi o homepage.</p>',
            NULL, NULL, N'demo,homepage,article',
            1, 0, 1, 0, DATEADD(DAY, -3, @now),
            @now, @now, @sys, @sys
        );
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.Contents WHERE Slug = N'demo-huong-dan-kham-online-trang-chu')
    BEGIN
        INSERT INTO dbo.Contents
        (
            Id, CategoryId, ContentType, Title, Slug, Intro, Body, Thumbnail, FileAttach, Tags,
            Status, IsHot, IsHomepageFeatured, ViewCount, PublishedAt,
            CreatedAt, UpdatedAt, CreatedBy, UpdatedBy
        )
        VALUES
        (
            NEWID(), @catNewsId, N'article', N'Huong dan dat lich kham online demo', N'demo-huong-dan-kham-online-trang-chu',
            N'Ban ghi demo bo sung cho section Tin tuc.',
            N'<p>Bai viet demo thu hai.</p>',
            NULL, NULL, N'demo,homepage,article',
            1, 0, 0, 0, DATEADD(DAY, -4, @now),
            @now, @now, @sys, @sys
        );
    END;
END;

IF OBJECT_ID(N'dbo.Departments', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Departments', N'IsHomepageFeatured') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.Departments WHERE Name = @deptCardioName)
    BEGIN
        INSERT INTO dbo.Departments
        (
            Id, Name, Description, ParentId, SortOrder, IsActive, IsHomepageFeatured,
            CreatedAt, UpdatedAt, CreatedBy, UpdatedBy
        )
        VALUES
        (
            NEWID(), @deptCardioName, N'Khoa demo phuc vu test section trang chu.', NULL, 10, 1, 1,
            @now, @now, @sys, @sys
        );
    END
    ELSE
    BEGIN
        UPDATE dbo.Departments
        SET Description = N'Khoa demo phuc vu test section trang chu.',
            ParentId = NULL,
            SortOrder = 10,
            IsActive = 1,
            IsHomepageFeatured = 1,
            UpdatedAt = @now,
            UpdatedBy = @sys
        WHERE Name = @deptCardioName;
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.Departments WHERE Name = @deptPediName)
    BEGIN
        INSERT INTO dbo.Departments
        (
            Id, Name, Description, ParentId, SortOrder, IsActive, IsHomepageFeatured,
            CreatedAt, UpdatedAt, CreatedBy, UpdatedBy
        )
        VALUES
        (
            NEWID(), @deptPediName, N'Khoa demo phuc vu test quick picker.', NULL, 20, 1, 1,
            @now, @now, @sys, @sys
        );
    END
    ELSE
    BEGIN
        UPDATE dbo.Departments
        SET Description = N'Khoa demo phuc vu test quick picker.',
            ParentId = NULL,
            SortOrder = 20,
            IsActive = 1,
            IsHomepageFeatured = 1,
            UpdatedAt = @now,
            UpdatedBy = @sys
        WHERE Name = @deptPediName;
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.Departments WHERE Name = @deptImagingName)
    BEGIN
        INSERT INTO dbo.Departments
        (
            Id, Name, Description, ParentId, SortOrder, IsActive, IsHomepageFeatured,
            CreatedAt, UpdatedAt, CreatedBy, UpdatedBy
        )
        VALUES
        (
            NEWID(), @deptImagingName, N'Khoa demo thu ba cho gioi han hien thi.', NULL, 30, 1, 1,
            @now, @now, @sys, @sys
        );
    END
    ELSE
    BEGIN
        UPDATE dbo.Departments
        SET Description = N'Khoa demo thu ba cho gioi han hien thi.',
            ParentId = NULL,
            SortOrder = 30,
            IsActive = 1,
            IsHomepageFeatured = 1,
            UpdatedAt = @now,
            UpdatedBy = @sys
        WHERE Name = @deptImagingName;
    END;
END;

DECLARE @deptCardioId UNIQUEIDENTIFIER = NULL;
DECLARE @deptPediId UNIQUEIDENTIFIER = NULL;
DECLARE @deptImagingId UNIQUEIDENTIFIER = NULL;

IF OBJECT_ID(N'dbo.Departments', N'U') IS NOT NULL
BEGIN
    SET @deptCardioId =
    (
        SELECT TOP (1) Id
        FROM dbo.Departments
        WHERE Name = @deptCardioName
    );

    SET @deptPediId =
    (
        SELECT TOP (1) Id
        FROM dbo.Departments
        WHERE Name = @deptPediName
    );

    SET @deptImagingId =
    (
        SELECT TOP (1) Id
        FROM dbo.Departments
        WHERE Name = @deptImagingName
    );
END;

IF OBJECT_ID(N'dbo.Doctors', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Doctors', N'IsHomepageFeatured') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.Doctors WHERE FullName = @docCardioName)
    BEGIN
        INSERT INTO dbo.Doctors
        (
            Id, FullName, AcademicTitle, Position, DepartmentId, Specialty, AvatarUrl, Bio,
            SortOrder, IsActive, IsManagement, ManagementOrder, IsHomepageFeatured,
            CreatedAt, UpdatedAt, CreatedBy, UpdatedBy
        )
        VALUES
        (
            NEWID(), @docCardioName, N'BSCKII', N'Truong khoa', @deptCardioId, N'Tim mach can thiep',
            NULL, N'Bac si demo de test section doi ngu chuyen gia.',
            10, 1, 0, 0, 1,
            @now, @now, @sys, @sys
        );
    END
    ELSE
    BEGIN
        UPDATE dbo.Doctors
        SET AcademicTitle = N'BSCKII',
            Position = N'Truong khoa',
            DepartmentId = @deptCardioId,
            Specialty = N'Tim mach can thiep',
            AvatarUrl = NULL,
            Bio = N'Bac si demo de test section doi ngu chuyen gia.',
            SortOrder = 10,
            IsActive = 1,
            IsManagement = 0,
            ManagementOrder = 0,
            IsHomepageFeatured = 1,
            UpdatedAt = @now,
            UpdatedBy = @sys
        WHERE FullName = @docCardioName;
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.Doctors WHERE FullName = @docPediName)
    BEGIN
        INSERT INTO dbo.Doctors
        (
            Id, FullName, AcademicTitle, Position, DepartmentId, Specialty, AvatarUrl, Bio,
            SortOrder, IsActive, IsManagement, ManagementOrder, IsHomepageFeatured,
            CreatedAt, UpdatedAt, CreatedBy, UpdatedBy
        )
        VALUES
        (
            NEWID(), @docPediName, N'ThS.BS', N'Pho khoa', @deptPediId, N'Noi nhi',
            NULL, N'Bac si demo thu hai de test quick picker.',
            20, 1, 0, 0, 1,
            @now, @now, @sys, @sys
        );
    END
    ELSE
    BEGIN
        UPDATE dbo.Doctors
        SET AcademicTitle = N'ThS.BS',
            Position = N'Pho khoa',
            DepartmentId = @deptPediId,
            Specialty = N'Noi nhi',
            AvatarUrl = NULL,
            Bio = N'Bac si demo thu hai de test quick picker.',
            SortOrder = 20,
            IsActive = 1,
            IsManagement = 0,
            ManagementOrder = 0,
            IsHomepageFeatured = 1,
            UpdatedAt = @now,
            UpdatedBy = @sys
        WHERE FullName = @docPediName;
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.Doctors WHERE FullName = @docImagingName)
    BEGIN
        INSERT INTO dbo.Doctors
        (
            Id, FullName, AcademicTitle, Position, DepartmentId, Specialty, AvatarUrl, Bio,
            SortOrder, IsActive, IsManagement, ManagementOrder, IsHomepageFeatured,
            CreatedAt, UpdatedAt, CreatedBy, UpdatedBy
        )
        VALUES
        (
            NEWID(), @docImagingName, N'BSCKI', N'Bac si dieu tri', @deptImagingId, N'Chan doan hinh anh',
            NULL, N'Bac si demo thu ba cho gioi han hien thi.',
            30, 1, 0, 0, 1,
            @now, @now, @sys, @sys
        );
    END
    ELSE
    BEGIN
        UPDATE dbo.Doctors
        SET AcademicTitle = N'BSCKI',
            Position = N'Bac si dieu tri',
            DepartmentId = @deptImagingId,
            Specialty = N'Chan doan hinh anh',
            AvatarUrl = NULL,
            Bio = N'Bac si demo thu ba cho gioi han hien thi.',
            SortOrder = 30,
            IsActive = 1,
            IsManagement = 0,
            ManagementOrder = 0,
            IsHomepageFeatured = 1,
            UpdatedAt = @now,
            UpdatedBy = @sys
        WHERE FullName = @docImagingName;
    END;
END;
