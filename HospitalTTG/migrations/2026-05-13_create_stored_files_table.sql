-- ============================================================
-- STORAGE MODULE: Create StoredFiles table
-- ============================================================

USE HospitalTTG;
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'StoredFiles' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.StoredFiles (
        Id               UNIQUEIDENTIFIER    NOT NULL DEFAULT NEWID(),
        StoredFileName   NVARCHAR(200)      NOT NULL,
        OriginalFileName NVARCHAR(500)      NOT NULL,
        ContentType      NVARCHAR(200)      NOT NULL,
        FileSize         BIGINT              NOT NULL,
        PhysicalPath     NVARCHAR(1000)     NOT NULL,
        CreatedAt        DATETIME2           NOT NULL,
        UpdatedAt        DATETIME2           NULL,
        CreatedBy       NVARCHAR(MAX)       NULL,
        UpdatedBy        NVARCHAR(MAX)       NULL,
        CONSTRAINT PK_StoredFiles PRIMARY KEY (Id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_StoredFiles_StoredFileName' AND object_id = OBJECT_ID('dbo.StoredFiles'))
    CREATE UNIQUE INDEX IX_StoredFiles_StoredFileName ON dbo.StoredFiles (StoredFileName);
GO
