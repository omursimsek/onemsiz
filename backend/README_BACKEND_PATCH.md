# Backend RBAC + Tenant Patch

Bu paket; SuperAdmin/Staff/TenantAdmin/TenantUser rolleri, Tenant modeli, JWT'te role + tid claim'leri,
policy tabanlı yetkilendirme ve SuperAdmin için tenant CRUD uçlarını içerir.

## Dosya yapısı
- backend/
  - Backend.csproj
  - Program.cs
  - appsettings.json
  - Models/
    - AuthModels.cs (AppRole, Tenant, AppUser, DTO'lar)
    - AppDbContext.cs
  - Controllers/
    - AuthController.cs (login/register)
    - PlatformTenantsController.cs (SuperAdminOnly)
    - HomeController.cs (secure/ping örneği)

## Uygulama
Var olan backend klasörünüzü yedekleyin ve bu patch'teki dosyalarla değiştirin.
Gerekirse `dotnet restore` ve `dotnet run`/`dotnet watch run`.

## Hızlı test
1) SuperAdmin login:
   POST /api/auth/login {"email":"superadmin@example.com","password":"Super#1234"}

2) Tenant oluştur (SuperAdmin token ile):
   POST /api/platform/tenants {"name":"Acme Inc","slug":"acme"}

3) Tenant admin oluştur (SuperAdmin token ile):
   POST /api/auth/register {"email":"owner@acme.com","password":"Owner#1234","role":"TenantAdmin","tenantId":"<TENANT_GUID>"}

4) Tenant admin login ve authorized ping:
   GET /api/secure/ping (Authorization: Bearer <token>)

Not: Varsayılan policy tüm endpointlerde auth gerektirir; public uçlar `[AllowAnonymous]` ile işaretlenmiştir.
