-- ============================================================
-- 2026-06-07: Menu-based RBAC authorization
--   1. Seed RoleMenus for Receptionist, Doctor, ContentManager, User
--      to match the new MenuAccess policies registered in
--      Modules.Auth.Extensions.cs.
--
--   This ensures backend authorization policies map correctly:
--     Policy "MenuAccess:/dashboard/bookings"       -> Receptionist
--     Policy "MenuAccess:/dashboard/contacts"       -> Receptionist
--     Policy "MenuAccess:/dashboard/doctors"        -> Doctor
--     Policy "MenuAccess:/dashboard/doctors/departments" -> Doctor
--     Policy "MenuAccess:/dashboard/settings/website" -> Admin (via UserManagementPolicy)
--     Policy "MenuAccess:/dashboard/settings/website" -> ContentManager
--
--   All scripts are idempotent (safe to re-run).
--   No FK constraints (per project convention).
-- ============================================================

SET NOCOUNT ON;

DECLARE @now DATETIME2 = SYSUTCDATETIME();
DECLARE @sys NVARCHAR(100) = N'system';

-- Menu IDs (must match the GUIDs in 2026-05-04_menu_management.sql)
DECLARE @admSetWebsite UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000052';

PRINT '=== Step 1: Seed RoleMenus for Receptionist ===';

-- Receptionist: Dashboard + Tiếp nhận (parent group) + bookings + contacts
DECLARE @recepMenus TABLE (Id UNIQUEIDENTIFIER, MenuKey NVARCHAR(100));
INSERT INTO @recepMenus VALUES
  ('22222222-0000-0000-0000-000000000001', N'Dashboard'),
  ('22222222-0000-0000-0000-000000000040', N'Reception parent'),
  ('22222222-0000-0000-0000-000000000041', N'Bookings'),
  ('22222222-0000-0000-0000-000000000042', N'Contacts');

INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate)
SELECT NEWID(), N'Receptionist', m.Id, 1, @sys, @now
FROM @recepMenus m
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.RoleMenus rm
    WHERE rm.RoleId = N'Receptionist' AND rm.MenuId = m.Id
);

PRINT '=== Step 2: Seed RoleMenus for Doctor ===';

-- Doctor: Dashboard + Bác sĩ (parent group) + doctors list + departments
DECLARE @doctorMenus TABLE (Id UNIQUEIDENTIFIER, MenuKey NVARCHAR(100));
INSERT INTO @doctorMenus VALUES
  ('22222222-0000-0000-0000-000000000001', N'Dashboard'),
  ('22222222-0000-0000-0000-000000000030', N'Doctor parent'),
  ('22222222-0000-0000-0000-000000000031', N'Doctor list'),
  ('22222222-0000-0000-0000-000000000032', N'Departments');

INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate)
SELECT NEWID(), N'Doctor', m.Id, 1, @sys, @now
FROM @doctorMenus m
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.RoleMenus rm
    WHERE rm.RoleId = N'Doctor' AND rm.MenuId = m.Id
);

PRINT '=== Step 3: Seed RoleMenus for ContentManager ===';

-- ContentManager: Dashboard + Hệ thống + Nội dung + Thông tin website
DECLARE @contentMenus TABLE (Id UNIQUEIDENTIFIER, MenuKey NVARCHAR(100));
INSERT INTO @contentMenus VALUES
  ('22222222-0000-0000-0000-000000000001', N'Dashboard'),
  ('22222222-0000-0000-0000-000000000010', N'System parent'),
  ('22222222-0000-0000-0000-000000000011', N'Sys menus'),
  ('22222222-0000-0000-0000-000000000012', N'Sys pub menus'),
  ('22222222-0000-0000-0000-000000000013', N'Sys categories'),
  ('22222222-0000-0000-0000-000000000020', N'Article parent'),
  ('22222222-0000-0000-0000-000000000021', N'Article categories'),
  ('22222222-0000-0000-0000-000000000022', N'Article contents'),
  ('22222222-0000-0000-0000-000000000052', N'Settings website');

INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate)
SELECT NEWID(), N'ContentManager', m.Id, 1, @sys, @now
FROM @contentMenus m
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.RoleMenus rm
    WHERE rm.RoleId = N'ContentManager' AND rm.MenuId = m.Id
);

PRINT '=== Step 4: Seed RoleMenus for User (dashboard only) ===';

-- User: Dashboard only — already seeded in seed-data.sql, idempotent check below
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate)
SELECT NEWID(), N'User', m.Id, 1, @sys, @now
FROM dbo.Menus m
WHERE m.Id = '22222222-0000-0000-0000-000000000001'
  AND NOT EXISTS (
      SELECT 1 FROM dbo.RoleMenus rm
      WHERE rm.RoleId = N'User' AND rm.MenuId = m.Id
  );

PRINT '=== Step 5: Seed Roles for Receptionist/Doctor/ContentManager/User ===';

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Id = N'Receptionist')
    INSERT INTO dbo.Roles (Id, Name, Description, IsActive, CreatedBy, CreatedDate)
    VALUES (N'Receptionist', N'Nhân viên lễ tân', N'Tiếp nhận và quản lý đặt lịch, liên hệ', 1, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Id = N'Doctor')
    INSERT INTO dbo.Roles (Id, Name, Description, IsActive, CreatedBy, CreatedDate)
    VALUES (N'Doctor', N'Bác sĩ', N'Quản lý bác sĩ và khoa', 1, @sys, @now);

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Id = N'ContentManager')
    INSERT INTO dbo.Roles (Id, Name, Description, IsActive, CreatedBy, CreatedDate)
    VALUES (N'ContentManager', N'Quản lý nội dung', N'Quản lý nội dung, danh mục hệ thống, cài đặt website', 1, @sys, @now);

PRINT '=== Summary ===';

DECLARE @roleMenuCount INT = (SELECT COUNT(*) FROM dbo.RoleMenus);
DECLARE @roleCount INT = (SELECT COUNT(*) FROM dbo.Roles);

PRINT 'Roles seeded:           ' + CAST(@roleCount AS NVARCHAR(10));
PRINT 'RoleMenus total:       ' + CAST(@roleMenuCount AS NVARCHAR(10));

PRINT '';
PRINT '=== Done! ===';
GO
