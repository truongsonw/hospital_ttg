# Scaffold New Module

Tạo module mới cho HospitalTTG theo kiến trúc Modular Monolith / Service-Repository pattern.

**Module name:** $ARGUMENTS

---

## Hướng dẫn thực hiện

Dựa vào tên module được cung cấp (ví dụ: `Patients`), thực hiện **đầy đủ** các bước sau theo thứ tự:

### Bước 0 — Phân tích

Trước khi tạo file, hãy hỏi người dùng (hoặc suy luận từ tên module) những thông tin sau:
- Các **properties chính** của entity (tên, kiểu dữ liệu)
- Có cần **Enum** nào không? (như `BookingStatus`)
- Entity kế thừa `BaseEntity` hay `AuditableEntity`? (mặc định dùng `AuditableEntity`)
- Các **custom methods** nào cần thêm vào IRepository ngoài CRUD cơ bản?
- Schema database (mặc định: tên module lowercase)

Nếu user không cung cấp, hãy dùng giá trị mặc định hợp lý và tiếp tục.

---

### Bước 1 — Tạo `Contracts.{Module}`

**Cấu trúc:**
```
Contracts.{Module}/
├── Contracts.{Module}.csproj
├── DTOs/
│   ├── {Module}Dto.cs
│   ├── Create{Module}Request.cs
│   └── Update{Module}Request.cs   (nếu cần)
├── Enums/                          (nếu có enum)
│   └── {EnumName}.cs
└── Interfaces/
    └── I{Module}Service.cs
```

**Contracts.{Module}.csproj** — không có ProjectReference:
```xml
<Project Sdk="Microsoft.NET.Sdk">
  <ItemGroup>
    <!-- Thêm PackageReference nếu cần, không reference Modules hay Infrastructure -->
  </ItemGroup>
</Project>
```

**I{Module}Service.cs** — expose đủ methods mà Controller và modules khác cần:
```csharp
namespace Contracts.{Module}.Interfaces;

public interface I{Module}Service
{
    Task<{Module}Dto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<{Module}Dto>> GetAllAsync(CancellationToken ct = default);
    Task<{Module}Dto> CreateAsync(Create{Module}Request request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
```

---

### Bước 2 — Tạo `Modules.{Module}`

**Cấu trúc:**
```
Modules.{Module}/
├── Modules.{Module}.csproj
├── Entities/
│   └── {Module}.cs
├── Repositories/
│   ├── I{Module}Repository.cs
│   └── {Module}Repository.cs
├── Services/
│   └── {Module}Service.cs
├── Configurations/
│   └── {Module}Configuration.cs
└── Extensions.cs
```

**Modules.{Module}.csproj** — references bắt buộc:
```xml
<Project Sdk="Microsoft.NET.Sdk">
  <ItemGroup>
    <ProjectReference Include="..\Contracts.{Module}\Contracts.{Module}.csproj" />
    <ProjectReference Include="..\Shared.Abstractions\Shared.Abstractions.csproj" />
    <ProjectReference Include="..\Shared.Infrastructure\Shared.Infrastructure.csproj" />
  </ItemGroup>
</Project>
```

**Entities/{Module}.cs** — kế thừa `AuditableEntity` (hoặc `BaseEntity`):
```csharp
using Shared.Abstractions.Entities;

namespace Modules.{Module}.Entities;

public class {Module} : AuditableEntity
{
    // Properties theo yêu cầu
}
```

**Repositories/I{Module}Repository.cs:**
```csharp
using Shared.Abstractions.Interfaces;

namespace Modules.{Module}.Repositories;

public interface I{Module}Repository : IRepository<Entities.{Module}>
{
    // Custom methods nếu cần (VD: GetByPhoneNumberAsync)
}
```

**Repositories/{Module}Repository.cs:**
```csharp
using Shared.Infrastructure.Data;

namespace Modules.{Module}.Repositories;

public class {Module}Repository : BaseRepository<Entities.{Module}>, I{Module}Repository
{
    public {Module}Repository(AppDbContext context) : base(context) { }
}
```

