'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronRight, Menu, X,
  Globe, Building2, Factory, LogOut, LayoutDashboard, Package,
  CalendarClock, FileText, Receipt, MessageSquare, HelpCircle, Settings, Building
} from 'lucide-react';

/**
 * CustomerPortalShell – Tailwind UI (modern + responsive)
 * - Menü içeriği değişmedi (MENU/Access aynı)
 * - Sol menü: accordion + active indicator + collapse + mobile drawer
 * - Üst bar: scope switcher + logout
 */
/*
export default function TestPage() {
  return (
    <div className="bg-red-500 text-white p-4">
      Tailwind is working 🚀
    </div>
  );
}
  */


export type CustomerRole =
  | 'CustomerGlobalAdmin'
  | 'CustomerCountryManager'
  | 'CustomerOfficeUser'
  | 'CustomerReadOnly';

export type Company = { id: string; name: string };
export type Country = { id: string; companyId: string; iso: string; name: string };
export type Office  = { id: string; companyId: string; countryId: string; name: string };

/* ---------- Mock data (API ile değişecek) ---------- */
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

/* ---------- Menü içeriği (DEĞİŞMEDİ) ---------- */
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

export type MenuItem = { key: keyof typeof Access; label: string; icon?: React.ReactNode };
const MENU: { group: string; icon?: React.ReactNode; items: MenuItem[] }[] = [
  { group: 'Overview', icon: <LayoutDashboard className="h-4 w-4" />, items: [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> }
  ]},
  { group: 'Shipments', icon: <Package className="h-4 w-4" />, items: [
    { key: 'shipments_active',    label: 'Active Shipments',    icon: <Package className="h-4 w-4" /> },
    { key: 'shipments_completed', label: 'Completed Shipments', icon: <Package className="h-4 w-4" /> },
    { key: 'order_tracking',      label: 'Order Tracking',      icon: <CalendarClock className="h-4 w-4" /> },
    { key: 'create_shipment',     label: 'Create Shipment',     icon: <Package className="h-4 w-4" /> },
    { key: 'document_upload',     label: 'Document Upload',     icon: <FileText className="h-4 w-4" /> }
  ]},
  { group: 'Planning', icon: <CalendarClock className="h-4 w-4" />, items: [
    { key: 'planned_routes',   label: 'Planned Routes',   icon: <CalendarClock className="h-4 w-4" /> },
    { key: 'capacity_requests',label: 'Capacity Requests',icon: <Factory className="h-4 w-4" /> }
  ]},
  { group: 'Finance', icon: <Receipt className="h-4 w-4" />, items: [
    { key: 'invoices',       label: 'Invoices',       icon: <Receipt className="h-4 w-4" /> },
    { key: 'payment_status', label: 'Payment Status', icon: <Receipt className="h-4 w-4" /> },
    { key: 'quotes',         label: 'Quotes',         icon: <Receipt className="h-4 w-4" /> }
  ]},
  { group: 'Documents', icon: <FileText className="h-4 w-4" />, items: [
    { key: 'customs_docs', label: 'Customs Documents',       icon: <FileText className="h-4 w-4" /> },
    { key: 'safety_certs', label: 'Safety & Compliance Cert',icon: <FileText className="h-4 w-4" /> }
  ]},
  { group: 'Support', icon: <MessageSquare className="h-4 w-4" />, items: [
    { key: 'message_center', label: 'Message Center', icon: <MessageSquare className="h-4 w-4" /> },
    { key: 'tickets',        label: 'Tickets',        icon: <MessageSquare className="h-4 w-4" /> },
    { key: 'help_center',    label: 'Help Center',    icon: <HelpCircle className="h-4 w-4" /> }
  ]},
  { group: 'Account', icon: <Settings className="h-4 w-4" />, items: [
    { key: 'profile_settings', label: 'Profile & Settings', icon: <Settings className="h-4 w-4" /> },
    { key: 'linked_scopes',    label: 'Linked Offices/Countries', icon: <Building2 className="h-4 w-4" /> }
  ]}
];

