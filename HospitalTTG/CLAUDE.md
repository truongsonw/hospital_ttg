# HospitalTTG - Hướng dẫn kiến trúc & phát triển

## Tổng quan

Hệ thống quản lý bệnh viện HospitalTTG, xây dựng trên **.NET 10.0** với kiến trúc **Modular Monolith** và pattern **Service/Repository**. Không sử dụng CQRS/MediatR.

**Database:** SQL Server  
**Auth:** JWT Bearer + BCrypt  
**ORM:** Entity Framework Core 10.0  
**API Docs:** Swagger (Swashbuckle)  
**Logging:** Serilog  
**Frontend CORS:** `http://localhost:5173`

---

## 1. Cấu trúc Solution

```
HospitalTTG/
├── Directory.Build.props              # TargetFramework, Nullable, ImplicitUsings cho toàn solution
├── Directory.Packages.props           # Central Package Management (NuGet versions)
├── HospitalTTG.slnx                  # Solution file (.NET modern format)
│
├── Shared.Abstractions/              # [Layer 1] Interfaces, base classes, exceptions
├── Shared.Infrastructure/            # [Layer 2] Implementations cross-cutting (EF, middleware)
│
├── Contracts.Auth/                   # [Layer 3] Public surface - Auth module
├── Contracts.System/                 # [Layer 3] Public surface - System module
├── Contracts.Article/                # [Layer 3] Public surface - Article module
├── Contracts.Contact/                # [Layer 3] Public surface - Contact module
├── Contracts.Booking/                # [Layer 3] Public surface - Booking module
│
├── Modules.Auth/                     # [Layer 4] Business logic - Auth
├── Modules.System/                   # [Layer 4] Business logic - System (Menu, RoleMenu, SysCategory)
├── Modules.Article/                  # [Layer 4] Business logic - Article (Article, Category, Tag)
├── Modules.Contact/                  # [Layer 4] Business logic - Contact
├── Modules.Booking/                  # [Layer 4] Business logic - Booking
│
└── WebAPI/                           # [Layer 5] Host - Composition root, Controllers, Pipeline
```

### Solution Folders trong .slnx

| Folder | Projects |
|--------|----------|
| `/Shared/` | Shared.Abstractions, Shared.Infrastructure |
| `/Contracts/` | Contracts.Auth, Contracts.System, Contracts.Article, Contracts.Contact, Contracts.Booking |
| `/Modules/` | Modules.Auth, Modules.System, Modules.Article, Modules.Contact, Modules.Booking |
| `/Host/` | WebAPI |

---

## 2. Quy tắc Dependency

```
WebAPI (Host)
  ├──→ Modules.Auth         ──→ Contracts.Auth, Shared.Abstractions, Shared.Infrastructure
  ├──→ Modules.System       ──→ Contracts.System, Shared.Abstractions, Shared.Infrastructure
  ├──→ Modules.Article      ──→ Contracts.Article, Shared.Abstractions, Shared.Infrastructure
  ├──→ Modules.Contact      ──→ Contracts.Contact, Shared.Abstractions, Shared.Infrastructure
  ├──→ Modules.Booking      ──→ Contracts.Booking, Shared.Abstractions, Shared.Infrastructure
  └──→ Shared.Infrastructure ──→ Shared.Abstractions
```

| Project | Được phép reference | KHÔNG được reference |
|---------|--------------------|--------------------|
| Shared.Abstractions | Không reference gì | Mọi project khác |
| Shared.Infrastructure | Shared.Abstractions | Contracts, Modules |
| Contracts.{Module} | Không (hoặc Shared.Abstractions nếu cần) | Modules, Infrastructure |
| Modules.{Module} | Contracts của chính nó, Shared.*, Contracts của module khác | Modules của module khác |
| WebAPI | Tất cả Modules, Shared.Infrastructure | - |

**Giao tiếp giữa modules:** Module A reference `Contracts.B` và inject interface — KHÔNG reference `Modules.B`.

