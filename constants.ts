import { Role } from './types';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';

export interface NavItem {
  path: string;
  name: string;
  icon: IconProp;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { path: 'dashboard', name: 'Kontrol Paneli', icon: 'tachometer-alt', roles: [Role.Admin, Role.Staff] },
  { path: 'pos', name: 'Hızlı Satış', icon: 'cash-register', roles: [Role.Admin, Role.Staff] },
  { path: 'stock', name: 'Stok Yönetimi', icon: 'box-open', roles: [Role.Admin, Role.Staff] },
  { path: 'suppliers', name: 'Tedarikçiler', icon: 'truck', roles: [Role.Admin] },
  { path: 'reports', name: 'Raporlar', icon: 'chart-line', roles: [Role.Admin] },
  { path: 'settings', name: 'Ayarlar', icon: 'cog', roles: [Role.Admin, Role.Staff] },
];