/* ---------- Scope & RBAC ---------- */
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
  const { userRole } = useScope();
  return Access[menuKey].includes(userRole) ? <>{children}</> :
    <div className="p-6 text-sm text-red-600">You do not have access to this section.</div>;
}

/* ================================ UI ===================================== */

function ScopeSwitcher(){
  const { scope, setScope, userRole } = useScope();
  const countryOptions = useMemo(()=>countries.filter(c=>c.companyId===scope.companyId),[scope.companyId]);
  const officeOptions  = useMemo(()=>offices.filter(o=>o.companyId===scope.companyId && o.countryId===scope.countryId),[scope.companyId, scope.countryId]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
        Role: <b>{userRole}</b>
      </span>

      <PillSelect
        icon={<Globe className="h-3.5 w-3.5" />} label="Company"
        value={scope.companyId}
        options={companies.map(c=>({label:c.name, value:c.id}))}
        onChange={(companyId)=>{
          const firstCountry = countries.find(c=>c.companyId===companyId) ?? countries[0];
          const firstOffice  = offices.find(o=>o.countryId===firstCountry.id) ?? offices[0];
          setScope({ companyId, countryId:firstCountry.id, officeId:firstOffice.id });
        }}
      />
      <PillSelect
        icon={<Building className="h-3.5 w-3.5" />} label="Country"
        value={scope.countryId}
        options={countryOptions.map(c=>({label:`${c.name} (${c.iso})`, value:c.id}))}
        onChange={(countryId)=>{
          const firstOffice = offices.find(o=>o.countryId===countryId) ?? offices[0];
          setScope({ ...scope, countryId, officeId:firstOffice.id });
        }}
      />
      <PillSelect
        icon={<Factory className="h-3.5 w-3.5" />} label="Office"
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
  const active = options.find(o=>o.value===value)?.label ?? 'Select';
  return (
    <div className="relative">
      <button
        className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
        onClick={()=>setOpen(o=>!o)}
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
          >
            {options.map(opt=>(
              <li key={opt.value}>
                <button
                  onClick={()=>{ onChange(opt.value); setOpen(false); }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${opt.value===value?'bg-gray-50 dark:bg-gray-800':''}`}
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
  const { userRole } = useScope();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // aktif item’in olduğu grup varsayılan açık
  React.useEffect(() => {
    const def: Record<string, boolean> = {};
    for (const g of MENU) {
      const visible = g.items.filter(i => Access[i.key].includes(userRole));
      if (visible.some(i => i.key === active)) def[g.group] = true;
    }
    setOpenGroups(def);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <span className="text-sm font-bold">RRR</span>
          </div>
          {!collapsed && <span className="text-sm font-semibold">SSS</span>}
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
          const isOpen = openGroups[group.group] ?? false;

          return (
            <div key={group.group} className="mb-2">
              <button
                onClick={()=>setOpenGroups(s=>({...s, [group.group]: !isOpen}))}
                className={`${collapsed ? 'px-2' : 'px-3'} group flex w-full items-center justify-between rounded-lg py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900`}
                aria-expanded={isOpen}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="opacity-70">{group.icon}</span>
                  {!collapsed && <span>{group.group}</span>}
                </span>
                {!collapsed && (isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
              </button>

              <AnimatePresence initial={false}>
                {(isOpen || collapsed) && (
                  <motion.ul
                    key={`${group.group}-list`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className={`overflow-hidden ${collapsed ? 'px-1' : 'px-1.5'}`}
                  >
                    {visibleItems.map(item => {
                      const isActive = active === item.key;
                      return (
                        <li key={item.key}>
                          <button
                            onClick={() => { setActive(item.key); setSidebarOpen(false); }}
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

/* ------------------------- Page stubs + atoms ----------------------------- */

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
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard title="Active Shipments" value="42" trend="+8%" />
        <KpiCard title="Invoices Due" value="€ 18,450" trend="-3%" />
        <KpiCard title="On-Time Performance" value="96%" trend="+1%" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Recent Activity">
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>• Shipment #RF-1042 departed İzmir</li>
            <li>• Invoice INV-2025-091 generated</li>
            <li>• ETA change: RF-1031 (Berlin → Rotterdam)</li>
          </ul>
        </Panel>
        <Panel title="Upcoming Milestones" className="lg:col-span-2">
          <div className="h-36 rounded-xl border border-dashed p-4 text-sm text-gray-500 dark:border-gray-700">
            Calendar / Gantt placeholder
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* Basit içerik stubları (menü değişmedi) */
function ShipmentsActive(){ return <Panel title="Active Shipments"><div className="text-sm text-gray-700 dark:text-gray-300">List active shipments (scoped).</div></Panel>; }
function ShipmentsCompleted(){ return <Panel title="Completed Shipments"><div className="text-sm text-gray-700 dark:text-gray-300">List completed shipments.</div></Panel>; }
function OrderTracking(){ return <Panel title="Order Tracking"><div className="text-sm text-gray-700 dark:text-gray-300">Real-time tracking & alerts.</div></Panel>; }
function CreateShipment(){ return <Panel title="Create Shipment"><div className="text-sm text-gray-700 dark:text-gray-300">Create shipment form.</div></Panel>; }
function DocumentUpload(){ return <Panel title="Document Upload"><div className="text-sm text-gray-700 dark:text-gray-300">Upload docs.</div></Panel>; }
function PlannedRoutes(){ return <Panel title="Planned Routes"><div className="text-sm text-gray-700 dark:text-gray-300">Planned routes & wagons.</div></Panel>; }
function CapacityRequests(){ return <Panel title="Capacity Requests"><div className="text-sm text-gray-700 dark:text-gray-300">Capacity requests.</div></Panel>; }
function Invoices(){ return <Panel title="Invoices"><div className="text-sm text-gray-700 dark:text-gray-300">Invoices list.</div></Panel>; }
function PaymentStatus(){ return <Panel title="Payment Status"><div className="text-sm text-gray-700 dark:text-gray-300">Open balances.</div></Panel>; }
function Quotes(){ return <Panel title="Quotes"><div className="text-sm text-gray-700 dark:text-gray-300">Quotes management.</div></Panel>; }
function CustomsDocs(){ return <Panel title="Customs Documents"><div className="text-sm text-gray-700 dark:text-gray-300">Customs docs per shipment.</div></Panel>; }
function SafetyCerts(){ return <Panel title="Safety & Compliance"><div className="text-sm text-gray-700 dark:text-gray-300">Compliance certificates.</div></Panel>; }
function MessageCenter(){ return <Panel title="Message Center"><div className="text-sm text-gray-700 dark:text-gray-300">Secure messaging.</div></Panel>; }
function Tickets(){ return <Panel title="Tickets"><div className="text-sm text-gray-700 dark:text-gray-300">Tickets & SLAs.</div></Panel>; }
function HelpCenter(){ return <Panel title="Help Center"><div className="text-sm text-gray-700 dark:text-gray-300">FAQ & guides.</div></Panel>; }
function ProfileSettings(){ return <Panel title="Profile & Settings"><div className="text-sm text-gray-700 dark:text-gray-300">Profile, notifications, language & locale.</div></Panel>; }
function LinkedScopes(){ return <Panel title="Linked Offices/Countries"><div className="text-sm text-gray-700 dark:text-gray-300">Linked countries/offices.</div></Panel>; }

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

/* =============================== ROOT ==================================== */

export default function CustomerPortalShell({ showInnerHeader = false }: { showInnerHeader?: boolean }) {
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
                {!showInnerHeader && (
                  <div className="hidden text-sm text-gray-500 lg:block">
                    <span className="font-semibold text-gray-900 dark:text-white">Dashboard</span>
                    <span className="mx-2 text-gray-300">/</span>
                    <span>Home</span>
                  </div>
                )}
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
