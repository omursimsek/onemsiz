'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  ChevronDown, ChevronRight, Menu, X,
  Globe, Building2, Factory,
  LayoutDashboard, Package,
  CalendarClock, FileText, Receipt, MessageSquare, HelpCircle, Settings, Building
} from 'lucide-react';

/** ============================== RBAC & Mock ============================== */

export type CustomerRole =
  | 'CustomerGlobalAdmin'
  | 'CustomerCountryManager'
  | 'CustomerOfficeUser'
  | 'CustomerReadOnly';

export type Company = { id: string; name: string };
export type Country = { id: string; companyId: string; iso: string; name: string };
export type Office  = { id: string; companyId: string; countryId: string; name: string };

const companies: Company[] = [
  { id: 'c1', name: 'RailFlow Logistics' },
  { id: 'c2', name: 'IntermodalCorp' }
];
const countries: Country[] = [
  { id: 'ct1', companyId: 'c1', iso: 'DE', name: 'Germany' },
  { id: 'ct2', companyId: 'c1', iso: 'TR', name: 'Türkiye' },
  { id: 'ct3', companyId: 'c2', iso: 'NL', name: 'Netherlands' }
];
const offices: Office[] = [
  { id: 'o1', companyId: 'c1', countryId: 'ct1', name: 'Berlin' },
  { id: 'o2', companyId: 'c1', countryId: 'ct2', name: 'İzmir' },
  { id: 'o3', companyId: 'c1', countryId: 'ct2', name: 'İstanbul' },
  { id: 'o4', companyId: 'c2', countryId: 'ct3', name: 'Rotterdam' }
];
const currentUser = {
  name: 'Omur',
  roles: [
    { level: 'company' as const, companyId: 'c1', role: 'CustomerGlobalAdmin' as CustomerRole },
    { level: 'country' as const, countryId: 'ct2', role: 'CustomerCountryManager' as CustomerRole },
    { level: 'office'  as const, officeId:  'o2', role: 'CustomerOfficeUser'  as CustomerRole }
  ]
};

/** ================================ Access ================================ */

const Access: Record<string, CustomerRole[]> = {
  dashboard: ['CustomerGlobalAdmin','CustomerCountryManager','CustomerOfficeUser','CustomerReadOnly'],
  shipments_active: ['CustomerGlobalAdmin','CustomerCountryManager','CustomerOfficeUser','CustomerReadOnly'],
  shipments_completed: ['CustomerGlobalAdmin','CustomerCountryManager','CustomerOfficeUser','CustomerReadOnly'],
  order_tracking: ['CustomerGlobalAdmin','CustomerCountryManager','CustomerOfficeUser','CustomerReadOnly'],
  create_shipment: ['CustomerGlobalAdmin','CustomerCountryManager','CustomerOfficeUser'],
  document_upload: ['CustomerGlobalAdmin','CustomerCountryManager','CustomerOfficeUser'],
  planned_routes: ['CustomerGlobalAdmin','CustomerCountryManager','CustomerOfficeUser','CustomerReadOnly'],
  capacity_requests: ['CustomerGlobalAdmin','CustomerCountryManager','CustomerOfficeUser'],
  invoices: ['CustomerGlobalAdmin','CustomerCountryManager','CustomerOfficeUser','CustomerReadOnly'],
  payment_status: ['CustomerGlobalAdmin','CustomerCountryManager','CustomerOfficeUser','CustomerReadOnly'],
  quotes: ['CustomerGlobalAdmin','CustomerCountryManager','CustomerOfficeUser'],
  customs_docs: ['CustomerGlobalAdmin','CustomerCountryManager','CustomerOfficeUser','CustomerReadOnly'],
  safety_certs: ['CustomerGlobalAdmin','CustomerCountryManager','CustomerOfficeUser','CustomerReadOnly'],
  message_center: ['CustomerGlobalAdmin','CustomerCountryManager','CustomerOfficeUser'],
  tickets: ['CustomerGlobalAdmin','CustomerCountryManager','CustomerOfficeUser'],
  help_center: ['CustomerGlobalAdmin','CustomerCountryManager','CustomerOfficeUser','CustomerReadOnly'],
  profile_settings: ['CustomerGlobalAdmin','CustomerCountryManager','CustomerOfficeUser','CustomerReadOnly'],
  linked_scopes: ['CustomerGlobalAdmin','CustomerCountryManager']
};

