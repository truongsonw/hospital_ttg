-- ============================================================
-- 2026-05-04: Menu management feature
--   1. Add Menus.Type column (0=Admin sidebar, 1=Public site Header)
--   2. Add Roles catalog table
--   3. Seed Roles (Admin / Editor / User)
--   4. Seed Public menus (matches current Header.tsx)
--   5. Seed Admin menus (matches current app-sidebar.tsx)
--   6. Seed RoleMenus (Admin -> all admin menus, Editor -> articles only)
--
-- All scripts are idempotent (safe to re-run).
-- No FK constraints (per project convention).
-- No GO batch separators — runs in any SQL client (DBeaver, Azure
-- Data Studio, JetBrains, SSMS, sqlcmd).
-- ============================================================

SET NOCOUNT ON;

-- ============================================================
-- 1. SCHEMA: Menus.Type column
--    Wrapped in EXEC so the rest of the script can reference
--    [Type] without parse-time errors when the column is new.
-- ============================================================

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE Name = N'Type' AND Object_ID = OBJECT_ID(N'dbo.Menus')
)
    EXEC('ALTER TABLE dbo.Menus ADD [Type] INT NOT NULL CONSTRAINT DF_Menus_Type DEFAULT 0;');

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_Menus_Type' AND object_id = OBJECT_ID('dbo.Menus')
)
    EXEC('CREATE INDEX IX_Menus_Type ON dbo.Menus([Type]);');

-- ============================================================
-- 2. SCHEMA: Roles catalog table
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Roles' AND schema_id = SCHEMA_ID('dbo'))
    EXEC('
        CREATE TABLE dbo.Roles (
            Id          NVARCHAR(100)   NOT NULL,
            Name        NVARCHAR(200)   NOT NULL,
            Description NVARCHAR(500)   NULL,
            IsActive    BIT             NOT NULL DEFAULT 1,
            CreatedBy   NVARCHAR(100)   NULL,
            CreatedDate DATETIME2       NOT NULL,
            UpdatedBy   NVARCHAR(100)   NULL,
            UpdatedDate DATETIME2       NULL,
            CONSTRAINT PK_Roles PRIMARY KEY (Id)
        );
    ');

-- ============================================================
-- 3. SEED: Roles
-- ============================================================

DECLARE @nowAll DATETIME2 = SYSUTCDATETIME();
DECLARE @sys NVARCHAR(100) = N'system';

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Id = N'Admin')
    INSERT INTO dbo.Roles (Id, Name, Description, IsActive, CreatedBy, CreatedDate)
    VALUES (N'Admin',  N'Quản trị viên', N'Toàn quyền hệ thống', 1, @sys, @nowAll);

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Id = N'Editor')
    INSERT INTO dbo.Roles (Id, Name, Description, IsActive, CreatedBy, CreatedDate)
    VALUES (N'Editor', N'Biên tập viên', N'Quản lý nội dung bài viết, không sửa hệ thống', 1, @sys, @nowAll);

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Id = N'User')
    INSERT INTO dbo.Roles (Id, Name, Description, IsActive, CreatedBy, CreatedDate)
    VALUES (N'User',   N'Người dùng',    N'Tài khoản thường, không truy cập dashboard', 1, @sys, @nowAll);

-- ============================================================
-- 4. SEED: Public menus (Type=1) — matches current Header.tsx
--    Use sp_executesql so [Type] (just-added column) parses ok.
-- ============================================================

DECLARE @insertPubSql NVARCHAR(MAX) = N'
DECLARE @now DATETIME2 = SYSUTCDATETIME();
DECLARE @sys NVARCHAR(100) = N''system'';

