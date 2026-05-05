-- ============================================================
-- 2026-05-04: Homepage featured flags
--   Add IsHomepageFeatured BIT column to Contents, Categories,
--   Departments, Doctors. Idempotent.
-- ============================================================

SET NOCOUNT ON;

-- Contents.IsHomepageFeatured
IF OBJECT_ID(N'dbo.Contents', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Contents', N'IsHomepageFeatured') IS NULL
BEGIN
    ALTER TABLE dbo.Contents
        ADD IsHomepageFeatured BIT NOT NULL CONSTRAINT DF_Contents_IsHomepageFeatured DEFAULT(0);
END;

IF OBJECT_ID(N'dbo.Contents', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Contents_IsHomepageFeatured_Status' AND object_id = OBJECT_ID(N'dbo.Contents'))
BEGIN
    CREATE INDEX IX_Contents_IsHomepageFeatured_Status
        ON dbo.Contents (IsHomepageFeatured, Status);
END;

-- Categories.IsHomepageFeatured
IF OBJECT_ID(N'dbo.Categories', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Categories', N'IsHomepageFeatured') IS NULL
BEGIN
    ALTER TABLE dbo.Categories
        ADD IsHomepageFeatured BIT NOT NULL CONSTRAINT DF_Categories_IsHomepageFeatured DEFAULT(0);
END;

-- Categories homepage section metadata
IF OBJECT_ID(N'dbo.Categories', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Categories', N'HomepageSubtitle') IS NULL
BEGIN
    ALTER TABLE dbo.Categories ADD HomepageSubtitle NVARCHAR(200) NULL;
END;
IF OBJECT_ID(N'dbo.Categories', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Categories', N'HomepageDescription') IS NULL
BEGIN
    ALTER TABLE dbo.Categories ADD HomepageDescription NVARCHAR(500) NULL;
END;
IF OBJECT_ID(N'dbo.Categories', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Categories', N'HomepageButtonText') IS NULL
BEGIN
    ALTER TABLE dbo.Categories ADD HomepageButtonText NVARCHAR(100) NULL;
END;
IF OBJECT_ID(N'dbo.Categories', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Categories', N'HomepageButtonUrl') IS NULL
BEGIN
    ALTER TABLE dbo.Categories ADD HomepageButtonUrl NVARCHAR(500) NULL;
END;
IF OBJECT_ID(N'dbo.Categories', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Categories', N'HomepageLimit') IS NULL
BEGIN
    ALTER TABLE dbo.Categories ADD HomepageLimit INT NULL;
END;

-- Departments.IsHomepageFeatured
IF OBJECT_ID(N'dbo.Departments', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Departments', N'IsHomepageFeatured') IS NULL
BEGIN
    ALTER TABLE dbo.Departments
        ADD IsHomepageFeatured BIT NOT NULL CONSTRAINT DF_Departments_IsHomepageFeatured DEFAULT(0);
END;

-- Doctors.IsHomepageFeatured
IF OBJECT_ID(N'dbo.Doctors', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Doctors', N'IsHomepageFeatured') IS NULL
BEGIN
    ALTER TABLE dbo.Doctors
        ADD IsHomepageFeatured BIT NOT NULL CONSTRAINT DF_Doctors_IsHomepageFeatured DEFAULT(0);
END;