---

## 3. Shared.Abstractions

```
Shared.Abstractions/
├── Entities/
│   ├── BaseEntity.cs            # Id (Guid), CreatedAt (DateTime), UpdatedAt (DateTime?)
│   ├── AuditableEntity.cs       # : BaseEntity + CreatedBy (string?), UpdatedBy (string?)
│   └── BaseTrackingEntity.cs    # Standalone: CreatedBy, CreatedDate, UpdatedBy, UpdatedDate
├── Interfaces/
│   ├── IRepository.cs           # GetById, GetAll, Find, Add, Update, Delete
│   └── IUnitOfWork.cs           # SaveChangesAsync
├── Exceptions/
│   ├── BaseException.cs         # abstract, StatusCode (int)
│   ├── NotFoundException.cs     # HTTP 404 — NotFoundException(entityName, key)
│   └── ValidationException.cs  # HTTP 400 — ValidationException(IDictionary<string,string[]>)
└── Responses/
    ├── ApiResponse<T>.cs        # { Data, Succeeded, Message }
    └── PagedResponse<T>.cs      # : ApiResponse<T> + PageNumber, PageSize, TotalPages, TotalRecords
```

### Quan trọng: BaseTrackingEntity vs BaseEntity

`BaseTrackingEntity` là class **độc lập** (không kế thừa BaseEntity), dùng cho entities legacy hoặc có cấu trúc audit khác:
- **Không có `Id` property** → phải tự khai báo `public Guid Id { get; set; }` trong entity
- Field đặt tên khác: `CreatedDate` (không phải `CreatedAt`), `UpdatedDate` (không phải `UpdatedAt`)
- AppDbContext **không** tự set timestamp cho `BaseTrackingEntity` — chỉ xử lý `BaseEntity` và `AuditableEntity`

---

## 4. Shared.Infrastructure

```
Shared.Infrastructure/
├── Data/
│   ├── AppDbContext.cs      # DbContext + IUnitOfWork, auto-timestamp, auto-audit
│   └── BaseRepository.cs   # Generic IRepository<T> implementation
├── Middleware/
│   └── ExceptionHandlingMiddleware.cs  # Exception → ProblemDetails JSON
└── Extensions.cs            # AddSharedInfrastructure(): DbContext + UnitOfWork + HttpContextAccessor
```

### AppDbContext — cơ chế auto-timestamp & audit

```csharp
// SaveChangesAsync tự động:
// BaseEntity → Added: set CreatedAt; Modified: set UpdatedAt
// AuditableEntity → đọc ClaimTypes.Name từ JWT → set CreatedBy / UpdatedBy
public static void RegisterModuleAssembly(Assembly assembly)  // mỗi module gọi 1 lần
```

### ExceptionHandlingMiddleware — response format

Trả về `application/problem+json` theo chuẩn RFC 7807:

```json
// BaseException (NotFoundException, ValidationException):
{ "status": 404, "title": "An error occurred", "detail": "User with key 'admin' was not found." }

// ValidationException thêm:
{ "status": 400, "title": "Validation Error", "detail": "...", "errors": { "Email": ["Email already exists."] } }

// Exception bất kỳ:
{ "status": 500, "title": "An unexpected error occurred." }
// Development: thêm "detail" (exception type + message) và "stackTrace"
```

---

## 5. Modules hiện có

### 5.1 Auth (`auth` → table `Users` - schema dbo)

**Contracts.Auth:**
- `LoginRequest`, `RegisterRequest`, `TokenResponse`, `UserDto`, `ChangePasswordRequest`
- `IAuthService`: Login, Register, RefreshToken, Logout, GetCurrentUser, ChangePassword

**Modules.Auth:**
- `User : AuditableEntity` — Username, PasswordHash, Email, FullName, Role, RefreshToken, RefreshTokenExpiryTime, IsActive
- `IUserRepository`: GetByUsername, GetByRefreshToken, ExistsByUsername, ExistsByEmail
- `AuthService`: BCrypt verify, JWT generate (HMAC-SHA256), refresh token rotation
- `Extensions.AddAuthModule()`: đăng ký JWT Bearer authentication + authorization