**Services/{Module}Service.cs** — implements interface từ Contracts:
```csharp
using Contracts.{Module}.DTOs;
using Contracts.{Module}.Interfaces;
using Shared.Abstractions.Exceptions;
using Shared.Abstractions.Interfaces;

namespace Modules.{Module}.Services;

public class {Module}Service : I{Module}Service
{
    private readonly I{Module}Repository _{moduleLower}Repository;
    private readonly IUnitOfWork _unitOfWork;

    public {Module}Service(I{Module}Repository {moduleLower}Repository, IUnitOfWork unitOfWork)
    {
        _{moduleLower}Repository = {moduleLower}Repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<{Module}Dto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _{moduleLower}Repository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof({Module}), id.ToString());
        return MapToDto(entity);
    }

    public async Task<IReadOnlyList<{Module}Dto>> GetAllAsync(CancellationToken ct = default)
    {
        var entities = await _{moduleLower}Repository.GetAllAsync(ct);
        return entities.Select(MapToDto).ToList().AsReadOnly();
    }

    public async Task<{Module}Dto> CreateAsync(Create{Module}Request request, CancellationToken ct = default)
    {
        var entity = new Entities.{Module}
        {
            // Map từ request
        };
        await _{moduleLower}Repository.AddAsync(entity, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        return MapToDto(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _{moduleLower}Repository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof({Module}), id.ToString());
        _{moduleLower}Repository.Delete(entity);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    private static {Module}Dto MapToDto(Entities.{Module} entity) => new()
    {
        Id = entity.Id,
        CreatedAt = entity.CreatedAt,
        // Map các properties khác
    };
}
```

**Configurations/{Module}Configuration.cs** — EF Core config:
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Modules.{Module}.Configurations;

public class {Module}Configuration : IEntityTypeConfiguration<Entities.{Module}>
{
    public void Configure(EntityTypeBuilder<Entities.{Module}> builder)
    {
        builder.ToTable("{Module}s", "{moduleLower}");  // schema = tên module lowercase
        builder.HasKey(x => x.Id);
        // Thêm column constraints, indexes...
    }
}
```

**Extensions.cs:**
```csharp
using Contracts.{Module}.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Modules.{Module}.Configurations;
using Modules.{Module}.Repositories;
using Modules.{Module}.Services;
using Shared.Infrastructure.Data;

namespace Modules.{Module};

public static class Extensions
{
    public static IServiceCollection Add{Module}Module(this IServiceCollection services, IConfiguration configuration)
    {
        AppDbContext.RegisterModuleAssembly(typeof({Module}Configuration).Assembly);
        services.AddScoped<I{Module}Repository, {Module}Repository>();
        services.AddScoped<I{Module}Service, {Module}Service>();
        return services;
    }
}
```

---

### Bước 3 — Tạo Controller trong WebAPI

**WebAPI/Controllers/{Module}sController.cs:**
```csharp
using Contracts.{Module}.DTOs;
using Contracts.{Module}.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class {Module}sController : ControllerBase
{
    private readonly I{Module}Service _{moduleLower}Service;

    public {Module}sController(I{Module}Service {moduleLower}Service)
    {
        _{moduleLower}Service = {moduleLower}Service;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<{Module}Dto>>> GetAll(CancellationToken ct)
        => Ok(await _{moduleLower}Service.GetAllAsync(ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<{Module}Dto>> GetById(Guid id, CancellationToken ct)
        => Ok(await _{moduleLower}Service.GetByIdAsync(id, ct));

    [HttpPost]
    public async Task<ActionResult<{Module}Dto>> Create(Create{Module}Request request, CancellationToken ct)
    {
        var result = await _{moduleLower}Service.CreateAsync(request, ct);
        return Created($"api/{moduleLower}s/{result.Id}", result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _{moduleLower}Service.DeleteAsync(id, ct);
        return NoContent();
    }
}
```

---

### Bước 4 — Đăng ký trong WebAPI/Program.cs

Thêm dòng sau vào phần đăng ký services:
```csharp
builder.Services.Add{Module}Module(builder.Configuration);
```

---

### Bước 5 — Cập nhật Solution file (HospitalTTG.slnx)

Thêm 2 projects vào đúng solution folders:
```xml
<!-- Trong <Folder Name="/Contracts/"> -->
<Project Path="Contracts.{Module}/Contracts.{Module}.csproj" />

<!-- Trong <Folder Name="/Modules/"> -->
<Project Path="Modules.{Module}/Modules.{Module}.csproj" />
```

Cũng thêm reference trong WebAPI.csproj:
```xml
<ProjectReference Include="..\Modules.{Module}\Modules.{Module}.csproj" />
```

---

### Bước 6 — Migration

Sau khi tạo xong, thông báo cho user chạy:
```bash
dotnet ef migrations add Add{Module} --project HospitalTTG/Modules.{Module} --startup-project HospitalTTG/WebAPI
dotnet ef database update --startup-project HospitalTTG/WebAPI
```

---

## Quy tắc bắt buộc

- KHÔNG dùng CQRS/MediatR
- KHÔNG dùng EF Core navigation properties trong entities
- Controller chỉ inject interface từ `Contracts`, KHÔNG inject Repository hay class từ Modules
- Mọi entity phải kế thừa `BaseEntity` hoặc `AuditableEntity`
- Throw `NotFoundException` / `ValidationException` trong Service — không try-catch trong Controller
- Schema database = tên module lowercase (ví dụ: `booking`, `contact`, `patients`)
- Sau khi tạo file, build để kiểm tra: `dotnet build HospitalTTG/HospitalTTG.slnx`