DECLARE @pubHome    UNIQUEIDENTIFIER = ''11111111-0000-0000-0000-000000000001'';
DECLARE @pubAbout   UNIQUEIDENTIFIER = ''11111111-0000-0000-0000-000000000002'';
DECLARE @pubDoctors UNIQUEIDENTIFIER = ''11111111-0000-0000-0000-000000000003'';
DECLARE @pubNews    UNIQUEIDENTIFIER = ''11111111-0000-0000-0000-000000000004'';
DECLARE @pubContact UNIQUEIDENTIFIER = ''11111111-0000-0000-0000-000000000005'';

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @pubHome)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@pubHome, NULL, N''Trang chủ'', N''/'', NULL, 10, 1, 1, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @pubAbout)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@pubAbout, NULL, N''Giới thiệu'', NULL, NULL, 20, 1, 1, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @pubDoctors)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@pubDoctors, NULL, N''Đội ngũ bác sĩ'', NULL, NULL, 30, 1, 1, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @pubNews)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@pubNews, NULL, N''Tin tức'', N''/tin-tuc'', NULL, 40, 1, 1, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @pubContact)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@pubContact, NULL, N''Liên hệ'', N''/contact'', NULL, 50, 1, 1, @sys, @now);

DECLARE @pubAboutGen   UNIQUEIDENTIFIER = ''11111111-0000-0000-0000-000000000102'';
DECLARE @pubDocLeaders UNIQUEIDENTIFIER = ''11111111-0000-0000-0000-000000000103'';
DECLARE @pubDocExperts UNIQUEIDENTIFIER = ''11111111-0000-0000-0000-000000000104'';
DECLARE @pubNewsAll    UNIQUEIDENTIFIER = ''11111111-0000-0000-0000-000000000105'';

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @pubAboutGen)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@pubAboutGen, @pubAbout, N''Giới thiệu chung'', N''/about'', NULL, 10, 1, 1, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @pubDocLeaders)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@pubDocLeaders, @pubDoctors, N''Ban lãnh đạo'', N''/ban-lanh-dao'', NULL, 10, 1, 1, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @pubDocExperts)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@pubDocExperts, @pubDoctors, N''Đội ngũ chuyên gia'', N''/doi-ngu-chuyen-gia'', NULL, 20, 1, 1, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @pubNewsAll)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@pubNewsAll, @pubNews, N''Tất cả tin tức'', N''/tin-tuc'', NULL, 10, 1, 1, @sys, @now);
';
EXEC sp_executesql @insertPubSql;

-- ============================================================
-- 5. SEED: Admin menus (Type=0) — matches current app-sidebar.tsx
-- ============================================================

DECLARE @insertAdmSql NVARCHAR(MAX) = N'
DECLARE @now DATETIME2 = SYSUTCDATETIME();
DECLARE @sys NVARCHAR(100) = N''system'';

DECLARE @admDashboard UNIQUEIDENTIFIER = ''22222222-0000-0000-0000-000000000001'';
DECLARE @admSystem    UNIQUEIDENTIFIER = ''22222222-0000-0000-0000-000000000010'';
DECLARE @admArticle   UNIQUEIDENTIFIER = ''22222222-0000-0000-0000-000000000020'';
DECLARE @admDoctors   UNIQUEIDENTIFIER = ''22222222-0000-0000-0000-000000000030'';
DECLARE @admReception UNIQUEIDENTIFIER = ''22222222-0000-0000-0000-000000000040'';
DECLARE @admSettings  UNIQUEIDENTIFIER = ''22222222-0000-0000-0000-000000000050'';

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admDashboard)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admDashboard, NULL, N''Bảng điều khiển'', N''/dashboard'', N''LayoutDashboard'', 10, 1, 0, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admSystem)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admSystem, NULL, N''Hệ thống'', NULL, N''Settings'', 20, 1, 0, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admArticle)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admArticle, NULL, N''Nội dung'', NULL, N''FileText'', 30, 1, 0, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admReception)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admReception, NULL, N''Tiếp nhận'', NULL, N''Calendar'', 40, 1, 0, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admDoctors)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admDoctors, NULL, N''Bác sĩ'', NULL, N''Stethoscope'', 50, 1, 0, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admSettings)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admSettings, NULL, N''Cài đặt'', NULL, N''User'', 60, 1, 0, @sys, @now);

DECLARE @admSysMenus      UNIQUEIDENTIFIER = ''22222222-0000-0000-0000-000000000011'';
DECLARE @admSysPubMenus   UNIQUEIDENTIFIER = ''22222222-0000-0000-0000-000000000012'';
DECLARE @admSysCategories UNIQUEIDENTIFIER = ''22222222-0000-0000-0000-000000000013'';

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admSysMenus)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admSysMenus, @admSystem, N''Menu hệ thống'', N''/dashboard/system/menus'', N''Menu'', 10, 1, 0, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admSysPubMenus)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admSysPubMenus, @admSystem, N''Menu trang chủ'', N''/dashboard/system/public-menus'', N''Globe'', 20, 1, 0, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admSysCategories)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admSysCategories, @admSystem, N''Danh mục hệ thống'', N''/dashboard/system/categories'', N''LayoutGrid'', 30, 1, 0, @sys, @now);

