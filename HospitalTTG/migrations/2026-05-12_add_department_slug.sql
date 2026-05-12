-- Migration: Add Slug column to Departments table
-- Adds a human-readable slug for department detail/filter URLs instead of using Guid IDs.
-- Idempotent: safe to re-run.

SET NOCOUNT ON;

-- Step 1: Add column if missing
IF COL_LENGTH('dbo.Departments', 'Slug') IS NULL
BEGIN
    ALTER TABLE dbo.Departments ADD Slug NVARCHAR(500) NOT NULL DEFAULT '';
    PRINT N'[Step 1] Column Slug added.';
END
ELSE
    PRINT N'[Step 1] Column Slug already exists.';

-- Step 2: Create unique filtered index (requires QUOTED_IDENTIFIER ON)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Departments_Slug' AND object_id = OBJECT_ID('dbo.Departments'))
BEGIN
    EXEC('SET QUOTED_IDENTIFIER ON; CREATE UNIQUE INDEX IX_Departments_Slug ON dbo.Departments (Slug) WHERE Slug <> '''';');
    PRINT N'[Step 2] Index IX_Departments_Slug created.';
END
ELSE
    PRINT N'[Step 2] Index IX_Departments_Slug already exists.';

-- Step 3: Seed Slug for existing departments (basic slug from Name)
DECLARE @BatchSize INT = 100;
DECLARE @Updated INT = 1;
DECLARE @iter INT = 0;

WHILE @Updated > 0 AND @iter < 50
BEGIN
    UPDATE TOP (@BatchSize) dbo.Departments
    SET Slug = LOWER(REPLACE(Name, ' ', '-'))
    WHERE Slug = '' OR Slug IS NULL;

    SET @Updated = @@ROWCOUNT;
    SET @iter = @iter + 1;
END;

PRINT N'[Step 3] Slug seeded for ' + CAST(@iter AS NVARCHAR(10)) + N' batches.';

-- Verify
DECLARE @Seeded INT, @Empty INT;
SELECT @Seeded = COUNT(*) FROM dbo.Departments WHERE Slug <> '';
SELECT @Empty = COUNT(*) FROM dbo.Departments WHERE Slug = '' OR Slug IS NULL;
PRINT N'[Result] Seeded: ' + CAST(@Seeded AS NVARCHAR(10)) + N' | Empty: ' + CAST(@Empty AS NVARCHAR(10)) + N'.';