**JWT Claims trong token:** `NameIdentifier` (userId), `Name` (username), `Email`, `Role`

**Controller:** `AuthController` — POST login, POST register, POST refresh, POST logout, GET me, PUT change-password

---

### 5.2 System (schema `system`)

**Tables:** `system.Menus`, `system.RoleMenus`, `system.SysCategories`

**Contracts.System:**
- `ISysMenuService`: GetAllMenus, GetMenuById, CreateMenu, UpdateMenu, DeleteMenu, GetMenusByRole, AssignMenusToRole
- `ISysCategoryService`: GetAll, GetById, Create, Update, Delete

**Modules.System — Entities:**

| Entity | Base class | Đặc điểm |
|--------|------------|----------|
| `Menu` | `BaseTrackingEntity` | Tự khai báo `Id`. Hỗ trợ cây (ParentId), SortOrder, IsActive |
| `RoleMenu` | Không | Tự khai báo Id, RoleId (string), MenuId, CanView, CreatedBy, CreatedDate |
| `SysCategory` | Không | Tự khai báo tất cả fields. Dùng `int?` cho CreateBy/UpdateBy. Hỗ trợ Ext fields |

**Controller:** `SysMenuController` (GET, GET/{id}, POST, PUT/{id}, DELETE/{id}, GET role/{roleId}, POST role/assign), `SysCategoryController` (CRUD)

---

### 5.3 Article (schema dbo — không có schema riêng)

**Tables:** `Categories`, `Contents`, `ContentMedias`

**Contracts.Article:**

- `ICategoryService`: GetAll, GetById, Create, Update, Delete
- `IContentService`: GetAll, GetById, Create, Update, Delete
- `IContentMediaService`: GetByContentId, Create, Delete

**Modules.Article — Entities:**

| Entity | Base class | Đặc điểm |
|--------|------------|----------|
| `Category` | `AuditableEntity` | ParentId (cây), Name, Slug, Type ('article'\|'album'\|'video'), Lang, SortOrder, IsActive |
| `Content` | `AuditableEntity` | CategoryId, ContentType ('article'\|'album'\|'video'), Title, Slug, Intro, Body, Thumbnail, FileAttach, Tags (string denorm), Status (byte 0/1), IsHot, ViewCount, PublishedAt |
| `ContentMedia` | `BaseEntity` | ContentId, MediaType ('image'\|'video'), Url, Caption, IsThumbnail, SortOrder |

**Controllers:**

- `CategoriesController` (route `api/categories`) — CRUD
- `ContentsController` (route `api/contents`) — CRUD
- `ContentMediasController` (route `api/content-medias`) — GET by-content/{id}, POST, DELETE

**Lưu ý:** Controllers trả thẳng DTO, không wrap `ApiResponse<T>`. Tags được lưu dạng string phẳng trong Content (không có bảng riêng).

---

### 5.4 Contact (schema `contact`)

**Table:** `contact.Contacts`

**Contracts.Contact:**
- `IContactService`: GetById, GetAll, Create, Delete
- `ContactStatus` enum: `Unread`, `Read`, `Replied`

**Modules.Contact:**
- `Contact : AuditableEntity` — FullName, Email, Subject, Content, Status

**Controller:** `ContactsController` — GET, GET/{id}, POST, DELETE/{id} (public, không có `[Authorize]`)

---

### 5.5 Booking (schema `booking`)

**Table:** `booking.Bookings`

**Contracts.Booking:**
- `IBookingService`: GetById, GetAll, Create, Delete
- `BookingStatus` enum: `Pending`, `Confirmed`, `Cancelled`

**Modules.Booking:**
- `Booking : AuditableEntity` — FullName, PhoneNumber, DateOfBirth, AppointmentDate, Symptoms, Status

