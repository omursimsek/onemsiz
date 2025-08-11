'use client';

const AppRole = {
  SuperAdmin: 0,
  Staff: 1,
  TenantAdmin: 2,
  TenantUser: 3
} as const;

type TenantRow = { id:string; name:string; slug:string; isActive:boolean; createdAt:string };

export default function TenantRoleForm({tenants}:{tenants:TenantRow[]}){
  const isTenantRole = (roleNum: number) =>
    roleNum === AppRole.TenantAdmin || roleNum === AppRole.TenantUser;

  function onRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = Number(e.target.value);
    const req = isTenantRole(val);
    const sel = document.getElementById('tenantSelect') as HTMLSelectElement | null;
    if (sel){
      sel.required = req;
      sel.disabled = !req;
      if (!req) sel.value = ''; // platform rolüne geçince seçim temizlensin
    }
  }

  return (
    <form action="/api/super/users/create" method="post"
          style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12}}>
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="text" placeholder="Geçici şifre" required />

      {/* ENUM: value’lar sayısal */}
      <select name="role" id="roleSelect"
              defaultValue={String(AppRole.TenantUser)}
              onChange={onRoleChange}>
        <option value={AppRole.TenantUser}>TenantUser</option>
        <option value={AppRole.TenantAdmin}>TenantAdmin</option>
        <option value={AppRole.Staff}>Staff</option>
        <option value={AppRole.SuperAdmin}>SuperAdmin</option>
      </select>

      <select name="tenantId" id="tenantSelect" defaultValue=""
              required aria-label="Tenant">
        <option value="" disabled>Tenant seçin</option>
        {tenants.map(t => (
          <option key={t.id} value={t.id} disabled={!t.isActive}>
            {t.name} ({t.slug}){t.isActive ? '' : ' — pasif'}
          </option>
        ))}
      </select>

      <button type="submit" style={{gridColumn:'1 / -1'}}>Oluştur</button>
      <p style={{gridColumn:'1 / -1', fontSize:12, color:'#64748b', margin:0}}>
        Not: Staff/SuperAdmin rollerinde tenant seçimi gerekmez ve alan otomatik devre dışı kalır.
      </p>
    </form>
  );
}
