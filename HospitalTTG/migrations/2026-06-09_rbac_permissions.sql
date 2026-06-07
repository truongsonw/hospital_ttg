-- ============================================================
-- 2026-06-09: RBAC — Permissions and RolePermissions tables
--
--   This migration introduces the RBAC permission system:
--     1. Creates dbo.Permissions  (permission master list, optional)
--     2. Creates dbo.RolePermissions (role -> permission mapping)
--     3. Seeds permission master list
--     4. Seeds RolePermissions for all existing roles based on
--        their existing RoleMenus / business function.
--
--   Admin is granted ALL permissions via data, not hardcode.
--
--   Backward compatibility: RoleMenus table is preserved.
--   MenuAccessHandler falls back to RoleMenus if no RolePermissions
--   entry is found.
--
--   All scripts are idempotent (safe to re-run).
--   No FK constraints (per project convention).
-- ============================================================

SET NOCOUNT ON;

DECLARE @now DATETIME2 = SYSUTCDATETIME();
DECLARE @sys NVARCHAR(100) = N'system';

PRINT '=== Step 1: Create Permissions table ===';

IF OBJECT_ID('dbo.Permissions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Permissions (
        Id            UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        Name          NVARCHAR(200)    NOT NULL UNIQUE,
        Description   NVARCHAR(500)   NULL,
        CreatedBy     NVARCHAR(100)   NULL,
        CreatedDate  DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME()
    );
    PRINT 'Permissions table created.';
END
ELSE
BEGIN
    PRINT 'Permissions table already exists, skipping.';
END

PRINT '';
PRINT '=== Step 2: Create RolePermissions table ===';

IF OBJECT_ID('dbo.RolePermissions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.RolePermissions (
        Id           UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        RoleId       NVARCHAR(100)   NOT NULL,
        Permission   NVARCHAR(200)   NOT NULL,
        CreatedBy    NVARCHAR(100)   NULL,
        CreatedDate  DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UX_RolePermissions_RoleId_Permission UNIQUE (RoleId, Permission)
    );
    PRINT 'RolePermissions table created.';
END
ELSE
BEGIN
    PRINT 'RolePermissions table already exists, skipping.';
END

PRINT '';
PRINT '=== Step 3: Seed Permissions master list ===';

DECLARE @perms TABLE (Name NVARCHAR(200), Description NVARCHAR(500));
INSERT INTO @perms VALUES
  (N'dashboard.view',          N'Xem trang bảng điều khiển'),
  (N'user.manage',            N'Tạo, sửa, xóa, khóa người dùng'),
  (N'user.view',              N'Xem danh sách người dùng'),
  (N'role.manage',            N'Tạo, sửa vai trò và gán quyền'),
  (N'role.view',              N'Xem danh sách vai trò'),
  (N'menu.manage',            N'Quản lý menu hệ thống'),
  (N'public_menu.manage',     N'Quản lý menu công khai'),
  (N'category.manage',        N'Quản lý danh mục hệ thống và danh mục bài viết'),
  (N'article_content.manage', N'Tạo, sửa, xóa nội dung bài viết'),
  (N'article_media.manage',   N'Upload, xóa media cho bài viết'),
  (N'booking.manage',         N'Quản lý đặt lịch khám'),
  (N'contact.manage',         N'Quản lý liên hệ'),
  (N'doctor.manage',          N'Quản lý thông tin bác sĩ'),
  (N'department.manage',      N'Quản lý khoa/phòng'),
  (N'site_settings.manage',   N'Quản lý cài đặt website'),
  (N'storage.manage',        N'Upload, xóa tệp lưu trữ');

INSERT INTO dbo.Permissions (Id, Name, Description, CreatedBy, CreatedDate)
SELECT NEWID(), p.Name, p.Description, @sys, @now
FROM @perms p
WHERE NOT EXISTS (SELECT 1 FROM dbo.Permissions WHERE Name = p.Name);

PRINT 'Permissions seeded.';

PRINT '';
PRINT '=== Step 4: Seed RolePermissions ===';

