-- Migration: migrate_site_settings_storage_urls_to_file_ids
-- Problem : logo_url, homepage_departments_image_1/2, and JSON fields
--           (homepage_slides_json, homepage_departments_images_json) stored
--           full download URLs (e.g. http://localhost:5020/api/storage/{guid}/download)
--           instead of just the file Guid. This breaks when BASE_URL changes.
-- Solution: replace full URLs with the extracted Guid in DB.
--           New code paths will resolve Guid -> download URL at render time.
-- Run     : EXEC sp_executesql with caution; back up data first.
-- Idempotent: all UPDATE statements are guarded with LIKE patterns.

SET NOCOUNT ON;

DECLARE @baseUrl NVARCHAR(500) = N'http://localhost:5020';
DECLARE @storagePrefix NVARCHAR(100) = @baseUrl + N'/api/storage/';
DECLARE @downloadSuffix NVARCHAR(20) = N'/download';
DECLARE @prefixLen INT = LEN(@storagePrefix);  -- 40

PRINT N'=== Migrating plain string settings ===';

-- logo_url
IF EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'logo_url')
BEGIN
    DECLARE @logo NVARCHAR(MAX) = (SELECT Value FROM dbo.SiteSettings WHERE [Key] = N'logo_url');
    IF @logo LIKE @storagePrefix + N'%'
    BEGIN
        DECLARE @logoGuid NVARCHAR(36) = SUBSTRING(@logo, @prefixLen + 1, 36);
        UPDATE dbo.SiteSettings
        SET Value = @logoGuid
        WHERE [Key] = N'logo_url';
        PRINT N'  logo_url -> ' + @logoGuid;
    END
    ELSE
        PRINT N'  logo_url skipped (not a storage URL)';
END

-- homepage_departments_image_1
IF EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_departments_image_1')
BEGIN
    DECLARE @img1 NVARCHAR(MAX) = (SELECT Value FROM dbo.SiteSettings WHERE [Key] = N'homepage_departments_image_1');
    IF @img1 LIKE @storagePrefix + N'%'
    BEGIN
        DECLARE @img1Guid NVARCHAR(36) = SUBSTRING(@img1, @prefixLen + 1, 36);
        UPDATE dbo.SiteSettings
        SET Value = @img1Guid
        WHERE [Key] = N'homepage_departments_image_1';
        PRINT N'  homepage_departments_image_1 -> ' + @img1Guid;
    END
    ELSE
        PRINT N'  homepage_departments_image_1 skipped';
END

-- homepage_departments_image_2
IF EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_departments_image_2')
BEGIN
    DECLARE @img2 NVARCHAR(MAX) = (SELECT Value FROM dbo.SiteSettings WHERE [Key] = N'homepage_departments_image_2');
    IF @img2 LIKE @storagePrefix + N'%'
    BEGIN
        DECLARE @img2Guid NVARCHAR(36) = SUBSTRING(@img2, @prefixLen + 1, 36);
        UPDATE dbo.SiteSettings
        SET Value = @img2Guid
        WHERE [Key] = N'homepage_departments_image_2';
        PRINT N'  homepage_departments_image_2 -> ' + @img2Guid;
    END
    ELSE
        PRINT N'  homepage_departments_image_2 skipped';
END

PRINT N'=== Migrating JSON settings ===';

-- homepage_departments_images_json  (array of URLs → array of Guids)
IF EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_departments_images_json')
BEGIN
    DECLARE @deptImgs NVARCHAR(MAX) = (SELECT Value FROM dbo.SiteSettings WHERE [Key] = N'homepage_departments_images_json');
    IF @deptImgs LIKE N'%"' + @storagePrefix + N'%"%' OR @deptImgs LIKE N'%' + @storagePrefix + N'%'
    BEGIN
        DECLARE @deptImgsMigrated NVARCHAR(MAX) = @deptImgs;

        -- Replace each occurrence of "{baseUrl}/api/storage/{guid}/download" with just "{guid}"
        DECLARE @pos INT = CHARINDEX(@storagePrefix, @deptImgsMigrated);
        WHILE @pos > 0
        BEGIN
            SET @deptImgsMigrated =
                STUFF(@deptImgsMigrated,
                      @pos,
                      LEN(@storagePrefix) + 36 + LEN(@downloadSuffix),
                      SUBSTRING(@deptImgsMigrated, @pos + LEN(@storagePrefix), 36));
            SET @pos = CHARINDEX(@storagePrefix, @deptImgsMigrated, @pos + 36);
        END

        UPDATE dbo.SiteSettings SET Value = @deptImgsMigrated WHERE [Key] = N'homepage_departments_images_json';
        PRINT N'  homepage_departments_images_json migrated';
    END
    ELSE
        PRINT N'  homepage_departments_images_json skipped';
END

-- homepage_slides_json  (array of objects with "imageUrl" field)
IF EXISTS (SELECT 1 FROM dbo.SiteSettings WHERE [Key] = N'homepage_slides_json')
BEGIN
    DECLARE @slides NVARCHAR(MAX) = (SELECT Value FROM dbo.SiteSettings WHERE [Key] = N'homepage_slides_json');
    IF @slides LIKE N'%"imageUrl":"' + @storagePrefix + N'%"%' OR @slides LIKE N'%"imageUrl":"' + @storagePrefix + N'%'
    BEGIN
        DECLARE @slidesMigrated NVARCHAR(MAX) = @slides;

        -- Replace each "imageUrl":"{baseUrl}/api/storage/{guid}/download" with "imageUrl":"{guid}"
        DECLARE @imgUrlPattern NVARCHAR(50) = N'"imageUrl":"' + @storagePrefix;
        DECLARE @p INT = CHARINDEX(@imgUrlPattern, @slidesMigrated);
        WHILE @p > 0
        BEGIN
            DECLARE @before NVARCHAR(MAX) = SUBSTRING(@slidesMigrated, 1, @p + LEN(@imgUrlPattern) - 1);
            DECLARE @guidPart NVARCHAR(MAX) = SUBSTRING(@slidesMigrated, @p + LEN(@imgUrlPattern), 36);
            DECLARE @afterPos INT = @p + LEN(@imgUrlPattern) + 36 + LEN(@downloadSuffix) + 1;
            SET @slidesMigrated = @before + @guidPart + SUBSTRING(@slidesMigrated, @afterPos, LEN(@slidesMigrated));
            SET @p = CHARINDEX(@imgUrlPattern, @slidesMigrated, @p + 40);
        END

        UPDATE dbo.SiteSettings SET Value = @slidesMigrated WHERE [Key] = N'homepage_slides_json';
        PRINT N'  homepage_slides_json migrated';
    END
    ELSE
        PRINT N'  homepage_slides_json skipped';
END

PRINT N'=== Migration complete ===';