export type MenuItem = { key: keyof typeof Access; icon?: React.ReactNode; labelKey: string };
type MenuGroup = { groupKey: string; icon?: React.ReactNode; items: MenuItem[] };

/** MENÜ: Etiket yerine i18n anahtarları tutulur */
const MENU_DEF: MenuGroup[] = [
  { groupKey: 'overview', icon: <LayoutDashboard className="h-4 w-4" />, items: [
    { key: 'dashboard', labelKey: 'items.dashboard', icon: <LayoutDashboard className="h-4 w-4" /> }
  ]},
  { groupKey: 'shipments', icon: <Package className="h-4 w-4" />, items: [
    { key: 'shipments_active',    labelKey: 'items.shipments_active',    icon: <Package className="h-4 w-4" /> },
    { key: 'shipments_completed', labelKey: 'items.shipments_completed', icon: <Package className="h-4 w-4" /> },
    { key: 'order_tracking',      labelKey: 'items.order_tracking',      icon: <CalendarClock className="h-4 w-4" /> },
    { key: 'create_shipment',     labelKey: 'items.create_shipment',     icon: <Package className="h-4 w-4" /> },
    { key: 'document_upload',     labelKey: 'items.document_upload',     icon: <FileText className="h-4 w-4" /> }
  ]},
  { groupKey: 'planning', icon: <CalendarClock className="h-4 w-4" />, items: [
    { key: 'planned_routes',   labelKey: 'items.planned_routes',   icon: <CalendarClock className="h-4 w-4" /> },
    { key: 'capacity_requests',labelKey: 'items.capacity_requests',icon: <Factory className="h-4 w-4" /> }
  ]},
  { groupKey: 'finance', icon: <Receipt className="h-4 w-4" />, items: [
    { key: 'invoices',       labelKey: 'items.invoices',       icon: <Receipt className="h-4 w-4" /> },
    { key: 'payment_status', labelKey: 'items.payment_status', icon: <Receipt className="h-4 w-4" /> },
    { key: 'quotes',         labelKey: 'items.quotes',         icon: <Receipt className="h-4 w-4" /> }
  ]},
  { groupKey: 'documents', icon: <FileText className="h-4 w-4" />, items: [
    { key: 'customs_docs', labelKey: 'items.customs_docs', icon: <FileText className="h-4 w-4" /> },
    { key: 'safety_certs', labelKey: 'items.safety_certs', icon: <FileText className="h-4 w-4" /> }
  ]},
  { groupKey: 'support', icon: <MessageSquare className="h-4 w-4" />, items: [
    { key: 'message_center', labelKey: 'items.message_center', icon: <MessageSquare className="h-4 w-4" /> },
    { key: 'tickets',        labelKey: 'items.tickets',        icon: <MessageSquare className="h-4 w-4" /> },
    { key: 'help_center',    labelKey: 'items.help_center',    icon: <HelpCircle className="h-4 w-4" /> }
  ]},
  { groupKey: 'account', icon: <Settings className="h-4 w-4" />, items: [
    { key: 'profile_settings', labelKey: 'items.profile_settings', icon: <Settings className="h-4 w-4" /> },
    { key: 'linked_scopes',    labelKey: 'items.linked_scopes',    icon: <Building2 className="h-4 w-4" /> }
  ]}
];

/** ================================ Context ================================ */

export type Scope = { companyId: string; countryId: string; officeId: string };
const ScopeContext = createContext<{ scope: Scope; setScope: (s: Scope) => void; userRole: CustomerRole } | null>(null);
function useScope(){ const c = useContext(ScopeContext); if(!c) throw new Error('ScopeContext missing'); return c; }

