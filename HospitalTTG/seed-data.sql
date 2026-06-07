-- ============================================================
-- HospitalTTG — Seed Script v2
-- Mục đích: Clean + seed đầy đủ Menus, Roles, RoleMenus, Users
-- Script idempotent — chạy lại nhiều lần an toàn.
-- ============================================================

SET NOCOUNT ON;

DECLARE @now DATETIME2 = SYSUTCDATETIME();
DECLARE @sys NVARCHAR(100) = N'system';

PRINT '=== Step 1: Clean RoleMenus ===';
DELETE FROM dbo.RoleMenus;

PRINT '=== Step 2: Clean Users ===';
DELETE FROM dbo.Users;

PRINT '=== Step 3: Clean Roles ===';
DELETE FROM dbo.Roles;

PRINT '=== Step 4: Clean Admin Menus (Type=0) ===';
DELETE FROM dbo.Menus WHERE [Type] = 0;

PRINT '=== Step 5: Seed Roles ===';

INSERT INTO dbo.Roles (Id, Name, Description, IsActive, CreatedBy, CreatedDate)
VALUES
  (N'Admin',           N'Quản trị viên',          N'Toàn quyền hệ thống',                                  1, @sys, @now),
  (N'Editor',          N'Biên tập viên',          N'Quản lý nội dung bài viết, không sửa hệ thống',        1, @sys, @now),
  (N'User',            N'Người dùng',             N'Tài khoản thường, chỉ xem nội dung công khai',          1, @sys, @now),
  (N'Receptionist',   N'Lễ tân',                 N'Tiếp nhận bệnh nhân, quản lý đặt lịch và liên hệ',     1, @sys, @now),
  (N'Doctor',          N'Bác sĩ',                 N'Quản lý thông tin bác sĩ và khoa',                      1, @sys, @now),
  (N'ContentManager', N'Trang chủ',              N'Quản lý menu công khai và nội dung trang chủ',          1, @sys, @now);

PRINT '=== Step 6: Seed Admin Menus (Type=0) ===';

-- Parent menus
DECLARE @mDashboard   UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000001';
DECLARE @mSystem      UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000010';
DECLARE @mArticle     UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000020';
DECLARE @mReception   UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000040';
DECLARE @mDoctor      UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000030';
DECLARE @mSettings    UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000050';

-- System children
DECLARE @mSysMenu     UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000011';
DECLARE @mSysPubMenu  UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000012';
DECLARE @mSysCate     UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000013';
DECLARE @mSysUsers    UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000014';
DECLARE @mSysRoles    UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000015';

-- Article children
DECLARE @mArtCate     UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000021';
DECLARE @mArtContent  UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000022';

-- Reception children
DECLARE @mBooking     UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000041';
DECLARE @mContact     UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000042';

-- Doctor children
DECLARE @mDoctorList  UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000031';
DECLARE @mDept        UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000032';

-- Settings children
DECLARE @mSetAccount  UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000051';
DECLARE @mSetWebsite  UNIQUEIDENTIFIER = '22222222-0000-0000-0000-000000000052';

-- Parent: Bảng điều khiển
INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
VALUES (@mDashboard, NULL, N'Bảng điều khiển', N'/dashboard', N'LayoutDashboard', 10, 1, 0, @sys, @now);

-- Parent: Hệ thống
INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
VALUES (@mSystem, NULL, N'Hệ thống', NULL, N'Settings', 20, 1, 0, @sys, @now);

-- Parent: Nội dung
INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
VALUES (@mArticle, NULL, N'Nội dung', NULL, N'FileText', 30, 1, 0, @sys, @now);

-- Parent: Tiếp nhận
INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
VALUES (@mReception, NULL, N'Tiếp nhận', NULL, N'Calendar', 40, 1, 0, @sys, @now);

-- Parent: Bác sĩ
INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
VALUES (@mDoctor, NULL, N'Bác sĩ', NULL, N'Stethoscope', 50, 1, 0, @sys, @now);

-- Parent: Cài đặt
INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
VALUES (@mSettings, NULL, N'Cài đặt', NULL, N'Settings', 60, 1, 0, @sys, @now);

