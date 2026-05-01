# Hướng dẫn sử dụng subagents trong HospitalTTG

Tài liệu này hướng dẫn cách yêu cầu Codex dùng subagents trong dự án HospitalTTG. Mục tiêu là chia việc lớn thành các phần độc lập, chạy song song khi phù hợp, và vẫn giữ đúng ranh giới backend, frontend, database, security và validation của repository.

## Tổng quan

Subagent là một agent phụ có vai trò rõ ràng. Mỗi subagent nên nhận một nhiệm vụ nhỏ, có phạm vi file riêng, và trả về kết quả cho agent chính tổng hợp.

Trong repo này, cấu hình nằm tại:

- `.codex/config.toml`: giới hạn số agent và độ sâu.
- `.codex/agents/*.toml`: định nghĩa từng custom agent.
- `AGENTS.md`: quy tắc tổng quan của repository.

Cấu hình hiện tại:

- `max_threads = 6`: tối đa 6 subagents chạy song song.
- `max_depth = 1`: subagent không tiếp tục tạo thêm subagent con.

## Khi nào nên dùng subagents

Nên dùng subagents khi task:

- Cần đọc nhiều vùng code khác nhau.
- Có cả backend và frontend.
- Có thay đổi database hoặc SQL script.
- Cần audit API contract trước khi sửa.
- Cần review security, auth, upload, CORS, public endpoint.
- Cần chạy build, typecheck, smoke test sau khi sửa.
- Đủ lớn để chia thành các phần không sửa cùng một file.

Không nên dùng subagents khi task:

- Chỉ sửa một label, một text, một import, hoặc một lỗi TypeScript nhỏ.
- Chỉ cần trả lời một câu hỏi ngắn.
- Nhiều agent sẽ phải sửa cùng một file.
- Chưa rõ mục tiêu và việc chia task sẽ tạo thêm nhiều nhiệm vụ mơ hồ.

## Danh sách subagents

### `codebase_explorer`

Dùng để đọc code và map luồng trước khi sửa. Agent này chỉ đọc, không sửa file.

Phù hợp khi:

- Cần tìm endpoint, service, repository, DTO, route, component liên quan.
- Cần hiểu luồng FE -> BE -> DB.
- Cần xác minh tài liệu có bị lệch so với code hay không.

Prompt mẫu:

```text
Dùng codebase_explorer để map luồng tạo lịch khám hiện tại. Hãy trả về controller, service, repository, DTO, frontend route, frontend service và các file liên quan.
```

### `api_contract`

Dùng để audit contract giữa backend và frontend. Agent này chỉ đọc, không sửa file.

Phù hợp khi:

- Một tính năng đi qua cả backend và frontend.
- Cần biết endpoint trả `ApiResponse<T>`, `PagedResponse<T>`, raw DTO hay raw paged shape.
- Cần kiểm tra frontend đang dùng `apiFetch`, `apiFetchRaw`, `apiFetchData`, hay `apiUpload` có đúng không.

Prompt mẫu:

```text
Dùng api_contract audit contract của module Article category. Kiểm tra path, method, auth, request DTO, response shape, frontend service, frontend type và route caller.
```

### `backend_module`

Dùng để sửa backend trong `HospitalTTG/**`.

Phù hợp khi:

- Thêm/sửa controller, service, repository, DTO contract.
- Sửa business logic trong module.
- Thêm đăng ký service ở WebAPI nếu cần.

Lưu ý:

- Không dùng EF migrations.
- Không thêm EF navigation properties.
- Không thêm foreign key constraint nếu không được yêu cầu.
- Nếu có schema change, cần phối hợp với `database_migration`.

Prompt mẫu:

```text
Dùng backend_module sửa logic tạo Doctor. Chỉ sửa Contracts.Doctor, Modules.Doctor và WebAPI controller nếu cần. Nếu cần đổi schema thì chỉ ghi rõ SQL handoff, không sửa SQL.
```

### `frontend_integration`

Dùng để sửa frontend trong `hospital-ttg-fe/**`.

Phù hợp khi:

- Thêm/sửa route, component, form, table, service, type.
- Kết nối API vào UI.
- Sửa cách parse response theo contract backend.