function resolveRoleForScope(scope: Scope): CustomerRole {
  const strength: Record<CustomerRole, number> = { CustomerGlobalAdmin:4, CustomerCountryManager:3, CustomerOfficeUser:2, CustomerReadOnly:1 };
  let best: CustomerRole = 'CustomerReadOnly';
  for (const r of currentUser.roles) {
    if (r.level==='company' && r.companyId===scope.companyId && strength[r.role]>strength[best]) best = r.role;
    if (r.level==='country' && r.countryId===scope.countryId && strength[r.role]>strength[best]) best = r.role;
    if (r.level==='office'  && r.officeId===scope.officeId   && strength[r.role]>strength[best]) best = r.role;
  }
  return best;
}

function ProtectedView({ menuKey, children }: { menuKey: keyof typeof Access; children: React.ReactNode }) {
  const t = useTranslations('portal'); // localization
  const { userRole } = useScope();
  return Access[menuKey].includes(userRole) ? <>{children}</> :
    <div className="p-6 text-sm text-red-600">{t('noAccess')}</div>;
}

/** ================================ UI ==================================== */

function ScopeSwitcher(){
  const tp = useTranslations('portal'); // text for portal UI
  const { scope, setScope, userRole } = useScope();
  const countryOptions = useMemo(()=>countries.filter(c=>c.companyId===scope.companyId),[scope.companyId]);
  const officeOptions  = useMemo(()=>offices.filter(o=>o.companyId===scope.companyId && o.countryId===scope.countryId),[scope.companyId, scope.countryId]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {tp('role')}: <b>{userRole}</b>
      </span>

      <PillSelect
        icon={<Globe className="h-3.5 w-3.5" />} label={tp('company')}
        value={scope.companyId}
        options={companies.map(c=>({label:c.name, value:c.id}))}
        onChange={(companyId)=>{
          const firstCountry = countries.find(c=>c.companyId===companyId) ?? countries[0];
          const firstOffice  = offices.find(o=>o.countryId===firstCountry.id) ?? offices[0];
          setScope({ companyId, countryId:firstCountry.id, officeId:firstOffice.id });
        }}
      />
      <PillSelect
        icon={<Building className="h-3.5 w-3.5" />} label={tp('country')}
        value={scope.countryId}
        options={countryOptions.map(c=>({label:`${c.name} (${c.iso})`, value:c.id}))}
        onChange={(countryId)=>{
          const firstOffice = offices.find(o=>o.countryId===countryId) ?? offices[0];
          setScope({ ...scope, countryId, officeId:firstOffice.id });
        }}
      />
      <PillSelect
        icon={<Factory className="h-3.5 w-3.5" />} label={tp('office')}
        value={scope.officeId}
        options={officeOptions.map(o=>({label:o.name, value:o.id}))}
        onChange={(officeId)=> setScope({ ...scope, officeId })}
      />
    </div>
  );
}