DECLARE @admArtCategories UNIQUEIDENTIFIER = ''22222222-0000-0000-0000-000000000021'';
DECLARE @admArtContents   UNIQUEIDENTIFIER = ''22222222-0000-0000-0000-000000000022'';

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admArtCategories)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admArtCategories, @admArticle, N''Danh mục nội dung'', N''/dashboard/article/categories'', N''Grid3X3'', 10, 1, 0, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admArtContents)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admArtContents, @admArticle, N''Quản lý nội dung'', N''/dashboard/article/contents'', N''Newspaper'', 20, 1, 0, @sys, @now);

DECLARE @admBookings UNIQUEIDENTIFIER = ''22222222-0000-0000-0000-000000000041'';
DECLARE @admContacts UNIQUEIDENTIFIER = ''22222222-0000-0000-0000-000000000042'';

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admBookings)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admBookings, @admReception, N''Đặt lịch khám'', N''/dashboard/bookings'', N''Calendar'', 10, 1, 0, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admContacts)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admContacts, @admReception, N''Liên hệ'', N''/dashboard/contacts'', N''Mail'', 20, 1, 0, @sys, @now);

DECLARE @admDoctorList  UNIQUEIDENTIFIER = ''22222222-0000-0000-0000-000000000031'';
DECLARE @admDepartments UNIQUEIDENTIFIER = ''22222222-0000-0000-0000-000000000032'';

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admDoctorList)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admDoctorList, @admDoctors, N''Quản lý bác sĩ'', N''/dashboard/doctors'', N''Stethoscope'', 10, 1, 0, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admDepartments)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admDepartments, @admDoctors, N''Quản lý khoa'', N''/dashboard/doctors/departments'', N''Building2'', 20, 1, 0, @sys, @now);

DECLARE @admSetAccount UNIQUEIDENTIFIER = ''22222222-0000-0000-0000-000000000051'';
DECLARE @admSetWebsite UNIQUEIDENTIFIER = ''22222222-0000-0000-0000-000000000052'';

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admSetAccount)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admSetAccount, @admSettings, N''Tài khoản'', N''/dashboard/settings/account'', N''User'', 10, 1, 0, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @admSetWebsite)
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@admSetWebsite, @admSettings, N''Thông tin website'', N''/dashboard/settings/website'', N''Globe'', 20, 1, 0, @sys, @now);
';
EXEC sp_executesql @insertAdmSql;

-- ============================================================
-- 6. SEED: RoleMenus
--    Admin  -> tất cả menu admin
--    Editor -> Bảng điều khiển + Nội dung (parent + children)
-- ============================================================

DECLARE @insertRmSql NVARCHAR(MAX) = N'
DECLARE @now DATETIME2 = SYSUTCDATETIME();
DECLARE @sys NVARCHAR(100) = N''system'';

INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate)
SELECT NEWID(), N''Admin'', m.Id, 1, @sys, @now
FROM dbo.Menus m
WHERE m.[Type] = 0
  AND NOT EXISTS (
      SELECT 1 FROM dbo.RoleMenus rm
      WHERE rm.RoleId = N''Admin'' AND rm.MenuId = m.Id
  );

DECLARE @editorMenus TABLE (Id UNIQUEIDENTIFIER);
INSERT INTO @editorMenus VALUES
  (''22222222-0000-0000-0000-000000000001''),
  (''22222222-0000-0000-0000-000000000020''),
  (''22222222-0000-0000-0000-000000000021''),
  (''22222222-0000-0000-0000-000000000022'');

INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate)
SELECT NEWID(), N''Editor'', e.Id, 1, @sys, @now
FROM @editorMenus e
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.RoleMenus rm
    WHERE rm.RoleId = N''Editor'' AND rm.MenuId = e.Id
);
';
EXEC sp_executesql @insertRmSql;
