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

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.Roles (
        Id          NVARCHAR(100)   NOT NULL PRIMARY KEY,
        Name        NVARCHAR(200)   NOT NULL,
        Description NVARCHAR(500)   NULL,
        IsActive    BIT              NOT NULL DEFAULT 1,
        CreatedBy   NVARCHAR(100)   NULL,
        CreatedDate DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
        UpdatedBy   NVARCHAR(100)   NULL,
        UpdatedDate DATETIME2        NULL
    );
END
GO

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
        Email           NVARCHAR(256)       NULL,
        PhoneNumber     NVARCHAR(20)        NOT NULL,
        DateOfBirth     DATETIME2           NOT NULL,
        AppointmentDate DATETIME2           NOT NULL,
        Symptoms        NVARCHAR(2000)      NULL,
        Status          INT                 NOT NULL,   -- 0=Pending, 1=Confirmed, 2=Completed, 3=Cancelled
        Note            NVARCHAR(1000)      NULL,
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
        [Type]      INT                 NOT NULL DEFAULT 0,
        CreatedBy   NVARCHAR(100)       NULL,
        CreatedDate DATETIME2           NOT NULL DEFAULT GETUTCDATE(),
        UpdatedBy   NVARCHAR(100)       NULL,
        UpdatedDate DATETIME2           NULL,
        CONSTRAINT PK_Menus PRIMARY KEY (Id)
    );
END
GO

-- Backward-compat: add Type column if migrating from old schema (no Type column)
IF COL_LENGTH('dbo.Menus', 'Type') IS NULL
BEGIN
    ALTER TABLE dbo.Menus ADD [Type] INT NOT NULL CONSTRAINT DF_Menus_Type DEFAULT 0;
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Menus_ParentId' AND object_id = OBJECT_ID('dbo.Menus'))
    CREATE INDEX IX_Menus_ParentId ON dbo.Menus (ParentId);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Menus_SortOrder' AND object_id = OBJECT_ID('dbo.Menus'))
    CREATE INDEX IX_Menus_SortOrder ON dbo.Menus (SortOrder);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Menus_Type' AND object_id = OBJECT_ID('dbo.Menus'))
    CREATE INDEX IX_Menus_Type ON dbo.Menus ([Type]);
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

-- ============================================================
-- SEED DATA
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Id = N'Admin')
    INSERT INTO dbo.Roles (Id, Name, Description, IsActive) VALUES
        (N'Admin',  N'Quản trị viên', N'Toàn quyền hệ thống', 1),
        (N'Editor', N'Biên tập viên', N'Quản lý nội dung bài viết, không sửa hệ thống', 1),
        (N'User',   N'Người dùng',    N'Tài khoản thường, không truy cập dashboard', 1);
GO

DECLARE @now DATETIME2 = SYSUTCDATETIME();
DECLARE @sys NVARCHAR(100) = N'system';

-- ── Admin menus (Type=0) ────────────────────────────────────────────────────────
DECLARE @admDashboard UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000001';
DECLARE @admSystem    UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000010';
DECLARE @admArticle   UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000020';
DECLARE @admDoctors   UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000030';
DECLARE @admReception UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000040';
DECLARE @admSettings  UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000050';

DECLARE @admSysMenus       UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000011';
DECLARE @admSysPubMenus    UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000012';
DECLARE @admSysCategories  UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000013';

DECLARE @admArtCategories  UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000021';
DECLARE @admArtContents    UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000022';

DECLARE @admBookings       UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000041';
DECLARE @admContacts       UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000042';

DECLARE @admDoctorList     UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000031';
DECLARE @admDepartments    UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000032';

DECLARE @admSetAccount     UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000051';
DECLARE @admSetWebsite     UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000052';

-- Parent nodes
IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admDashboard)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admDashboard, NULL, N'Bảng điều khiển', N'/dashboard', N'LayoutDashboard', 10, 1, 0, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admSystem)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admSystem, NULL, N'Hệ thống', NULL, N'Settings', 20, 1, 0, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admArticle)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admArticle, NULL, N'Nội dung', NULL, N'FileText', 30, 1, 0, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admReception)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admReception, NULL, N'Tiếp nhận', NULL, N'Calendar', 40, 1, 0, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admDoctors)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admDoctors, NULL, N'Bác sĩ', NULL, N'Stethoscope', 50, 1, 0, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admSettings)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admSettings, NULL, N'Cài đặt', NULL, N'User', 60, 1, 0, @sys, @now);

-- System children
IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admSysMenus)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admSysMenus, @admSystem, N'Menu hệ thống', N'/dashboard/system/menus', N'Menu', 10, 1, 0, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admSysPubMenus)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admSysPubMenus, @admSystem, N'Menu trang chủ', N'/dashboard/system/public-menus', N'Globe', 20, 1, 0, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admSysCategories)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admSysCategories, @admSystem, N'Danh mục hệ thống', N'/dashboard/system/categories', N'LayoutGrid', 30, 1, 0, @sys, @now);

-- Article children
IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admArtCategories)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admArtCategories, @admArticle, N'Danh mục nội dung', N'/dashboard/article/categories', N'Grid3X3', 10, 1, 0, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admArtContents)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admArtContents, @admArticle, N'Quản lý nội dung', N'/dashboard/article/contents', N'Newspaper', 20, 1, 0, @sys, @now);

-- Reception children
IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admBookings)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admBookings, @admReception, N'Đặt lịch khám', N'/dashboard/bookings', N'Calendar', 10, 1, 0, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admContacts)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admContacts, @admReception, N'Liên hệ', N'/dashboard/contacts', N'Mail', 20, 1, 0, @sys, @now);

-- Doctors children
IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admDoctorList)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admDoctorList, @admDoctors, N'Quản lý bác sĩ', N'/dashboard/doctors', N'Stethoscope', 10, 1, 0, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admDepartments)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admDepartments, @admDoctors, N'Quản lý khoa', N'/dashboard/doctors/departments', N'Building2', 20, 1, 0, @sys, @now);

-- Settings children
IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admSetAccount)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admSetAccount, @admSettings, N'Tài khoản', N'/dashboard/settings/account', N'User', 10, 1, 0, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admSetWebsite)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admSetWebsite, @admSettings, N'Thông tin website', N'/dashboard/settings/website', N'Globe', 20, 1, 0, @sys, @now);
GO

-- ── RoleMenus: Admin gets all Type=0 menus ────────────────────────────────────
DECLARE @now DATETIME2 = SYSUTCDATETIME();
DECLARE @sys NVARCHAR(100) = N'system';

INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate)
SELECT NEWID(), N'Admin', m.Id, 1, @sys, @now
FROM dbo.Menus m
WHERE m.[Type] = 0
  AND NOT EXISTS (
      SELECT 1 FROM dbo.RoleMenus rm
      WHERE rm.RoleId = N'Admin' AND rm.MenuId = m.Id
  );
GO
