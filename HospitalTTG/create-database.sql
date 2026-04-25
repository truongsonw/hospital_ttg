-- ============================================================
-- HospitalTTG Database Creation Script
-- Database: SQL Server
-- All tables use dbo schema, no foreign key constraints
-- ============================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'HospitalTTG')
BEGIN
    CREATE DATABASE HospitalTTG;
END
GO

USE HospitalTTG;
GO

-- ============================================================
-- AUTH
-- ============================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.Users (
        Id                      UNIQUEIDENTIFIER    NOT NULL DEFAULT NEWID(),
        Username                NVARCHAR(100)       NOT NULL,
        PasswordHash            NVARCHAR(MAX)       NOT NULL,
        Email                   NVARCHAR(256)       NOT NULL,
        FullName                NVARCHAR(200)       NOT NULL,
        Role                    NVARCHAR(50)        NOT NULL DEFAULT 'User',
        RefreshToken            NVARCHAR(MAX)       NULL,
        RefreshTokenExpiryTime  DATETIME2           NULL,
        IsActive                BIT                 NOT NULL DEFAULT 1,
        CreatedAt               DATETIME2           NOT NULL,
        UpdatedAt               DATETIME2           NULL,
        CreatedBy               NVARCHAR(MAX)       NULL,
        UpdatedBy               NVARCHAR(MAX)       NULL,
        CONSTRAINT PK_Users PRIMARY KEY (Id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_Username' AND object_id = OBJECT_ID('dbo.Users'))
    CREATE UNIQUE INDEX IX_Users_Username ON dbo.Users (Username);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_Email' AND object_id = OBJECT_ID('dbo.Users'))
    CREATE UNIQUE INDEX IX_Users_Email ON dbo.Users (Email);
GO

-- ============================================================
-- BOOKING
-- ============================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Bookings' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.Bookings (
        Id              UNIQUEIDENTIFIER    NOT NULL DEFAULT NEWID(),
        FullName        NVARCHAR(100)       NOT NULL,
        PhoneNumber     NVARCHAR(20)        NOT NULL,
        DateOfBirth     DATETIME2           NOT NULL,
        AppointmentDate DATETIME2           NOT NULL,
        Symptoms        NVARCHAR(2000)      NULL,
        Status          INT                 NOT NULL,   -- 0=Pending, 1=Confirmed, 2=Completed, 3=Cancelled
        CreatedAt       DATETIME2           NOT NULL,
        UpdatedAt       DATETIME2           NULL,
        CreatedBy       NVARCHAR(MAX)       NULL,
        UpdatedBy       NVARCHAR(MAX)       NULL,
        CONSTRAINT PK_Bookings PRIMARY KEY (Id)
    );
END
GO

-- ============================================================
-- CONTACT
-- ============================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Contacts' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.Contacts (
        Id          UNIQUEIDENTIFIER    NOT NULL DEFAULT NEWID(),
        FullName    NVARCHAR(100)       NOT NULL,
        Email       NVARCHAR(100)       NOT NULL,
        Subject     NVARCHAR(200)       NOT NULL,
        Content     NVARCHAR(2000)      NOT NULL,
        Status      INT                 NOT NULL,   -- 0=Unread, 1=Read, 2=Replied
        CreatedAt   DATETIME2           NOT NULL,
        UpdatedAt   DATETIME2           NULL,
        CreatedBy   NVARCHAR(MAX)       NULL,
        UpdatedBy   NVARCHAR(MAX)       NULL,
        CONSTRAINT PK_Contacts PRIMARY KEY (Id)
    );
END
GO