-- Children: Hệ thống
INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
VALUES
  (@mSysMenu,   @mSystem, N'Menu hệ thống',                N'/dashboard/system/menus',         N'Menu',        10, 1, 0, @sys, @now),
  (@mSysPubMenu, @mSystem, N'Menu trang chủ',              N'/dashboard/system/public-menus', N'Globe',       20, 1, 0, @sys, @now),
  (@mSysCate,   @mSystem, N'Danh mục hệ thống',            N'/dashboard/system/categories',   N'LayoutGrid',  30, 1, 0, @sys, @now),
  (@mSysUsers,  @mSystem, N'Quản lý tài khoản người dùng', N'/dashboard/users',               N'User',        40, 1, 0, @sys, @now),
  (@mSysRoles,  @mSystem, N'Quản lý vai trò',              N'/dashboard/roles',               N'Users',       50, 1, 0, @sys, @now);

-- Children: Nội dung
INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
VALUES
  (@mArtCate,   @mArticle, N'Danh mục nội dung', N'/dashboard/article/categories', N'Grid3X3',   10, 1, 0, @sys, @now),
  (@mArtContent, @mArticle, N'Quản lý nội dung',   N'/dashboard/article/contents',  N'Newspaper',  20, 1, 0, @sys, @now);

-- Children: Tiếp nhận
INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
VALUES
  (@mBooking, @mReception, N'Đặt lịch khám', N'/dashboard/bookings', N'Calendar', 10, 1, 0, @sys, @now),
  (@mContact, @mReception, N'Liên hệ',        N'/dashboard/contacts', N'Mail',     20, 1, 0, @sys, @now);

-- Children: Bác sĩ
INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
VALUES
  (@mDoctorList, @mDoctor, N'Quản lý bác sĩ', N'/dashboard/doctors',              N'Stethoscope', 10, 1, 0, @sys, @now),
  (@mDept,      @mDoctor, N'Quản lý khoa',    N'/dashboard/doctors/departments',  N'Building2',   20, 1, 0, @sys, @now);

-- Children: Cài đặt
INSERT INTO dbo.Menus (Id, ParentId, Title, Url, Icon, SortOrder, IsActive, [Type], CreatedBy, CreatedDate)
VALUES
  (@mSetAccount, @mSettings, N'Tài khoản',        N'/dashboard/settings/account',  N'User',  10, 1, 0, @sys, @now),
  (@mSetWebsite, @mSettings, N'Thông tin website',  N'/dashboard/settings/website',  N'Globe', 20, 1, 0, @sys, @now);

PRINT '=== Step 7: Seed RoleMenus ===';

-- Admin: full access (all 19 menus)
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Admin', @mDashboard, 1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Admin', @mSystem,    1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Admin', @mArticle,   1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Admin', @mReception, 1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Admin', @mDoctor,    1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Admin', @mSettings,  1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Admin', @mSysMenu,   1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Admin', @mSysPubMenu,1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Admin', @mSysCate,   1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Admin', @mSysUsers,  1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Admin', @mSysRoles,  1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Admin', @mArtCate,   1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Admin', @mArtContent,1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Admin', @mBooking,   1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Admin', @mContact,   1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Admin', @mDoctorList,1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Admin', @mDept,      1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Admin', @mSetAccount,1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Admin', @mSetWebsite,1, @sys, @now);

-- Editor: Dashboard + Nội dung
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Editor', @mDashboard,  1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Editor', @mArticle,    1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Editor', @mArtCate,    1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Editor', @mArtContent, 1, @sys, @now);

-- Receptionist: Dashboard + Tiếp nhận
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Receptionist', @mDashboard,  1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Receptionist', @mReception,  1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Receptionist', @mBooking,    1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Receptionist', @mContact,    1, @sys, @now);

-- Doctor: Dashboard + Bác sĩ
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Doctor', @mDashboard,  1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Doctor', @mDoctor,     1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Doctor', @mDoctorList, 1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'Doctor', @mDept,       1, @sys, @now);

-- ContentManager: Dashboard + Hệ thống + Nội dung
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'ContentManager', @mDashboard,  1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'ContentManager', @mSystem,     1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'ContentManager', @mSysMenu,    1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'ContentManager', @mSysPubMenu, 1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'ContentManager', @mSysCate,    1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'ContentManager', @mArticle,    1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'ContentManager', @mArtCate,    1, @sys, @now);
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'ContentManager', @mArtContent, 1, @sys, @now);