**Controller:** `BookingsController` — GET, GET/{id}, POST, DELETE/{id} (public, không có `[Authorize]`)

---

### 5.6 Storage (schema `dbo`)

**Table:** `storage.StoredFiles`

**Contracts.Storage:**
- `IStorageService`: Upload, GetById, GetAll, Delete, Download
- `FileDto`: Id, OriginalFileName, ContentType, FileSize, CreatedAt, CreatedBy

**Modules.Storage:**
- `StoredFile : AuditableEntity` — StoredFileName (GUID-based, unique), OriginalFileName, ContentType, FileSize, PhysicalPath
- `IStoredFileRepository`: GetByStoredFileNameAsync
- `StorageService`: validate extension whitelist + max size, lưu file lên disk, quản lý DB record
- Config đọc từ `appsettings.json` section `Storage`: BasePath, AllowedExtensions, MaxFileSizeMb

**Controller:** `StorageController` — `[Authorize]`, 5 endpoints:
- `GET api/storage` — danh sách files
- `GET api/storage/{id}` — metadata file
- `POST api/storage` — upload (`multipart/form-data`)
- `GET api/storage/{id}/download` — download file (`[AllowAnonymous]`)
- `DELETE api/storage/{id}` — xóa file khỏi disk + DB

---

## 6. WebAPI — Composition Root

### Program.cs — thứ tự đăng ký

```csharp
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(...)             // policy "Frontend" → localhost:5173
builder.Services.AddSharedInfrastructure(...)  // DbContext + UnitOfWork
builder.Services.AddAuthModule(...)            // JWT Auth + User DI
builder.Services.AddSystemModule(...)          // Menu, SysCategory DI
builder.Services.AddArticleModule(...)         // Article, Category, Tag DI
builder.Services.AddContactModule(...)         // Contact DI
builder.Services.AddBookingModule(...)         // Booking DI
builder.Services.AddStorageModule(...)         // Storage DI

// Pipeline (THỨ TỰ QUAN TRỌNG):
app.UseSwagger() / app.UseSwaggerUI()     // chỉ Development
app.UseMiddleware<ExceptionHandlingMiddleware>()
app.UseCors("Frontend")
app.UseHttpsRedirection()
app.UseAuthentication()                   // trước Authorization
app.UseAuthorization()
app.MapControllers()
```

### Controller pattern chuẩn (Auth & System modules)

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class XxxController : ControllerBase
{
    // Inject interface từ Contracts, không inject từ Modules
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<XxxDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<XxxDto>>>> GetAll(CancellationToken ct)
    {
        var result = await _service.GetAllAsync(ct);
        return Ok(new ApiResponse<IReadOnlyList<XxxDto>>(result));
    }

    // GET trả Ok(), POST tạo mới trả Created(), PUT trả Ok(), DELETE trả Ok(true)/NoContent()
}
```

### Lấy userId từ JWT trong Controller

```csharp
private Guid GetCurrentUserId() =>
    Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
```

---

## 7. NuGet Packages (Directory.Packages.props)

| Package | Version | Dùng ở |
|---------|---------|--------|
| Microsoft.EntityFrameworkCore | 10.0.0 | Shared.Infrastructure |
| Microsoft.EntityFrameworkCore.SqlServer | 10.0.0 | Shared.Infrastructure |
| Microsoft.EntityFrameworkCore.Design | 10.0.0 | WebAPI (migrations) |
| Microsoft.AspNetCore.Authentication.JwtBearer | 10.0.0 | Modules.Auth |
| BCrypt.Net-Next | 4.0.3 | Modules.Auth |
| FluentValidation.DependencyInjectionExtensions | 11.11.0 | Khai báo sẵn, chưa sử dụng |
| Microsoft.AspNetCore.OpenApi | 10.0.5 | WebAPI |
| Scalar.AspNetCore | 2.13.22 | Khai báo sẵn, chưa sử dụng |
| Serilog.AspNetCore | 9.0.0 | WebAPI |
| Swashbuckle.AspNetCore | 10.1.7 | WebAPI |

---

## 8. Database — Schemas & Tables

| Schema | Tables | Module |
|--------|--------|--------|
| dbo | Users, Categories, Contents, ContentMedias, Menus, RoleMenus, SysCategories, Contacts, Bookings, StoredFiles | Tất cả modules |

### Quản lý schema DB

**Tất cả bảng dùng schema `dbo` (mặc định).** Không tạo schema riêng cho từng module.

**Không dùng EF Core Migrations.** Mọi thay đổi DB được viết tay dưới dạng SQL script và chạy trực tiếp trên SQL Server.

Script tham khảo: `create-database.sql` (toàn bộ schema ban đầu), `migrate-content-model.sql` (migration thủ công).

Khi thêm bảng mới, viết script theo mẫu:

```sql
USE HospitalTTG;
GO