-- ── Admin: all permissions ────────────────────────────────────
DECLARE @adminPerms TABLE (Permission NVARCHAR(200));
INSERT INTO @adminPerms VALUES
  (N'dashboard.view'), (N'user.manage'), (N'user.view'),
  (N'role.manage'), (N'role.view'),
  (N'menu.manage'), (N'public_menu.manage'),
  (N'category.manage'),
  (N'article_content.manage'), (N'article_media.manage'),
  (N'booking.manage'), (N'contact.manage'),
  (N'doctor.manage'), (N'department.manage'),
  (N'site_settings.manage'), (N'storage.manage');

INSERT INTO dbo.RolePermissions (Id, RoleId, Permission, CreatedBy, CreatedDate)
SELECT NEWID(), N'Admin', p.Permission, @sys, @now
FROM @adminPerms p
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.RolePermissions
    WHERE RoleId = N'Admin' AND Permission = p.Permission
);
PRINT 'Admin RolePermissions seeded.';

-- ── Editor: dashboard + article content ────────────────────────
DECLARE @editorPerms TABLE (Permission NVARCHAR(200));
INSERT INTO @editorPerms VALUES
  (N'dashboard.view'), (N'article_content.manage');

INSERT INTO dbo.RolePermissions (Id, RoleId, Permission, CreatedBy, CreatedDate)
SELECT NEWID(), N'Editor', p.Permission, @sys, @now
FROM @editorPerms p
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.RolePermissions
    WHERE RoleId = N'Editor' AND Permission = p.Permission
);
PRINT 'Editor RolePermissions seeded.';

-- ── User: dashboard only ──────────────────────────────────────
INSERT INTO dbo.RolePermissions (Id, RoleId, Permission, CreatedBy, CreatedDate)
SELECT NEWID(), N'User', N'dashboard.view', @sys, @now
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.RolePermissions
    WHERE RoleId = N'User' AND Permission = N'dashboard.view'
);
PRINT 'User RolePermissions seeded.';

-- ── Receptionist: dashboard + bookings + contacts ────────────
DECLARE @recepPerms TABLE (Permission NVARCHAR(200));
INSERT INTO @recepPerms VALUES
  (N'dashboard.view'), (N'booking.manage'), (N'contact.manage');

INSERT INTO dbo.RolePermissions (Id, RoleId, Permission, CreatedBy, CreatedDate)
SELECT NEWID(), N'Receptionist', p.Permission, @sys, @now
FROM @recepPerms p
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.RolePermissions
    WHERE RoleId = N'Receptionist' AND Permission = p.Permission
);
PRINT 'Receptionist RolePermissions seeded.';

-- ── Doctor: dashboard + doctor + department ──────────────────
DECLARE @doctorPerms TABLE (Permission NVARCHAR(200));
INSERT INTO @doctorPerms VALUES
  (N'dashboard.view'), (N'doctor.manage'), (N'department.manage');

INSERT INTO dbo.RolePermissions (Id, RoleId, Permission, CreatedBy, CreatedDate)
SELECT NEWID(), N'Doctor', p.Permission, @sys, @now
FROM @doctorPerms p
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.RolePermissions
    WHERE RoleId = N'Doctor' AND Permission = p.Permission
);
PRINT 'Doctor RolePermissions seeded.';

-- ── ContentManager: dashboard + system + article + settings ──
DECLARE @contentPerms TABLE (Permission NVARCHAR(200));
INSERT INTO @contentPerms VALUES
  (N'dashboard.view'),
  (N'menu.manage'), (N'public_menu.manage'),
  (N'category.manage'),
  (N'article_content.manage'), (N'article_media.manage'),
  (N'site_settings.manage');

INSERT INTO dbo.RolePermissions (Id, RoleId, Permission, CreatedBy, CreatedDate)
SELECT NEWID(), N'ContentManager', p.Permission, @sys, @now
FROM @contentPerms p
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.RolePermissions
    WHERE RoleId = N'ContentManager' AND Permission = p.Permission
);
PRINT 'ContentManager RolePermissions seeded.';

PRINT '';
PRINT '=== Summary ===';

DECLARE @permCount INT = (SELECT COUNT(*) FROM dbo.Permissions);
DECLARE @rpCount INT = (SELECT COUNT(*) FROM dbo.RolePermissions);

PRINT 'Permissions in master list:    ' + CAST(@permCount AS NVARCHAR(10));
PRINT 'RolePermissions rows:          ' + CAST(@rpCount AS NVARCHAR(10));

PRINT '';
PRINT '=== Done! ===';
GO
