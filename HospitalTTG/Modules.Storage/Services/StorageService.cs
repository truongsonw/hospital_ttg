using Contracts.Storage.DTOs;
using Contracts.Storage.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Modules.Storage.Entities;
using Modules.Storage.Repositories;
using Shared.Abstractions.Exceptions;
using Shared.Abstractions.Interfaces;

namespace Modules.Storage.Services;

public class StorageService : IStorageService
{
    private readonly IStoredFileRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly string _basePath;
    private readonly string[] _allowedExtensions;
    private readonly long _maxFileSizeBytes;

    public StorageService(IStoredFileRepository repository, IUnitOfWork unitOfWork, IConfiguration configuration)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _basePath = configuration["Storage:BasePath"] ?? "uploads";
        _allowedExtensions = configuration.GetSection("Storage:AllowedExtensions").Get<string[]>()
            ?? [".jpg", ".jpeg", ".png", ".gif", ".pdf", ".doc", ".docx", ".xls", ".xlsx"];
        var maxMb = configuration.GetValue<int>("Storage:MaxFileSizeMb", 10);
        _maxFileSizeBytes = maxMb * 1024L * 1024L;
    }

    public async Task<FileDto> UploadAsync(IFormFile file, CancellationToken ct = default)
    {
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!_allowedExtensions.Contains(extension))
            throw new ValidationException(new Dictionary<string, string[]>
            {
                { "File", [$"Extension '{extension}' is not allowed."] }
            });

        if (file.Length > _maxFileSizeBytes)
            throw new ValidationException(new Dictionary<string, string[]>
            {
                { "File", [$"File size exceeds the maximum allowed size of {_maxFileSizeBytes / 1024 / 1024} MB."] }
            });

        Directory.CreateDirectory(_basePath);

        var storedFileName = $"{Guid.NewGuid()}{extension}";
        var physicalPath = Path.Combine(_basePath, storedFileName);

        await using var stream = new FileStream(physicalPath, FileMode.Create, FileAccess.Write);
        await file.CopyToAsync(stream, ct);

        var storedFile = new StoredFile
        {
            StoredFileName = storedFileName,
            OriginalFileName = file.FileName,
            ContentType = file.ContentType,
            FileSize = file.Length,
            PhysicalPath = physicalPath
        };

        await _repository.AddAsync(storedFile, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return MapToDto(storedFile);
    }

    public async Task<FileDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var file = await _repository.GetByIdAsync(id, ct);
        if (file == null)
            throw new NotFoundException(nameof(StoredFile), id);

        return MapToDto(file);
    }

    public async Task<IReadOnlyList<FileDto>> GetAllAsync(CancellationToken ct = default)
    {
        var files = await _repository.GetAllAsync(ct);
        return files.Select(MapToDto).ToList();
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var file = await _repository.GetByIdAsync(id, ct);
        if (file == null)
            throw new NotFoundException(nameof(StoredFile), id);

        if (File.Exists(file.PhysicalPath))
            File.Delete(file.PhysicalPath);

        _repository.Delete(file);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    public async Task<(Stream Stream, string ContentType, string FileName)> DownloadAsync(Guid id, CancellationToken ct = default)
    {
        var file = await _repository.GetByIdAsync(id, ct);
        if (file == null)
            throw new NotFoundException(nameof(StoredFile), id);

        if (!File.Exists(file.PhysicalPath))
            throw new NotFoundException(nameof(StoredFile), id);

        var stream = new FileStream(file.PhysicalPath, FileMode.Open, FileAccess.Read);
        return (stream, file.ContentType, file.OriginalFileName);
    }

    private static FileDto MapToDto(StoredFile file) => new()
    {
        Id = file.Id,
        OriginalFileName = file.OriginalFileName,
        ContentType = file.ContentType,
        FileSize = file.FileSize,
        CreatedAt = file.CreatedAt,
        CreatedBy = file.CreatedBy
    };
}