CREATE TABLE dbo.TableName (
    Id               UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    -- ... các cột khác
    CreatedAt        DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt        DATETIME2        NULL,
    CreatedBy        NVARCHAR(450)    NULL,
    UpdatedBy        NVARCHAR(450)    NULL,
    CONSTRAINT PK_TableName PRIMARY KEY (Id)
);
GO
```

---

## 9. Hướng dẫn thêm Module mới

### Bước 1: Tạo Contracts.{Module}

```bash
dotnet new classlib -n Contracts.{Module}
dotnet sln HospitalTTG.slnx add Contracts.{Module}/Contracts.{Module}.csproj --solution-folder Contracts
```

```
Contracts.{Module}/
├── Contracts.{Module}.csproj   # Không có ProjectReference
├── DTOs/
│   ├── {Module}Dto.cs
│   ├── Create{Module}Request.cs
│   └── Update{Module}Request.cs
├── Enums/                       # Nếu cần
│   └── {EnumName}.cs
└── Interfaces/
    └── I{Module}Service.cs
```

### Bước 2: Tạo Modules.{Module}

```bash
dotnet new classlib -n Modules.{Module}
dotnet sln HospitalTTG.slnx add Modules.{Module}/Modules.{Module}.csproj --solution-folder Modules
dotnet add Modules.{Module} reference Contracts.{Module} Shared.Abstractions Shared.Infrastructure
dotnet add WebAPI reference Modules.{Module}
```

```
Modules.{Module}/
├── Modules.{Module}.csproj
├── Entities/
│   └── {Module}.cs             # : AuditableEntity (hoặc BaseEntity)
├── Repositories/
│   ├── I{Module}Repository.cs  # : IRepository<{Module}> + custom methods
│   └── {Module}Repository.cs   # : BaseRepository<{Module}>
├── Services/
│   └── {Module}Service.cs      # implements I{Module}Service từ Contracts
├── Configurations/
│   └── {Module}Configuration.cs # IEntityTypeConfiguration
└── Extensions.cs               # Add{Module}Module()
```

**Extensions.cs pattern:**

```csharp
public static IServiceCollection Add{Module}Module(this IServiceCollection services, IConfiguration configuration)
{
    AppDbContext.RegisterModuleAssembly(typeof({Module}Configuration).Assembly);
    services.AddScoped<I{Module}Repository, {Module}Repository>();
    services.AddScoped<I{Module}Service, {Module}Service>();
    return services;
}
```

### Bước 3: Đăng ký trong WebAPI/Program.cs

```csharp
builder.Services.Add{Module}Module(builder.Configuration);
```

### Bước 4: Tạo Controller

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class {Module}sController : ControllerBase
{
    private readonly I{Module}Service _{moduleCamel}Service;
    // ... inject từ Contracts, không inject từ Modules
}
```

### Bước 5: Tạo bảng DB

Viết SQL script thủ công và chạy trực tiếp trên SQL Server (xem mẫu ở section 8). Không dùng EF Core Migrations.

---

## 10. Quy ước đặt tên

### Namespaces

