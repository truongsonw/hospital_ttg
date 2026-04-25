using Contracts.Storage.DTOs;
using Microsoft.AspNetCore.Http;

namespace Contracts.Storage.Interfaces;

public interface IStorageService
{
    Task<FileDto> UploadAsync(IFormFile file, CancellationToken ct = default);
    Task<FileDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<FileDto>> GetAllAsync(CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task<(Stream Stream, string ContentType, string FileName)> DownloadAsync(Guid id, CancellationToken ct = default);
}