function PillSelect({
  icon, label, value, options, onChange
}:{
  icon: React.ReactNode; label: string; value: string;
  options: {label:string; value:string}[]; onChange:(v:string)=>void;
}){
  const [open,setOpen]=useState(false);
  const active = options.find(o=>o.value===value)?.label ?? '—';
  return (
    <div className="relative">
      <button
        className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
        onClick={()=>setOpen(o=>!o)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="opacity-70">{icon}</span>
        <span className="font-medium">{label}:</span>
        <span className="text-gray-700 dark:text-gray-200">{active}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition ${open?'rotate-180':''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{opacity:0, y:-6}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-6}}
            className="absolute z-20 mt-2 w-56 rounded-xl border bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
            role="listbox"
          >
            {options.map(opt=>(
              <li key={opt.value}>
                <button
                  onClick={()=>{ onChange(opt.value); setOpen(false); }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${opt.value===value?'bg-gray-50 dark:bg-gray-800':''}`}
                  role="option"
                  aria-selected={opt.value===value}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function Sidebar({
  active, setActive, sidebarOpen, setSidebarOpen
}:{
  active: keyof typeof Access; setActive:(k:keyof typeof Access)=>void;
  sidebarOpen:boolean; setSidebarOpen:(b:boolean)=>void;
}){
  const t = useTranslations('portal.menu');
  const { userRole } = useScope();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const def: Record<string, boolean> = {};
    for (const g of MENU_DEF) {
      const visible = g.items.filter(i => Access[i.key].includes(userRole));
      if (visible.some(i => i.key === active)) def[g.groupKey] = true;
    }
    setOpenGroups(def);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // i18n’lı menü: label’ları runtime’da üret
  const MENU = useMemo(() => MENU_DEF.map(g => ({
    ...g,
    groupLabel: t(`${g.groupKey}.title`),
    items: g.items.map(it => ({ ...it, label: t(it.labelKey) }))
  })), [t]);

  const Wrapper = ({children}:{children:React.ReactNode}) => (
    <div className={`fixed inset-0 z-40 lg:static lg:z-auto ${sidebarOpen?'':'pointer-events-none lg:pointer-events-auto'}`}>
      {sidebarOpen && <div className="absolute inset-0 bg-black/30 lg:hidden" onClick={()=>setSidebarOpen(false)} />}
      <div
        className={`
          absolute left-0 top-0 h-full ${collapsed ? 'w-[84px]' : 'w-72'}
          border-r bg-white/95 backdrop-blur shadow-lg
          dark:border-gray-800 dark:bg-gray-950
          lg:static lg:shadow-none
          transition-[width,transform] duration-200 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {children}
      </div>
    </div>
  );

  return (
    <Wrapper>
      {/* logo + collapse */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900">
            <span className="text-sm font-bold">CP</span>
          </div>
          {!collapsed && <span className="text-sm font-semibold">Portal</span>}
        </div>
        <div className="flex items-center gap-1">
          <button className="rounded-md p-2 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-800" onClick={()=>setSidebarOpen(false)} aria-label="Close sidebar">
            <X className="h-4 w-4" />
          </button>
          <button className="hidden rounded-md p-2 hover:bg-gray-100 lg:inline-flex dark:hover:bg-gray-800" onClick={()=>setCollapsed(v=>!v)} aria-label="Collapse">
            <svg className={`h-4 w-4 transition ${collapsed ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* menü */}
      <div className="h-[calc(100%-56px)] overflow-y-auto px-2 pb-4">
        {MENU.map(group => {
          const visibleItems = group.items.filter(i => Access[i.key].includes(userRole));
          if (visibleItems.length === 0) return null;
          const isOpen = openGroups[group.groupKey] ?? false;

          return (
            <div key={group.groupKey} className="mb-2">
              <button
                onClick={()=>setOpenGroups(s=>({...s, [group.groupKey]: !isOpen}))}
                className={`${collapsed ? 'px-2' : 'px-3'} group flex w-full items-center justify-between rounded-lg py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900`}
                aria-expanded={isOpen}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="opacity-70">{group.icon}</span>
                  {!collapsed && <span>{group.groupLabel}</span>}
                </span>
                {!collapsed && (isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
              </button>

              <AnimatePresence initial={false}>
                {(isOpen || collapsed) && (
                  <motion.ul
                    key={`${group.groupKey}-list`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className={`overflow-hidden ${collapsed ? 'px-1' : 'px-1.5'}`}
                  >
                    {visibleItems.map(item => {
                      const isActive = false; // entegrasyonda aktif route’a göre ayarla
                      return (
                        <li key={item.key}>
                          <button
                            onClick={() => { /* setActive(item.key); router.push(...) */ }}
                            className={`group mt-1 flex w-full items-center gap-2 rounded-xl ${collapsed ? 'px-2 py-2' : 'px-3 py-2'} text-sm hover:bg-gray-100 dark:hover:bg-gray-800 relative ${isActive ? 'bg-gray-100 font-medium dark:bg-gray-800' : ''}`}
                          >
                            <span className={`absolute left-0 top-1.5 h-[calc(100%-12px)] w-[3px] rounded-r ${isActive ? 'bg-gray-900 dark:bg-white' : 'bg-transparent'}`} />
                            <span className="opacity-80">{item.icon}</span>
                            {!collapsed && <span className="truncate">{item.label}</span>}
                            {collapsed && (
                              <span className="pointer-events-none absolute left-[76px] z-10 hidden min-w-[160px] rounded-lg border bg-white px-2 py-1 text-xs shadow-md group-hover:block dark:border-gray-700 dark:bg-gray-900">
                                {item.label}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </Wrapper>
  );
}

/** ============================ Page stubs ============================== */

function KpiCard({ title, value, trend }: { title: string; value: string; trend?: string }){
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="text-xs text-gray-500 dark:text-gray-400">{title}</div>
      <div className="mt-1 flex items-end gap-2">
        <div className="text-2xl font-semibold">{value}</div>
        {trend && <span className="text-xs text-emerald-600 dark:text-emerald-400">{trend}</span>}
      </div>
    </div>
  );
}
function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }){
  return (
    <div className={`rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950 ${className||''}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}
function DashboardView() {
  const t = useTranslations('portal.dashboard');
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard title={t('kpi.activeShipments')} value="42" trend="+8%" />
        <KpiCard title={t('kpi.invoicesDue')} value="€ 18,450" trend="-3%" />
        <KpiCard title={t('kpi.onTime')} value="96%" trend="+1%" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title={t('recentActivity')}>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>• {t('activity.sample1')}</li>
            <li>• {t('activity.sample2')}</li>
            <li>• {t('activity.sample3')}</li>
          </ul>
        </Panel>
        <Panel title={t('upcomingMilestones')} className="lg:col-span-2">
          <div className="h-36 rounded-xl border border-dashed p-4 text-sm text-gray-500 dark:border-gray-700">
            {t('calendarPlaceholder')}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/** (diğer stub’larda da i18n anahtarları kullan) */
function ShipmentsActive(){  const t = useTranslations('portal.pages'); return <Panel title={t('activeShipments')}><div className="text-sm text-gray-700 dark:text-gray-300">{t('scopedList')}</div></Panel>; }
function ShipmentsCompleted(){const t = useTranslations('portal.pages'); return <Panel title={t('completedShipments')}><div className="text-sm text-gray-700 dark:text-gray-300">{t('completedList')}</div></Panel>; }
function OrderTracking(){   const t = useTranslations('portal.pages'); return <Panel title={t('orderTracking')}><div className="text-sm text-gray-700 dark:text-gray-300">{t('realtime')}</div></Panel>; }
function CreateShipment(){  const t = useTranslations('portal.pages'); return <Panel title={t('createShipment')}><div className="text-sm text-gray-700 dark:text-gray-300">{t('form')}</div></Panel>; }
function DocumentUpload(){  const t = useTranslations('portal.pages'); return <Panel title={t('documentUpload')}><div className="text-sm text-gray-700 dark:text-gray-300">{t('upload')}</div></Panel>; }
function PlannedRoutes(){   const t = useTranslations('portal.pages'); return <Panel title={t('plannedRoutes')}><div className="text-sm text-gray-700 dark:text-gray-300">{t('planned')}</div></Panel>; }
function CapacityRequests(){const t = useTranslations('portal.pages'); return <Panel title={t('capacityRequests')}><div className="text-sm text-gray-700 dark:text-gray-300">{t('capacity')}</div></Panel>; }
function Invoices(){        const t = useTranslations('portal.pages'); return <Panel title={t('invoices')}><div className="text-sm text-gray-700 dark:text-gray-300">{t('invoicesList')}</div></Panel>; }
function PaymentStatus(){   const t = useTranslations('portal.pages'); return <Panel title={t('paymentStatus')}><div className="text-sm text-gray-700 dark:text-gray-300">{t('balances')}</div></Panel>; }
function Quotes(){          const t = useTranslations('portal.pages'); return <Panel title={t('quotes')}><div className="text-sm text-gray-700 dark:text-gray-300">{t('quotesMgmt')}</div></Panel>; }
function CustomsDocs(){     const t = useTranslations('portal.pages'); return <Panel title={t('customsDocs')}><div className="text-sm text-gray-700 dark:text-gray-300">{t('customsPerShipment')}</div></Panel>; }
function SafetyCerts(){     const t = useTranslations('portal.pages'); return <Panel title={t('safetyCerts')}><div className="text-sm text-gray-700 dark:text-gray-300">{t('compliance')}</div></Panel>; }
function MessageCenter(){   const t = useTranslations('portal.pages'); return <Panel title={t('messageCenter')}><div className="text-sm text-gray-700 dark:text-gray-300">{t('secureMessaging')}</div></Panel>; }
function Tickets(){         const t = useTranslations('portal.pages'); return <Panel title={t('tickets')}><div className="text-sm text-gray-700 dark:text-gray-300">{t('ticketsSla')}</div></Panel>; }
function HelpCenter(){      const t = useTranslations('portal.pages'); return <Panel title={t('helpCenter')}><div className="text-sm text-gray-700 dark:text-gray-300">{t('faqGuides')}</div></Panel>; }
function ProfileSettings(){ const t = useTranslations('portal.pages'); return <Panel title={t('profileSettings')}><div className="text-sm text-gray-700 dark:text-gray-300">{t('profileEtc')}</div></Panel>; }
function LinkedScopes(){    const t = useTranslations('portal.pages'); return <Panel title={t('linkedScopes')}><div className="text-sm text-gray-700 dark:text-gray-300">{t('linkedInfo')}</div></Panel>; }

const ROUTES: Record<keyof typeof Access, React.FC> = {
  dashboard: DashboardView,
  shipments_active: ShipmentsActive,
  shipments_completed: ShipmentsCompleted,
  order_tracking: OrderTracking,
  create_shipment: CreateShipment,
  document_upload: DocumentUpload,
  planned_routes: PlannedRoutes,
  capacity_requests: CapacityRequests,
  invoices: Invoices,
  payment_status: PaymentStatus,
  quotes: Quotes,
  customs_docs: CustomsDocs,
  safety_certs: SafetyCerts,
  message_center: MessageCenter,
  tickets: Tickets,
  help_center: HelpCenter,
  profile_settings: ProfileSettings,
  linked_scopes: LinkedScopes
};

/** =============================== ROOT ==================================== */

export default function CustomerPortalShell() {
  const tb = useTranslations('portal.breadcrumb');
  const [scope, setScope] = useState<Scope>({ companyId: 'c1', countryId: 'ct2', officeId: 'o2' });
  const [activeRoute, setActiveRoute] = useState<keyof typeof Access>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userRole = useMemo(() => resolveRoleForScope(scope), [scope]);
  const RouteComponent = ROUTES[activeRoute];

  return (
    <ScopeContext.Provider value={{ scope, setScope, userRole }}>
      <div className="flex min-h-[calc(100vh-64px)] w-full rounded-2xl border bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        {/* Sidebar */}
        <Sidebar
          active={activeRoute}
          setActive={setActiveRoute}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Topbar */}
          <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-gray-800 dark:bg-gray-900/70">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <button className="rounded-md p-2 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-800" onClick={()=>setSidebarOpen(true)}>
                  <Menu className="h-5 w-5" />
                </button>
                <div className="hidden text-sm text-gray-500 lg:block">
                  <span className="font-semibold text-gray-900 dark:text-white">{tb('section')}</span>
                  <span className="mx-2 text-gray-300">/</span>
                  <span>{tb('home')}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ScopeSwitcher />
              </div>
            </div>
          </div>

          {/* Routed content */}
          <div className="p-4 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRoute}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16 }}
              >
                <ProtectedView menuKey={activeRoute}>
                  <RouteComponent />
                </ProtectedView>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </ScopeContext.Provider>
  );
}