Lưu ý:

- Text hiển thị cho người dùng phải là tiếng Việt.
- Dùng service trong `app/services`, type trong `app/types`.
- Không fetch trực tiếp trong component nếu đã có pattern service.

Prompt mẫu:

```text
Dùng frontend_integration tạo màn hình quản lý khoa phòng trong dashboard. Chỉ sửa hospital-ttg-fe/app, service và type liên quan. Text hiển thị dùng tiếng Việt.
```

### `database_migration`

Dùng để kiểm tra và sửa SQL Server schema/manual SQL scripts.

Phù hợp khi:

- Entity/configuration thay đổi.
- Cần tạo hoặc sửa script idempotent.
- Cần đối chiếu EF entity/configuration với SQL script hoặc live metadata.

Lưu ý:

- Chỉ dùng manual SQL scripts.
- Không dùng EF Core migrations.
- Script phải idempotent bằng `IF NOT EXISTS`, `COL_LENGTH`, `OBJECT_ID`, hoặc guard tương đương.
- Không drop data nếu user không yêu cầu rõ.

Prompt mẫu:

```text
Dùng database_migration kiểm tra entity Doctor và SQL scripts hiện tại. Nếu thiếu cột SortOrder thì tạo script idempotent để thêm cột, không thêm foreign key constraint.
```

### `security_auth`

Dùng để audit security/auth. Agent này mặc định chỉ đọc.

Phù hợp khi:

- Dính đến login, refresh token, JWT, role authorization.
- Dính đến upload/download file.
- Dính đến CORS.
- Dính đến public mutation endpoint như booking/contact create, register, view-count.

Prompt mẫu:

```text
Dùng security_auth audit endpoint tạo booking public. Tập trung vào spam risk, PII exposure, validation, auth intent, email spam impact và đề xuất patch tối thiểu.
```

### `qa_test`

Dùng để validate build, typecheck, smoke test, và test nhỏ nếu cần.

Phù hợp khi:

- Đã sửa backend/frontend và cần kiểm tra.
- Cần chạy lệnh validation chuẩn của repo.
- Cần thêm test harness nhỏ nếu được giao.

Prompt mẫu:

```text
Dùng qa_test chạy validation sau khi sửa. Backend: dotnet restore và dotnet build. Frontend: npm run typecheck và npm run build. Báo lại lỗi với file/line nếu fail.
```

### `devops_release`

Dùng cho Docker, CI/CD, env config, health check, deployment readiness.

Phù hợp khi:

- Sửa Dockerfile, compose, CI workflow, env template.
- Kiểm tra health endpoint hoặc release checklist.
- Điều tra lỗi runtime do config môi trường.

Prompt mẫu:

```text
Dùng devops_release kiểm tra cấu hình chạy local BE/FE và health check. Không in secret, chỉ báo key name và giá trị đã redact nếu cần.
```

### `documentation`

Dùng để sửa tài liệu.

Phù hợp khi:

- Cập nhật README, docs, AGENTS.md.
- Viết migration note, onboarding note, runbook.
- Đồng bộ tài liệu với code hiện tại.

Prompt mẫu:

```text
Dùng documentation cập nhật docs về cách chạy backend/frontend local. Đọc package.json, launchSettings.json và AGENTS.md trước khi viết.
```

### `reviewer_gatekeeper`

Dùng để review cuối. Agent này chỉ đọc, không sửa file.

Phù hợp khi:

- Task lớn đã có diff.
- Cần check architecture boundary, security, SQL safety, API contract, test coverage.
- Cần kết luận `Approve`, `Approve with notes`, hoặc `Request changes`.

Prompt mẫu:

```text
Dùng reviewer_gatekeeper review diff hiện tại. Tập trung vào contract FE/BE, SQL script safety, auth boundary, validation và unrelated changes.
```

### `hospital_orchestrator`

Dùng để điều phối task lớn nhiều mảng.

Phù hợp khi:

- Một feature cần backend, frontend, database, security, QA, docs.
- Cần chia việc nhiều agent và tổng hợp kết quả.

Prompt mẫu:

