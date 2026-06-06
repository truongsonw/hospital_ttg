-- Migration: Add Email and Note columns to Bookings table
-- Adds patient email (nullable) for booking confirmations and fixes Note schema drift.
-- Idempotent: safe to re-run.

USE HospitalTTG;
GO

SET NOCOUNT ON;
GO

IF COL_LENGTH('dbo.Bookings', 'Email') IS NULL
BEGIN
    ALTER TABLE dbo.Bookings ADD Email NVARCHAR(256) NULL;
    PRINT N'[Step 1] Column Email added.';
END
ELSE
    PRINT N'[Step 1] Column Email already exists.';
GO

IF COL_LENGTH('dbo.Bookings', 'Note') IS NULL
BEGIN
    ALTER TABLE dbo.Bookings ADD Note NVARCHAR(1000) NULL;
    PRINT N'[Step 2] Column Note added.';
END
ELSE
    PRINT N'[Step 2] Column Note already exists.';
GO