-- ============================================================
-- SYSTEM
-- ============================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SysCategories' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.SysCategories (
        Id          UNIQUEIDENTIFIER    NOT NULL DEFAULT NEWID(),
        Code        NVARCHAR(100)       NULL,
        Name        NVARCHAR(500)       NULL,
        Type        INT                 NOT NULL,
        Description NVARCHAR(1000)      NULL,
        Active      BIT                 NULL,
        Deleted     BIT                 NULL,
        CreateBy    INT                 NULL,
        CreateDTG   DATETIME2           NULL,
        UpdateBy    INT                 NULL,
        UpdateDTG   DATETIME2           NULL,
        ParentId    UNIQUEIDENTIFIER    NULL,
        Ext1s       NVARCHAR(1000)      NULL,
        Ext1d       DECIMAL(18,4)       NULL,
        CONSTRAINT PK_SysCategories PRIMARY KEY (Id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Menus' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.Menus (
        Id          UNIQUEIDENTIFIER    NOT NULL DEFAULT NEWID(),
        ParentId    UNIQUEIDENTIFIER    NULL,
        Title       NVARCHAR(200)       NOT NULL,
        Url         NVARCHAR(500)       NULL,
        Icon        NVARCHAR(100)       NULL,
        SortOrder   INT                 NOT NULL,
        IsActive    BIT                 NOT NULL DEFAULT 1,
        CreatedBy   NVARCHAR(100)       NULL,
        CreatedDate DATETIME2           NOT NULL,
        UpdatedBy   NVARCHAR(100)       NULL,
        UpdatedDate DATETIME2           NULL,
        CONSTRAINT PK_Menus PRIMARY KEY (Id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Menus_ParentId' AND object_id = OBJECT_ID('dbo.Menus'))
    CREATE INDEX IX_Menus_ParentId ON dbo.Menus (ParentId);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Menus_SortOrder' AND object_id = OBJECT_ID('dbo.Menus'))
    CREATE INDEX IX_Menus_SortOrder ON dbo.Menus (SortOrder);
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RoleMenus' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.RoleMenus (
        Id          UNIQUEIDENTIFIER    NOT NULL DEFAULT NEWID(),
        RoleId      NVARCHAR(100)       NOT NULL,
        MenuId      UNIQUEIDENTIFIER    NOT NULL,
        CanView     BIT                 NOT NULL DEFAULT 1,
        CreatedBy   NVARCHAR(100)       NULL,
        CreatedDate DATETIME2           NOT NULL,
        CONSTRAINT PK_RoleMenus PRIMARY KEY (Id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_RoleMenus_RoleId_MenuId' AND object_id = OBJECT_ID('dbo.RoleMenus'))
    CREATE UNIQUE INDEX IX_RoleMenus_RoleId_MenuId ON dbo.RoleMenus (RoleId, MenuId);
GO

-- ============================================================
-- ARTICLE
-- ============================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ArticleCategories' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.ArticleCategories (
        Id              UNIQUEIDENTIFIER    NOT NULL DEFAULT NEWID(),
        Name            NVARCHAR(255)       NOT NULL,
        Slug            NVARCHAR(255)       NOT NULL,
        Description     NVARCHAR(MAX)       NULL,
        ParentId        UNIQUEIDENTIFIER    NULL,
        Image           NVARCHAR(MAX)       NULL,
        Status          BIT                 NOT NULL,
        [Order]         INT                 NOT NULL DEFAULT 0,
        MetaTitle       NVARCHAR(MAX)       NULL,
        MetaDescription NVARCHAR(MAX)       NULL,
        CreatedBy       NVARCHAR(MAX)       NULL,
        CreatedDate     DATETIME2           NOT NULL,
        UpdatedBy       NVARCHAR(MAX)       NULL,
        UpdatedDate     DATETIME2           NULL,
        CONSTRAINT PK_ArticleCategories PRIMARY KEY (Id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Tags' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.Tags (
        Id          UNIQUEIDENTIFIER    NOT NULL DEFAULT NEWID(),
        Name        NVARCHAR(255)       NOT NULL,
        Slug        NVARCHAR(255)       NOT NULL,
        CreatedAt   DATETIME2           NOT NULL,
        UpdatedAt   DATETIME2           NULL,
        CreatedBy   NVARCHAR(MAX)       NULL,
        UpdatedBy   NVARCHAR(MAX)       NULL,
        CONSTRAINT PK_Tags PRIMARY KEY (Id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Articles' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.Articles (
        Id              UNIQUEIDENTIFIER    NOT NULL DEFAULT NEWID(),
        Title           NVARCHAR(255)       NOT NULL,
        Slug            NVARCHAR(255)       NOT NULL,
        Summary         NVARCHAR(MAX)       NULL,
        Content         NVARCHAR(MAX)       NOT NULL,
        Thumbnail       NVARCHAR(MAX)       NULL,
        CategoryId      UNIQUEIDENTIFIER    NOT NULL,
        Author          NVARCHAR(150)       NULL,
        Status          NVARCHAR(50)        NOT NULL,
        Views           INT                 NOT NULL DEFAULT 0,
        PublishedAt     DATETIME2           NULL,
        MetaTitle       NVARCHAR(MAX)       NULL,
        MetaDescription NVARCHAR(MAX)       NULL,
        CreatedBy       NVARCHAR(MAX)       NULL,
        CreatedDate     DATETIME2           NOT NULL,
        UpdatedBy       NVARCHAR(MAX)       NULL,
        UpdatedDate     DATETIME2           NULL,
        CONSTRAINT PK_Articles PRIMARY KEY (Id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ArticleTags' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.ArticleTags (
        ArticleId   UNIQUEIDENTIFIER    NOT NULL,
        TagId       UNIQUEIDENTIFIER    NOT NULL,
        CONSTRAINT PK_ArticleTags PRIMARY KEY (ArticleId, TagId)
    );
END
GO