```text
Dùng hospital_orchestrator điều phối task thêm quản l   
ý lịch khám. Hãy chia subagents theo backend, frontend, database, security và QA, đảm bảo không agent nào sửa cùng một file.
```

## Nguyên tắc chia việc

### 1. Chia theo ranh giới file

Mỗi subagent nên có ownership rõ ràng.

Ví dụ tốt:

```text
- backend_module: chỉ sửa HospitalTTG/Contracts.Booking, HospitalTTG/Modules.Booking, HospitalTTG/WebAPI controller liên quan.
- frontend_integration: chỉ sửa hospital-ttg-fe/app/services, app/types và route dashboard booking.
- database_migration: chỉ sửa HospitalTTG/sql hoặc migrate script.
```

Ví dụ không tốt:

```text
Cho backend_module và api_contract cùng sửa Contracts.Booking.
```

`api_contract` là read-only auditor, không nên được giao sửa file.

### 2. Audit trước, implement sau

Với task cross-boundary, nên đi theo thứ tự:

1. `codebase_explorer` map luồng hiện tại.
2. `api_contract` lập contract checkpoint.
3. `backend_module` và `frontend_integration` implement theo ownership riêng.
4. `database_migration` xử lý SQL nếu schema đổi.
5. `security_auth` audit nếu chạm public/auth/upload.
6. `qa_test` validate.
7. `reviewer_gatekeeper` review cuối nếu task lớn.

### 3. Không để nhiều subagents sửa cùng file

Nếu hai phần việc đều cần sửa cùng một file, nên để agent chính hoặc một subagent duy nhất sửa file đó.

Ví dụ:

```text
Không cho backend_module và database_migration cùng sửa Modules.Doctor/Entities/Doctor.cs.
Nếu cần đổi entity, giao rõ Doctor.cs cho backend_module, database_migration chỉ tạo SQL script từ thay đổi đó.
```

### 4. Redact secrets

Nếu task đụng đến `appsettings*.json`, connection string, JWT key, refresh token, SMTP password, hoặc dab config:

- Không in giá trị secret.
- Chỉ nói key name, file, và trạng thái đã redact.
- Không commit secret mới vào repo.

### 5. Luôn tổng hợp kết quả ở agent chính

Subagents trả kết quả riêng, nhưng câu trả lời cuối cùng nên do agent chính tổng hợp:

- Files changed.
- Behavior changed.
- API contract changes.
- Database script changes.
- Security and PII risks considered.
- Validation commands/results.
- Remaining TODOs/manual deployment steps.

## Prompt mẫu theo tình huống

### Điều tra lỗi FE gọi API sai response shape

```text
Dùng subagents để điều tra lỗi FE parse sai response của Article category:
- codebase_explorer map controller, service, DTO, frontend service và route caller.
- api_contract audit response wrapper shape và cách frontend dùng apiFetch/apiFetchRaw/apiFetchData.
Sau đó tổng hợp root cause và nếu cần thì đề xuất patch nhỏ.
```

### Sửa tính năng đi qua BE và FE

```text
Dùng subagents để thêm tính năng cập nhật trạng thái booking trong dashboard:
- api_contract xác định endpoint, DTO, auth, response wrapper và frontend type/service cần có.
- backend_module implement backend logic, chỉ sửa backend files liên quan.
- frontend_integration implement UI và service/type frontend, chỉ sửa hospital-ttg-fe.
- security_auth audit role authorization và PII risk của booking.
- qa_test chạy dotnet build, npm typecheck và npm build.
Không để hai agent sửa cùng một file.
```

### Sửa schema database

```text
Dùng subagents để thêm cột DisplayOrder cho Departments:
- codebase_explorer tìm entity/configuration/repository/service/frontend hiện đang dùng Department.
- database_migration tạo SQL script idempotent và kiểm tra EF configuration tương ứng.
- backend_module sửa entity/configuration nếu cần, không dùng EF migration.
- qa_test build backend sau khi merge.
Không thêm foreign key constraint.
```

### Audit security cho public endpoint

```text
Dùng security_auth audit các public mutation endpoints: booking create, contact create, auth register, article view-count. Phân loại Critical/High/Medium/Low, đưa file/endpoint bằng chứng, không sửa code, không in secret.
```

