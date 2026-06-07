-- ============================================================
-- 2026-06-07: Backfill missing admin dashboard menus
--
-- Mục đích:
--   Bổ sung các menu admin còn thiếu trong DB để đồng bộ với
--   dashboard routes/frontend quick links hiện tại.
--
-- Hiện phát hiện thiếu tối thiểu:
--   - /dashboard/users
--   - /dashboard/roles
--
-- Script idempotent — chạy lại nhiều lần an toàn.
-- Không thêm FK constraints.
-- ============================================================

SET NOCOUNT ON;

DECLARE @now DATETIME2 = SYSUTCDATETIME();
DECLARE @sys NVARCHAR(100) = N'system';

PRINT '=== Step 1: Ensure parent menus exist ===';

DECLARE @mSystem    UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000010';
DECLARE @mSettings  UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000050';

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @mSystem)
BEGIN
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@mSystem, NULL, N'Hệ thống', NULL, N'Settings', 20, 1, 0, @sys, @now);
END

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @mSettings)
BEGIN
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@mSettings, NULL, N'Cài đặt', NULL, N'Settings', 60, 1, 0, @sys, @now);
END

PRINT '=== Step 2: Upsert missing child menus ===';

DECLARE @mUsers UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000014';
DECLARE @mRoles UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000015';

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @mUsers)
BEGIN
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@mUsers, @mSystem, N'Quản lý tài khoản người dùng', N'/dashboard/users', N'User', 40, 1, 0, @sys, @now);
END
ELSE
BEGIN
    UPDATE dbo.Menus
    SET ParentId = @mSystem,
        Title = N'Quản lý tài khoản người dùng',
        Url = N'/dashboard/users',
        Icon = N'User',
        SortOrder = 40,
        IsActive = 1,
        [Type] = 0
    WHERE Id = @mUsers;
END

IF NOT EXISTS (SELECT 1 FROM dbo.Menus WHERE Id = @mRoles)
BEGIN
    INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
    VALUES (@mRoles, @mSystem, N'Quản lý vai trò', N'/dashboard/roles', N'Users', 50, 1, 0, @sys, @now);
END
ELSE
BEGIN
    UPDATE dbo.Menus
    SET ParentId = @mSystem,
        Title = N'Quản lý vai trò',
        Url = N'/dashboard/roles',
        Icon = N'Users',
        SortOrder = 50,
        IsActive = 1,
        [Type] = 0
    WHERE Id = @mRoles;
END

PRINT '=== Step 3: Grant missing menus to Admin role ===';

DECLARE @adminMenus TABLE (MenuId UNIQUEIDENTIFIER);
INSERT INTO @adminMenus (MenuId)
VALUES (@mUsers), (@mRoles);

INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate)
SELECT NEWID(), N'Admin', am.MenuId, 1, @sys, @now
FROM @adminMenus am
WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.RoleMenus rm
    WHERE rm.RoleId = N'Admin'
      AND rm.MenuId = am.MenuId
);

PRINT '=== Summary ===';
PRINT 'Backfilled missing admin menus: /dashboard/users, /dashboard/roles';
PRINT '=== Done! ===';
GO