-- User: Dashboard only
INSERT INTO dbo.RoleMenus (Id, RoleId, MenuId, CanView, CreatedBy, CreatedDate) VALUES (NEWID(), N'User', @mDashboard, 1, @sys, @now);

PRINT '=== Step 8: Seed Test Users ===';

INSERT INTO dbo.Users (Id, Username, Email, FullName, [PasswordHash], [Role], IsActive, CreatedBy, CreatedAt)
VALUES (NEWID(), N'admin',        N'admin@hospital-ttg.local',        N'Quản trị viên',        N'$2a$11$x9O/NLWwCm0QGjQaSOaSaOHrjpXe.Cls1Z/CSuHcGigdKB4wlK6Fu', N'Admin',           1, @sys, @now);

INSERT INTO dbo.Users (Id, Username, Email, FullName, [PasswordHash], [Role], IsActive, CreatedBy, CreatedAt)
VALUES (NEWID(), N'editor',       N'editor@hospital-ttg.local',       N'Biên tập viên',       N'$2a$11$vdqH6ipNhqCHn4FjGAByr.2NJVL3GWcfFsv6B4MHT3e8MUGVVUFt.', N'Editor',          1, @sys, @now);

INSERT INTO dbo.Users (Id, Username, Email, FullName, [PasswordHash], [Role], IsActive, CreatedBy, CreatedAt)
VALUES (NEWID(), N'receptionist', N'receptionist@hospital-ttg.local', N'Nhân viên lễ tân',    N'$2a$11$7.m1CUshPInqh/GTvfteuO1f8MKyRotxrQMVofWpliL1b6A2QOrRy', N'Receptionist',    1, @sys, @now);

INSERT INTO dbo.Users (Id, Username, Email, FullName, [PasswordHash], [Role], IsActive, CreatedBy, CreatedAt)
VALUES (NEWID(), N'doctor',       N'doctor@hospital-ttg.local',       N'Bác sĩ',               N'$2a$11$Ns0esdecT3ehh3NVNF0oIuCdnoExlI7mxne.PVXVjaGLd1f7xjFyi', N'Doctor',          1, @sys, @now);

INSERT INTO dbo.Users (Id, Username, Email, FullName, [PasswordHash], [Role], IsActive, CreatedBy, CreatedAt)
VALUES (NEWID(), N'content',      N'content@hospital-ttg.local',      N'Trang chủ',            N'$2a$11$DInJqdcrdvAjb1dbiaXLluoAb9Ol0fQ.37nhImFkjm5.AVI1frBIa', N'ContentManager',  1, @sys, @now);

INSERT INTO dbo.Users (Id, Username, Email, FullName, [PasswordHash], [Role], IsActive, CreatedBy, CreatedAt)
VALUES (NEWID(), N'user',         N'user@hospital-ttg.local',         N'Người dùng',           N'$2a$11$Y5SqJAyzyH4NKEVuhAokquW.iaXiW8efWNRHwLhIptvuqQMTXjZTW', N'User',            1, @sys, @now);

INSERT INTO dbo.Users (Id, Username, Email, FullName, [PasswordHash], [Role], IsActive, CreatedBy, CreatedAt)
VALUES (NEWID(), N'sonnct',      N'truongson009385@gmail.com',      N'Sơn Trường',            N'$2a$11$Llyml14lbsI7T4bQNpkllOTZ1wXEI1yD8v5ibGn.Ru/Io8PtqPMR2', N'Admin',           1, @sys, @now);

PRINT '';
PRINT '=== Summary ===';

DECLARE @roleCount INT = (SELECT COUNT(*) FROM dbo.Roles);
DECLARE @menuCount INT = (SELECT COUNT(*) FROM dbo.Menus WHERE [Type] = 0);
DECLARE @roleMenuCount INT = (SELECT COUNT(*) FROM dbo.RoleMenus);
DECLARE @userCount INT = (SELECT COUNT(*) FROM dbo.Users);

PRINT 'Roles created:           ' + CAST(@roleCount AS NVARCHAR(10));
PRINT 'Admin Menus created:     ' + CAST(@menuCount AS NVARCHAR(10));
PRINT 'RoleMenus created:       ' + CAST(@roleMenuCount AS NVARCHAR(10));
PRINT 'Users created:           ' + CAST(@userCount AS NVARCHAR(10));
PRINT '';
PRINT '=== Done! ===';
GO
