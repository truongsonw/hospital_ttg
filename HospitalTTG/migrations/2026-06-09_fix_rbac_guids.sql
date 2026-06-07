-- ============================================================
-- Fix GUID mismatch between seed-data.sql (33333333-...)
-- and 2026-05-04 migration (22222222-...) for Admin menus (Type=0).
-- Only inserts missing RoleMenus; does not delete existing data.
-- Idempotent — safe to re-run.
-- ============================================================

SET NOCOUNT ON;

DECLARE @now DATETIME2 = SYSUTCDATETIME();
DECLARE @sys NVARCHAR(100) = N'system';

-- Admin menu GUIDs from 2026-05-04 migration (actual database IDs)
DECLARE @Dashboard    UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000001';
DECLARE @System       UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000010';
DECLARE @SysMenus     UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000011';
DECLARE @SysPubMenus  UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000012';
DECLARE @SysCate      UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000013';
DECLARE @Article      UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000020';
DECLARE @ArtCate      UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000021';
DECLARE @ArtContent   UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000022';
DECLARE @Doctor       UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000030';
DECLARE @DoctorList   UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000031';
DECLARE @Departments  UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000032';
DECLARE @Reception    UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000040';
DECLARE @Booking      UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000041';
DECLARE @Contact      UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000042';
DECLARE @Settings     UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000050';
DECLARE @SetWebsite   UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000052';

-- Role -> Admin menus mapping
DECLARE @roleMenus TABLE (RoleId NVARCHAR(100), MenuId UNIQUEIDENTIFIER);

INSERT INTO @roleMenus VALUES
  -- Admin: all admin menus
  (N'Admin', @Dashboard),
  (N'Admin', @System),
  (N'Admin', @Article),
  (N'Admin', @Reception),
  (N'Admin', @Doctor),
  (N'Admin', @Settings),
  (N'Admin', @SysMenus),
  (N'Admin', @SysPubMenus),
  (N'Admin', @SysCate),
  (N'Admin', @ArtCate),
  (N'Admin', @ArtContent),
  (N'Admin', @Booking),
  (N'Admin', @Contact),
  (N'Admin', @DoctorList),
  (N'Admin', @Departments),
  (N'Admin', @SetWebsite),

  -- Editor: Dashboard + Nội dung
  (N'Editor', @Dashboard),
  (N'Editor', @Article),
  (N'Editor', @ArtCate),
  (N'Editor', @ArtContent),

  -- Receptionist: Dashboard + Tiếp nhận (parent group) + bookings + contacts
  (N'Receptionist', @Dashboard),
  (N'Receptionist', @Reception),
  (N'Receptionist', @Booking),
  (N'Receptionist', @Contact),

  -- Doctor: Dashboard + Bác sĩ (parent group) + doctors list + departments
  (N'Doctor', @Dashboard),
  (N'Doctor', @Doctor),
  (N'Doctor', @DoctorList),
  (N'Doctor', @Departments),

  -- ContentManager: Dashboard + Hệ thống + Nội dung + Settings website
  (N'ContentManager', @Dashboard),
  (N'ContentManager', @System),
  (N'ContentManager', @Article),
  (N'ContentManager', @Settings),
  (N'ContentManager', @SysMenus),
  (N'ContentManager', @SysPubMenus),
  (N'ContentManager', @SysCate),
  (N'ContentManager', @ArtCate),
  (N'ContentManager', @ArtContent),
  (N'ContentManager', @SetWebsite),

  -- User: Dashboard only
  (N'User', @Dashboard);

-- Ensure roles exist
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Id = N'Admin')
    INSERT INTO dbo.Roles (Id, Name, Description, IsActive, CreatedBy, CreatedDate)
    VALUES (N'Admin', N'Quản trị viên', N'Toàn quyền hệ thống', 1, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Id = N'Editor')
    INSERT INTO dbo.Roles (Id, Name, Description, IsActive, CreatedBy, CreatedDate)
    VALUES (N'Editor', N'Biên tập viên', N'Quản lý nội dung bài viết, không sửa hệ thống', 1, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Id = N'User')
    INSERT INTO dbo.Roles (Id, Name, Description, IsActive, CreatedBy, CreatedDate)
    VALUES (N'User', N'Người dùng', N'Tài khoản thường, không truy cập dashboard', 1, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Id = N'Receptionist')
    INSERT INTO dbo.Roles (Id, Name, Description, IsActive, CreatedBy, CreatedDate)
    VALUES (N'Receptionist', N'Nhân viên lễ tân', N'Tiếp nhận và quản lý đặt lịch, liên hệ', 1, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Id = N'Doctor')
    INSERT INTO dbo.Roles (Id, Name, Description, IsActive, CreatedBy, CreatedDate)
    VALUES (N'Doctor', N'Bác sĩ', N'Quản lý bác sĩ và khoa', 1, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Id = N'ContentManager')
    INSERT INTO dbo.Roles (Id, Name, Description, IsActive, CreatedBy, CreatedDate)
    VALUES (N'ContentManager', N'Quản lý nội dung', N'Quản lý nội dung, danh mục hệ thống, cài đặt website', 1, @sys, @now);

-- Seed RoleMenus (insert only if not exists)
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate)
SELECT NEWID(), RoleId, MenuId, 1, @sys, @now
FROM @roleMenus m
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.RoleMenus rm
    WHERE rm.RoleId = m.RoleId AND rm.MenuId = m.MenuId
);

PRINT '=== Summary ===';

DECLARE @roleMenuCount INT = (SELECT COUNT(*) FROM dbo.RoleMenus);
DECLARE @roleCount INT = (SELECT COUNT(*) FROM dbo.Roles);
DECLARE @menuCount INT = (SELECT COUNT(*) FROM dbo.Menus WHERE [Type] = 0);

PRINT 'Roles in DB:            ' + CAST(@roleCount AS NVARCHAR(10));
PRINT 'Admin Menus in DB:      ' + CAST(@menuCount AS NVARCHAR(10));
PRINT 'RoleMenus total:        ' + CAST(@roleMenuCount AS NVARCHAR(10));

-- Verify Receptionist /dashboard/doctors policy
PRINT '';
PRINT '=== Receptionist DoctorManagement check ===';
DECLARE @recepDoctorAccess BIT = CASE WHEN EXISTS (
    SELECT 1 FROM dbo.RoleMenus rm
    JOIN dbo.Menus m ON m.Id = rm.MenuId
    WHERE rm.RoleId = N'Receptionist' AND rm.CanView = 1
      AND m.Url = N'/dashboard/doctors'
) THEN 1 ELSE 0 END;
PRINT 'Receptionist can access /dashboard/doctors: ' + CASE @recepDoctorAccess WHEN 1 THEN 'YES (BUG!)' ELSE 'NO (correct)' END;

PRINT '';
PRINT '=== Done! ===';
GO