### Review trước khi kết thúc task lớn

```text
Dùng reviewer_gatekeeper review diff hiện tại. Kiểm tra:
- modular monolith dependency rules
- contract FE/BE
- SQL script idempotency và destructive risk
- auth/security boundaries
- validation đã chạy
Trả verdict Approve, Approve with notes, hoặc Request changes.
```

### Chạy validation sau khi sửa

```text
Dùng qa_test validate thay đổi hiện tại:
- cd HospitalTTG && dotnet restore HospitalTTG.slnx && dotnet build HospitalTTG.slnx --no-restore
- cd hospital-ttg-fe && npm run typecheck && npm run build
Nếu fail, trả lời command, lỗi chính, file/line và đề xuất fix tối thiểu.
```

### Cập nhật tài liệu

```text
Dùng documentation cập nhật docs về cách backup SQL Server theo config hiện tại. Đọc appsettings nhưng redact secret. Không sửa code.
```

## Mẫu prompt tổng hợp cho task lớn

Bạn có thể copy mẫu này và thay phần trong ngoặc:

```text
Dùng subagents xử lý task: [mô tả task].

Yêu cầu chia việc:
- codebase_explorer: map code path hiện tại liên quan đến [module/feature].
- api_contract: audit FE/BE contract nếu có endpoint.
- backend_module: implement backend, ownership chỉ gồm [backend files/modules].
- frontend_integration: implement frontend, ownership chỉ gồm [frontend routes/services/types/components].
- database_migration: xử lý SQL script nếu schema đổi, không dùng EF migrations.
- security_auth: audit nếu chạm auth/public mutation/upload/PII.
- qa_test: chạy validation phù hợp sau khi merge.
- reviewer_gatekeeper: review cuối nếu diff lớn.

Quy tắc:
- Không để nhiều subagents sửa cùng một file.
- Không in secret, connection string, JWT key, SMTP password.
- User-facing frontend text dùng tiếng Việt.
- Nếu đổi entity/configuration thì phải có manual SQL script idempotent.
- Câu trả lời cuối cùng phải gồm files changed, behavior changed, API contract, DB script, security/PII, validation và TODO.
```

## Checklist trước khi yêu cầu dùng subagents

Trước khi gửi prompt, nên xác định:

- Feature/module cần xử lý là gì?
- Có cần sửa backend không?
- Có cần sửa frontend không?
- Có endpoint/API contract không?
- Có thay đổi database/schema không?
- Có public endpoint, auth, upload/download, CORS, hoặc PII không?
- Có cần chạy runtime smoke check không?
- Có file nào không được phép sửa không?

Nếu chưa rõ, hãy bắt đầu bằng `codebase_explorer` hoặc `api_contract` trước.

## Ví dụ đầy đủ

Prompt:

```text
Dùng subagents thêm chức năng ẩn/hiện bác sĩ trên dashboard.

Chia việc:
- codebase_explorer map Doctor controller/service/repository/entity/frontend route/service/type hiện tại.
- api_contract xác định endpoint update status, auth requirement, request DTO, response DTO và wrapper shape.
- backend_module implement backend nếu thiếu endpoint, chỉ sửa Doctor contracts/modules/controller.
- frontend_integration thêm UI toggle trong dashboard, chỉ sửa frontend route/component/service/type liên quan.
- database_migration chỉ tham gia nếu entity/configuration thiếu cột status; script phải idempotent.
- security_auth audit role authorization của endpoint admin.
- qa_test chạy dotnet build, npm typecheck và npm build.
- reviewer_gatekeeper review diff cuối.

Không để hai agent sửa cùng file. Không dùng EF migrations. Text UI dùng tiếng Việt.
```

Kết quả mong đợi:

- Agent chính tổng hợp các kết quả từ subagents.
- Nếu có code change, chỉ rõ file đã sửa.
- Nếu contract đổi, ghi rõ endpoint/method/request/response/wrapper.
- Nếu DB đổi, ghi rõ script và cách apply.
- Nếu có rủi ro security/PII, ghi rõ đã xử lý hay còn TODO.
- Báo lệnh validation đã chạy và pass/fail.

