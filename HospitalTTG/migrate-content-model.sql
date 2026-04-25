-- =============================================
-- Migration: Refactor Article Module → Content Model
-- Drop: Articles, ArticleCategories, Tags, ArticleTags
-- Create: Categories, Contents, ContentMedias
-- =============================================

-- DROP OLD TABLES
IF OBJECT_ID('dbo.ArticleTags',       'U') IS NOT NULL DROP TABLE dbo.ArticleTags;
IF OBJECT_ID('dbo.Articles',          'U') IS NOT NULL DROP TABLE dbo.Articles;
IF OBJECT_ID('dbo.Tags',              'U') IS NOT NULL DROP TABLE dbo.Tags;
IF OBJECT_ID('dbo.ArticleCategories', 'U') IS NOT NULL DROP TABLE dbo.ArticleCategories;

-- =============================================
-- 1. CATEGORIES
-- =============================================
IF OBJECT_ID('dbo.Categories', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Categories (
        Id          UNIQUEIDENTIFIER    NOT NULL DEFAULT NEWID(),
        ParentId    UNIQUEIDENTIFIER    NULL,
        Name        NVARCHAR(255)       NOT NULL,
        Slug        NVARCHAR(255)       NOT NULL,
        Type        NVARCHAR(50)        NOT NULL,
        Lang        NVARCHAR(10)        NOT NULL DEFAULT N'vi',
        SortOrder   INT                 NOT NULL DEFAULT 0,
        IsActive    BIT                 NOT NULL DEFAULT 1,
        CreatedAt   DATETIME2(7)        NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt   DATETIME2(7)        NULL,
        CreatedBy   NVARCHAR(MAX)       NULL,
        UpdatedBy   NVARCHAR(MAX)       NULL,
        CONSTRAINT PK_Categories PRIMARY KEY (Id)
    );

    CREATE UNIQUE INDEX UQ_Categories_Slug_Lang  ON dbo.Categories (Slug, Lang);
    CREATE INDEX IX_Categories_ParentId          ON dbo.Categories (ParentId);
    CREATE INDEX IX_Categories_Type_IsActive     ON dbo.Categories (Type, IsActive);
END;

-- =============================================
-- 2. CONTENTS
-- =============================================
IF OBJECT_ID('dbo.Contents', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Contents (
        Id          UNIQUEIDENTIFIER    NOT NULL DEFAULT NEWID(),
        CategoryId  UNIQUEIDENTIFIER    NOT NULL,
        ContentType NVARCHAR(20)        NOT NULL,
        Title       NVARCHAR(500)       NOT NULL,
        Slug        NVARCHAR(500)       NOT NULL,
        Intro       NVARCHAR(MAX)       NULL,
        Body        NVARCHAR(MAX)       NULL,
        Thumbnail   NVARCHAR(500)       NULL,
        FileAttach  NVARCHAR(500)       NULL,
        Tags        NVARCHAR(500)       NULL,
        Status      TINYINT             NOT NULL DEFAULT 1,
        IsHot       BIT                 NOT NULL DEFAULT 0,
        ViewCount   INT                 NOT NULL DEFAULT 0,
        PublishedAt DATETIME2(7)        NULL,
        CreatedAt   DATETIME2(7)        NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt   DATETIME2(7)        NULL,
        CreatedBy   NVARCHAR(MAX)       NULL,
        UpdatedBy   NVARCHAR(MAX)       NULL,
        CONSTRAINT PK_Contents PRIMARY KEY (Id)
    );

    CREATE UNIQUE INDEX UQ_Contents_Slug            ON dbo.Contents (Slug);
    CREATE INDEX IX_Contents_CategoryId_Status      ON dbo.Contents (CategoryId, Status);
    CREATE INDEX IX_Contents_ContentType_Status     ON dbo.Contents (ContentType, Status);
    CREATE INDEX IX_Contents_PublishedAt            ON dbo.Contents (PublishedAt);
    CREATE INDEX IX_Contents_IsHot_Status           ON dbo.Contents (IsHot, Status);
END;

-- =============================================
-- 3. CONTENTMEDIAS
-- =============================================
IF OBJECT_ID('dbo.ContentMedias', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ContentMedias (
        Id          UNIQUEIDENTIFIER    NOT NULL DEFAULT NEWID(),
        ContentId   UNIQUEIDENTIFIER    NOT NULL,
        MediaType   NVARCHAR(20)        NOT NULL,
        Url         NVARCHAR(500)       NOT NULL,
        Caption     NVARCHAR(255)       NULL,
        IsThumbnail BIT                 NOT NULL DEFAULT 0,
        SortOrder   INT                 NOT NULL DEFAULT 0,
        CreatedAt   DATETIME2(7)        NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt   DATETIME2(7)        NULL,
        CONSTRAINT PK_ContentMedias PRIMARY KEY (Id)
    );

    CREATE INDEX IX_ContentMedias_ContentId_SortOrder ON dbo.ContentMedias (ContentId, SortOrder);
END;