| Project | Namespace |
|---------|-----------|
| Shared.Abstractions | `Shared.Abstractions.Entities`, `.Interfaces`, `.Exceptions`, `.Responses` |
| Shared.Infrastructure | `Shared.Infrastructure.Data`, `.Middleware` |
| Contracts.Auth | `Contracts.Auth.DTOs`, `.Interfaces` |
| Modules.Auth | `Modules.Auth.Entities`, `.Repositories`, `.Services`, `.Configurations` |

### Database

- Schema: **luôn dùng `dbo`** cho tất cả modules — không tạo schema riêng
- Table: PascalCase số nhiều (`Users`, `Menus`, `Bookings`, `StoredFiles`)
- Column: PascalCase theo property name

### Files

- Entity: singular (`User.cs`, `Booking.cs`)
- Repository: `I{Entity}Repository.cs` + `{Entity}Repository.cs`
- Service (interface): trong **Contracts** → `I{Module}Service.cs`
- Service (impl): trong **Modules** → `{Module}Service.cs`
- Configuration: `{Entity}Configuration.cs`
- Extension: `Extensions.cs` — mỗi project một file

---

## 11. Lưu ý quan trọng

1. **KHÔNG dùng CQRS/MediatR** — dùng Service/Repository pattern trực tiếp.

2. **KHÔNG dùng EF Core navigation properties** trong entities.

3. **`BaseTrackingEntity` không có Id** — phải tự khai báo `public Guid Id { get; set; }` trong entity kế thừa nó. AppDbContext cũng không tự set timestamp cho loại này.

4. **Chọn base class đúng:**
   - `AuditableEntity` → entity cần track người tạo/sửa với JWT username (recommended mặc định)
   - `BaseEntity` → chỉ cần timestamp, không cần audit user
   - `BaseTrackingEntity` → khi cần field naming khác (`CreatedDate` thay `CreatedAt`) hoặc entity legacy

5. **Throw exception trong Service, không try-catch trong Controller:**
   ```csharp
   throw new NotFoundException("Booking", id);
   throw new ValidationException(new Dictionary<string, string[]> { { "Email", ["Already exists."] } });
   ```

6. **Controller inject interface từ Contracts** — không inject Repository hoặc class từ Modules.

7. **Thứ tự middleware** trong Program.cs RẤT QUAN TRỌNG — `UseAuthentication()` phải trước `UseAuthorization()`, `ExceptionHandlingMiddleware` đứng đầu sau Swagger.

8. **Mỗi module phải gọi `AppDbContext.RegisterModuleAssembly()`** trong Extensions.cs — nếu quên, EF Core không biết entity configurations của module đó.

9. **Response wrapper:** Auth và System controllers dùng `ApiResponse<T>`. Article, Booking, Contact controllers trả thẳng DTO. Khi tạo module mới, nên dùng `ApiResponse<T>` cho nhất quán.

---

## 12. Commands thường dùng

```bash
# Build
dotnet build HospitalTTG.slnx

# Run
dotnet run --project WebAPI

# Tạo project mới
dotnet new classlib -n Contracts.{Module}
dotnet new classlib -n Modules.{Module}
dotnet sln HospitalTTG.slnx add Contracts.{Module}/Contracts.{Module}.csproj --solution-folder Contracts
dotnet sln HospitalTTG.slnx add Modules.{Module}/Modules.{Module}.csproj --solution-folder Modules
dotnet add Modules.{Module} reference Contracts.{Module} Shared.Abstractions Shared.Infrastructure
dotnet add WebAPI reference Modules.{Module}
```

---

## 13. Cấu hình (appsettings.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=...;Initial Catalog=HospitalTTG;..."
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173", "https://localhost:5173"]
  },
  "Jwt": {
    "Key": "...",
    "Issuer": "HospitalTTG",
    "Audience": "HospitalTTG",
    "ExpiryMinutes": 60,
    "RefreshTokenExpiryDays": 7
  }
}
```
