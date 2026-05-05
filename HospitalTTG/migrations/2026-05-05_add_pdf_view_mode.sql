-- Migration: Add PdfViewMode column to Contents table
-- Date: 2026-05-05
-- Description: Add PdfViewMode field to allow admin to configure PDF display mode (open in new tab or download only)

IF COL_LENGTH('dbo.Contents', 'PdfViewMode') IS NULL
BEGIN
    ALTER TABLE dbo.Contents ADD PdfViewMode NVARCHAR(50) NULL;
    PRINT 'Column PdfViewMode added to Contents table.';
END
ELSE
BEGIN
    PRINT 'Column PdfViewMode already exists in Contents table.';
END
GO
