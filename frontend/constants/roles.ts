export enum Role {
  SuperAdmin = 0,
  Staff = 1,
  TenantAdmin = 2,
  TenantUser = 3
}

export const RoleLabels: Record<Role, string> = {
  [Role.SuperAdmin]: 'Super Admin',
  [Role.Staff]: 'Staff',
  [Role.TenantAdmin]: 'Tenant Admin',
  [Role.TenantUser]: 'Tenant User'
};
