import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, Package, ShoppingCart, Truck, BarChart3, Settings,
  Search, Bell, Sun, Moon, Menu, X, ChevronLeft, Plus, ScanLine,
  Eye, EyeOff, LogOut, Pencil, Trash2, PackagePlus, Minus,
  TrendingUp, TrendingDown, AlertTriangle, Wallet, Boxes,
  ShieldCheck, Store, ArrowUpRight, ArrowDownRight, Download,
  CreditCard, Banknote, QrCode, Mail, MapPin, Star, Check,
  ArrowRightLeft, ClipboardList, User, Lock, Globe,
  Coffee, Milk, Croissant, Cookie, Sparkles, Droplets, Wheat, CupSoda, Candy,
  ChevronDown, Printer, RefreshCw, CheckCircle2, Info, PhoneCall, SlidersHorizontal
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import { CATEGORIES, INITIAL_PRODUCTS, INITIAL_SUPPLIERS, SALES_TREND, REVENUE_BY_DAY, CATEGORY_SHARE } from "./data.js";
import { api } from "./api.js";

/* ---------- helpers ---------- */
const cx = (...c) => c.filter(Boolean).join(" ");
const money = (n) => "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const PIE_COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#0EA5E9", "#94A3B8"];

function downloadCSV(filename, headers, rows) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function greeting(d = new Date()) {
  const h = d.getHours();
  if (h >= 5 && h < 12) return { text: "Good morning", emoji: "👋" };
  if (h >= 12 && h < 15) return { text: "Good afternoon", emoji: "☀️" };
  if (h >= 15 && h < 19) return { text: "Good evening", emoji: "🌤️" };
  return { text: "Good night", emoji: "🌙" };
}

function stockStatus(stock, threshold) {
  if (stock === 0) return { label: "Out of Stock", cls: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 ring-1 ring-rose-200 dark:ring-rose-500/30", dot: "bg-rose-500" };
  if (stock <= threshold) return { label: "Low Stock", cls: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-500/30", dot: "bg-amber-500" };
  return { label: "In Stock", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-500/30", dot: "bg-emerald-500" };
}

const ICON_MAP = { Coffee, Milk, Croissant, Cookie, Sparkles, Droplets, Wheat, CupSoda, Candy };
function ProductIcon({ icon, className }) {
  const C = ICON_MAP[icon] || Package;
  return <C className={className} />;
}

/* ---------- atoms ---------- */
function Toggle({ on, onClick }) {
  return (
    <button onClick={onClick} className={cx("relative h-6 w-11 rounded-full transition-colors", on ? "bg-primary-600" : "bg-slate-300 dark:bg-slate-600")} aria-label="toggle theme">
      <span className={cx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all flex items-center justify-center", on ? "left-[22px]" : "left-0.5")}>
        {on ? <Moon size={12} className="text-primary-600" /> : <Sun size={12} className="text-amber-500" />}
      </span>
    </button>
  );
}

function Modal({ open, onClose, children, width = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cx("relative w-full", width, "card !rounded-t-3xl sm:!rounded-2xl p-6 max-h-[92vh] overflow-y-auto animate-[slideUp_.25s_ease]")}>
        {children}
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(16px);opacity:0}to{transform:none;opacity:1}}`}</style>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 pl-3 pr-5 py-3 shadow-2xl text-sm font-medium animate-[slideUp_.25s_ease]">
      <span className="grid place-items-center h-7 w-7 rounded-xl bg-emerald-500 text-white"><Check size={16} /></span>
      {toast}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, delta, up, tint, sub }) {
  return (
    <div className="card p-5 hover:shadow-card transition group">
      <div className="flex items-start justify-between">
        <div className={cx("grid place-items-center h-11 w-11 rounded-2xl text-white shadow-soft", tint)}>
          <Icon size={20} />
        </div>
        <span className={cx("badge", up ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300")}>
          {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{delta}
        </span>
      </div>
      <p className="mt-4 text-[13px] font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="font-display text-[26px] leading-8 font-800 font-extrabold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{sub}</p>
    </div>
  );
}

/* ================= LOGIN ================= */
function LoginScreen({ onLogin, notify }) {
  const [email, setEmail] = useState("admin@stockpilot.io");
  const [pw, setPw] = useState("admin123");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [role, setRole] = useState("Super Admin");
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!email.includes("@")) { setErr("Please enter a valid email address."); return; }
    if (pw.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setErr("");
    onLogin(role, email);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#F8FAFC] dark:bg-[#0F172A]">
      {/* brand panel */}
      <div className="hidden lg:flex relative overflow-hidden flex-col justify-between p-12 bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900 text-white">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-40 -left-24 h-[28rem] w-[28rem] rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="grid place-items-center h-11 w-11 rounded-2xl bg-white/15 backdrop-blur ring-1 ring-white/25 font-display font-extrabold text-xl">S</div>
          <div>
            <p className="font-display font-extrabold text-lg leading-none">StockPilot</p>
            <p className="text-white/60 text-xs mt-1 tracking-widest uppercase">Inventory OS · v3.2</p>
          </div>
        </div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/20 px-3 py-1.5 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Trusted by 2,400+ retail stores worldwide
          </div>
          <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight">Inventory that<br />runs itself<span className="text-emerald-300">.</span></h1>
          <p className="mt-4 max-w-md text-white/70">Real-time stock, smart low-stock alerts, barcode POS and supplier automation — in one minimal workspace built for speed.</p>
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
            {[["99.98%", "Sync uptime"], ["−38%", "Stockouts"], ["4.9/5", "Merchant rating"]].map(([v, l]) => (
              <div key={l} className="rounded-2xl bg-white/10 ring-1 ring-white/15 p-4 backdrop-blur">
                <p className="font-display font-extrabold text-xl">{v}</p>
                <p className="text-xs text-white/60 mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-white/50">© 2026 StockPilot Labs · SOC2 Type II · GDPR ready</p>
      </div>

      {/* form */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="grid place-items-center h-10 w-10 rounded-2xl bg-primary-600 text-white font-extrabold">S</div>
            <p className="font-display font-extrabold text-lg">StockPilot</p>
          </div>
          <div className="card p-7 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-extrabold tracking-tight">Welcome back</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sign in to your store workspace</p>
              </div>
              <span className="badge bg-primary-600/10 text-primary-600 dark:text-primary-300 ring-1 ring-primary-600/20"><ShieldCheck size={13} /> Secure</span>
            </div>

            {/* role indicator */}
            <div className="mt-5 grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/70">
              {["Super Admin", "Store Clerk"].map((r) => (
                <button key={r} onClick={() => setRole(r)} className={cx("flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition", role === r ? "bg-white dark:bg-[#1E293B] shadow-soft text-primary-600 dark:text-white ring-1 ring-slate-200 dark:ring-slate-600" : "text-slate-500 dark:text-slate-400 hover:text-slate-700")}>
                  {r === "Super Admin" ? <ShieldCheck size={15} /> : <Store size={15} />}{r}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5"><Info size={12} /> {role === "Super Admin" ? "Full access: inventory, suppliers, reports & settings." : "Limited access: POS, stock view & daily sales."}</p>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <div>
                <label className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">Email address</label>
                <div className="relative mt-1.5">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@store.com" className="input !pl-10" />
                </div>
              </div>
              <div>
                <label className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">Password</label>
                <div className="relative mt-1.5">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={pw} onChange={(e) => setPw(e.target.value)} type={show ? "text" : "password"} placeholder="••••••••" className="input !pl-10 !pr-11" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              {err && <p className="flex items-center gap-2 text-[13px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 ring-1 ring-rose-200 dark:ring-rose-500/20 rounded-xl px-3 py-2.5"><AlertTriangle size={15} />{err}</p>}
              <div className="flex items-center justify-between text-[13px]">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-300 font-medium">
                  <button type="button" role="switch" aria-checked={remember} onClick={() => setRemember(!remember)} className={cx("h-5 w-9 rounded-full p-0.5 transition", remember ? "bg-primary-600" : "bg-slate-300 dark:bg-slate-600")}>
                    <span className={cx("block h-4 w-4 rounded-full bg-white shadow transition-transform", remember && "translate-x-4")} />
                  </button>
                  Remember me
                </label>
                <button type="button" onClick={() => { if (!email.includes("@")) { setErr("Enter your email first, then request a reset link."); return; } if (notify) notify(`Reset link sent to ${email} (demo)`); }} className="font-semibold text-primary-600 dark:text-primary-300 hover:underline">Forgot password?</button>
              </div>
              <button className="btn-primary w-full !py-3 text-[15px]">Sign in securely <ArrowRightLeft size={16} className="rotate-180" /></button>
            </form>

            <div className="mt-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 ring-1 ring-slate-200 dark:ring-slate-700/60 p-3.5 text-xs text-slate-500 dark:text-slate-400">
              <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">Demo credentials</p>
              <p>Admin — <span className="font-mono">admin@stockpilot.io / admin123</span></p>
              <p className="mt-0.5">OTP step is simulated — any 6-digit code works.</p>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-5">Protected by rate-limiting, 2FA & audit logs</p>
        </div>
      </div>
    </div>
  );
}

function OtpScreen({ email, onVerify, onBack }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(28);
  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const setDigit = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...code]; next[i] = v; setCode(next);
    if (v && i < 5) document.getElementById("otp-" + (i + 1))?.focus();
  };

  return (
    <div className="min-h-screen grid place-items-center bg-[#F8FAFC] dark:bg-[#0F172A] p-6">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="mx-auto grid place-items-center h-14 w-14 rounded-2xl bg-primary-600/10 text-primary-600 dark:text-primary-300 ring-1 ring-primary-600/20">
          <ShieldCheck size={26} />
        </div>
        <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight">Two-factor verification</h2>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">We sent a 6-digit OTP to<br /><span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span></p>
        <div className="mt-6 flex justify-center gap-2">
          {code.map((d, i) => (
            <input key={i} id={"otp-" + i} value={d} onChange={(e) => setDigit(i, e.target.value)} maxLength={1} inputMode="numeric"
              className="h-12 w-11 text-center text-lg font-extrabold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 outline-none focus:ring-2 focus:ring-primary-600/40 focus:border-primary-600 transition" />
          ))}
        </div>
        <button onClick={() => onVerify()} className="btn-primary w-full mt-6 !py-3">Verify & enter dashboard</button>
        <div className="mt-4 flex items-center justify-between text-[13px]">
          <button onClick={onBack} className="font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">← Back to login</button>
          {timer > 0 ? <span className="text-slate-400">Resend in 0:{String(timer).padStart(2, "0")}</span>
            : <button onClick={() => setTimer(28)} className="font-semibold text-primary-600 dark:text-primary-300 hover:underline">Resend code</button>}
        </div>
      </div>
    </div>
  );
}

/* ================= SIDEBAR ================= */
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", icon: Package, badge: "12" },
  { id: "pos", label: "POS & Stock", icon: ShoppingCart },
  { id: "suppliers", label: "Suppliers", icon: Truck },
  { id: "reports", label: "Sales Reports", icon: BarChart3 },
  { id: "settings", label: "Admin Settings", icon: Settings },
];

function Sidebar({ active, setActive, collapsed, setCollapsed, mobileOpen, setMobileOpen, dark, toggleDark, role, notify }) {
  const body = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 h-[72px] shrink-0">
        <div className="grid place-items-center h-10 w-10 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 text-white font-extrabold shadow-soft shrink-0">S</div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-display font-extrabold leading-none truncate">StockPilot</p>
            <p className="text-[11px] text-slate-400 mt-1 tracking-widest uppercase">Minimarket OS</p>
          </div>
        )}
      </div>
      {!collapsed && (
        <div className="mx-4 mb-3 flex items-center gap-2 rounded-2xl bg-primary-600/10 dark:bg-primary-600/15 ring-1 ring-primary-600/20 px-3 py-2.5 text-xs font-semibold text-primary-700 dark:text-primary-200">
          <span className="grid place-items-center h-7 w-7 rounded-xl bg-primary-600 text-white shrink-0">{role === "Super Admin" ? <ShieldCheck size={15} /> : <Store size={15} />}</span>
          <span className="truncate">{role}</span>
          <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        </div>
      )}
      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        {NAV.map((n) => (
          <button key={n.id} onClick={() => { setActive(n.id); setMobileOpen(false); }}
            className={cx("w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition group",
              active === n.id ? "bg-primary-600 text-white shadow-soft dark:shadow-glow" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70")}>
            <n.icon size={19} className="shrink-0" />
            {!collapsed && <span className="truncate">{n.label}</span>}
            {!collapsed && n.badge && <span className={cx("ml-auto text-[11px] font-bold rounded-full px-2 py-0.5", active === n.id ? "bg-white/20" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300")}>{n.badge}</span>}
          </button>
        ))}
      </nav>
      <div className="p-3 space-y-1">
        {!collapsed && (
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 mb-2">
            <p className="text-[13px] font-bold flex items-center gap-1.5"><Sparkles size={14} /> Go Pro</p>
            <p className="text-xs text-white/75 mt-1">Unlock barcode AI & auto-reorder.</p>
            <button onClick={() => notify && notify("Pro plan coming soon — barcode AI & auto-reorder")} className="mt-3 w-full rounded-xl bg-white/95 text-emerald-700 text-xs font-bold py-2 hover:bg-white">Upgrade plan</button>
          </div>
        )}
        <div className={cx("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm", collapsed && "justify-center")}>
          {!collapsed && <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium text-[13px]">{dark ? <Moon size={16} /> : <Sun size={16} />} {dark ? "Dark" : "Light"}</span>}
          <span className={cx(!collapsed && "ml-auto")}><Toggle on={dark} onClick={toggleDark} /></span>
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60">
          <ChevronLeft size={15} className={cx("transition-transform", collapsed && "rotate-180")} />{!collapsed && "Collapse"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className={cx("hidden lg:flex flex-col shrink-0 bg-white dark:bg-[#1E293B]/60 backdrop-blur border-r border-slate-200/80 dark:border-slate-700/50 transition-all duration-300 h-screen sticky top-0", collapsed ? "w-[84px]" : "w-[264px]")}>{body}</aside>
      {/* mobile drawer */}
      <div className={cx("fixed inset-0 z-[60] lg:hidden transition", mobileOpen ? "pointer-events-auto" : "pointer-events-none")}>
        <div onClick={() => setMobileOpen(false)} className={cx("absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity", mobileOpen ? "opacity-100" : "opacity-0")} />
        <aside className={cx("absolute left-0 top-0 h-full w-[280px] bg-white dark:bg-[#1E293B] shadow-2xl transition-transform duration-300", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
          <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-5 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><X size={18} /></button>
          {body}
        </aside>
      </div>
    </>
  );
}

/* ================= TOPBAR ================= */
function Topbar({ onMenu, dark, toggleDark, role, email, onLogout, query, setQuery, active, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([
    { id: 1, icon: AlertTriangle, tint: "bg-amber-500/15 text-amber-500", title: "Low stock warning", desc: "Dark Chocolate Bar tinggal 9 pcs — segera restock.", time: "2 mnt lalu", unread: true },
    { id: 2, icon: Truck, tint: "bg-emerald-500/15 text-emerald-500", title: "Pesanan diterima", desc: "PO-2081 dari GreenFarm Dairy sudah tiba di gudang.", time: "1 jam lalu", unread: true },
    { id: 3, icon: BarChart3, tint: "bg-primary-600/10 text-primary-600 dark:text-primary-300", title: "Laporan harian siap", desc: "Penjualan hari ini $4,180 dari 312 order.", time: "3 jam lalu", unread: true },
  ]);
  const unread = notifs.filter((n) => n.unread).length;
  const titles = { dashboard: "Dashboard", inventory: "Inventory", pos: "POS & Stock Control", suppliers: "Suppliers", reports: "Sales Reports", settings: "Admin Settings" };
  const subs = { dashboard: "Store performance at a glance", inventory: "Manage products, pricing & stock levels", pos: "Checkout, barcode scan & quick adjustments", suppliers: "Vendor directory & purchase performance", reports: "Revenue analytics & export", settings: "Workspace, roles & preferences" };
  return (
    <header className="sticky top-0 z-40 h-[72px] flex items-center gap-3 px-4 sm:px-6 bg-[#F8FAFC]/85 dark:bg-[#0F172A]/85 backdrop-blur border-b border-slate-200/70 dark:border-slate-700/50">
      <button onClick={onMenu} className="lg:hidden p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-700/60"><Menu size={20} /></button>
      <div className="min-w-0">
        <h1 className="font-display font-extrabold text-lg sm:text-xl tracking-tight truncate">{titles[active]}</h1>
        <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 truncate">{subs[active]} · {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="hidden md:flex items-center relative">
          <Search size={16} className="absolute left-3.5 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products, SKU…" className="input !w-64 !pl-10 !rounded-full !bg-white dark:!bg-slate-800/70" />
        </div>
        <button onClick={toggleDark} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition" title="Toggle theme">
          {dark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
        </button>
        <div className="relative">
          <button onClick={() => { setNotifOpen(!notifOpen); setOpen(false); }} className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition" title="Notifikasi">
            <Bell size={18} />
            {unread > 0 && <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 grid place-items-center rounded-full bg-rose-500 text-white text-[10px] font-bold">{unread}</span>}
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 max-w-[85vw] card p-2 z-20 shadow-2xl">
                <div className="flex items-center justify-between px-3 py-2">
                  <p className="font-display font-extrabold text-sm">Notifikasi</p>
                  <button onClick={() => setNotifs(notifs.map((n) => ({ ...n, unread: false })))} className="text-[11px] font-bold text-primary-600 dark:text-primary-300 hover:underline">Tandai semua dibaca</button>
                </div>
                <div className="max-h-[320px] overflow-y-auto space-y-1">
                  {notifs.map((n) => (
                    <button key={n.id} onClick={() => setNotifs(notifs.map((x) => x.id === n.id ? { ...x, unread: false } : x))}
                      className={cx("w-full text-left flex gap-3 rounded-xl px-3 py-2.5 transition", n.unread ? "bg-primary-600/[0.06] dark:bg-primary-600/10 hover:bg-primary-600/[0.1]" : "hover:bg-slate-100 dark:hover:bg-slate-700/60")}>
                      <span className={cx("grid place-items-center h-9 w-9 rounded-xl shrink-0", n.tint)}><n.icon size={17} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="text-[13px] font-bold truncate">{n.title}</span>
                          {n.unread && <span className="h-2 w-2 rounded-full bg-primary-600 shrink-0" />}
                        </span>
                        <span className="block text-xs text-slate-500 dark:text-slate-400 leading-snug mt-0.5">{n.desc}</span>
                        <span className="block text-[10px] text-slate-400 mt-1">{n.time}</span>
                      </span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setNotifOpen(false)} className="w-full mt-1 rounded-xl px-3 py-2.5 text-xs font-bold text-primary-600 dark:text-primary-300 hover:bg-slate-100 dark:hover:bg-slate-700/60">Lihat semua aktivitas</button>
              </div>
            </>
          )}
        </div>
        <div className="relative">
          <button onClick={() => { setOpen(!open); setNotifOpen(false); }} className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 pl-1.5 pr-2.5 py-1.5 hover:shadow-soft transition">
            <span className="grid place-items-center h-8 w-8 rounded-lg bg-gradient-to-br from-primary-600 to-indigo-700 text-white text-sm font-bold">A</span>
            <span className="hidden sm:block text-left leading-tight">
              <span className="block text-[13px] font-bold truncate max-w-[110px]">{email.split("@")[0]}</span>
              <span className="block text-[10px] font-semibold text-primary-600 dark:text-primary-300">{role}</span>
            </span>
            <ChevronDown size={15} className="text-slate-400 hidden sm:block" />
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 mt-2 w-60 card p-2 z-20 shadow-2xl">
                <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-700/60">
                  <p className="text-sm font-bold truncate">{email}</p>
                  <span className="badge mt-1.5 bg-primary-600/10 text-primary-600 dark:text-primary-300 ring-1 ring-primary-600/20">{role === "Super Admin" ? <ShieldCheck size={12} /> : <Store size={12} />} {role}</span>
                </div>
                {[["My profile", User, () => onNavigate("settings", "profile")], ["Store settings", Store, () => onNavigate("settings", "store")], ["Notifications", Bell, () => { setOpen(false); setNotifOpen(true); }]].map(([l, I, fn]) => (
                  <button key={l} onClick={fn} className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300"><I size={16} />{l}</button>
                ))}
                <button onClick={onLogout} className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"><LogOut size={16} /> Log out quickly</button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ================= DASHBOARD ================= */
function DashboardView({ products, setProducts, notify, dbLive, syncProduct, onAdd }) {
  const totalStock = products.reduce((a, p) => a + p.stock, 0);
  const lowCount = products.filter((p) => p.stock > 0 && p.stock <= p.threshold).length;
  const outCount = products.filter((p) => p.stock === 0).length;
  const revenue = 12380;
  const topProducts = [...products].sort((a, b) => (b.price * (120 - b.stock)) - (a.price * (120 - a.stock))).slice(0, 4);
  const lowList = products.filter((p) => p.stock <= p.threshold).slice(0, 5);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  const g = greeting(now);

  const exportSummary = () => {
    downloadCSV("stockpilot-summary.csv",
      ["Metric", "Value"],
      [["Total Stock (units)", totalStock], ["Low Stock Alerts", lowCount + outCount],
       ["Out of Stock", outCount], ["Daily Sales (orders)", 312], ["Total Revenue ($)", revenue]]);
    notify("Summary exported as CSV");
  };

  const restockAll = () => {
    if (!lowList.length) { notify("All stocked — nothing to restock"); return; }
    const next = products.map((p) => p.stock <= p.threshold ? { ...p, stock: p.threshold * 2 } : p);
    if (syncProduct) lowList.forEach((p) => syncProduct({ ...p, stock: p.threshold * 2 }));
    if (setProducts) setProducts(next);
    notify(`Restocked ${lowList.length} items to safe level`);
  };

  return (
    <div className="space-y-5">
      <div className="card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/[0.07] via-transparent to-emerald-500/[0.07] pointer-events-none" />
        <div className="relative">
          <h2 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">{g.text}, Admin {g.emoji}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Here's what's happening at <span className="font-semibold text-slate-700 dark:text-slate-200">Downtown Minimarket</span> today.</p>
          <p className="mt-2.5">{dbLive
            ? <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-500/30"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Neon Live</span>
            : <span className="badge bg-slate-200/70 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-600"><span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Demo data</span>}</p>
        </div>
        <div className="relative sm:ml-auto flex gap-2">
          <button onClick={exportSummary} className="btn-ghost text-[13px]"><Download size={15} /> Export</button>
          <button onClick={onAdd} className="btn-primary text-[13px]"><Plus size={15} /> Add Product</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Boxes} label="Total Stock" value={totalStock.toLocaleString() + " units"} delta="+4.2%" up tint="bg-gradient-to-br from-primary-500 to-indigo-700" sub="Across 12 active SKUs" />
        <StatCard icon={AlertTriangle} label="Low Stock Alerts" value={String(lowCount + outCount)} delta="+2 today" up={false} tint="bg-gradient-to-br from-amber-400 to-orange-600" sub={`${outCount} out of stock · ${lowCount} running low`} />
        <StatCard icon={ShoppingCart} label="Daily Sales" value="312 orders" delta="+12.5%" up tint="bg-gradient-to-br from-emerald-400 to-teal-600" sub="Avg. basket $9.80" />
        <StatCard icon={Wallet} label="Total Revenue" value={money(revenue)} delta="+8.1%" up tint="bg-gradient-to-br from-sky-400 to-blue-700" sub="Today · all channels" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <h3 className="font-display font-bold">Sales vs Stock Trend</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Last 7 days · updated live</p>
            </div>
            <div className="ml-auto flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#4F46E5]" /> Sales ($)</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" /> Stock movement</span>
            </div>
          </div>
          <div className="h-[280px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SALES_TREND} margin={{ top: 5, right: 5, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.35} /><stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gStock" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} /><stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#4F46E5" strokeWidth={2.5} fill="url(#gSales)" />
                <Area type="monotone" dataKey="stock" stroke="#10B981" strokeWidth={2.5} fill="url(#gStock)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-display font-bold">Sales by Category</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Share of revenue this week</p>
          <div className="h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CATEGORY_SHARE} dataKey="value" innerRadius={52} outerRadius={80} paddingAngle={3} strokeWidth={0}>
                  {CATEGORY_SHARE.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 ring-1 ring-slate-200 dark:ring-slate-700/60 p-3.5 flex items-center gap-3">
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-emerald-500/15 text-emerald-500"><TrendingUp size={18} /></span>
            <p className="text-xs text-slate-500 dark:text-slate-400"><span className="font-bold text-slate-800 dark:text-slate-100">Beverages +18%</span><br />Fastest growing category</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold">Top Selling Products</h3>
            <button className="text-xs font-semibold text-primary-600 dark:text-primary-300 hover:underline">View all</button>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {topProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-3 hover:shadow-soft transition">
                <span className={cx("grid place-items-center h-11 w-11 rounded-xl text-white bg-gradient-to-br shrink-0", p.gradient)}><ProductIcon icon={p.icon} className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold truncate">{p.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{p.sku}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-extrabold">{money(p.price)}</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5 justify-end"><TrendingUp size={12} /> Hot</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500" /> Needs Restock</h3>
            <span className="badge bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">{lowList.length}</span>
          </div>
          <div className="mt-4 space-y-3">
            {lowList.map((p) => {
              const s = stockStatus(p.stock, p.threshold);
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <span className={cx("grid place-items-center h-9 w-9 rounded-xl text-white bg-gradient-to-br shrink-0", p.gradient)}><ProductIcon icon={p.icon} className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold truncate">{p.name}</p>
                    <div className="h-1.5 mt-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div className={cx("h-full rounded-full", p.stock === 0 ? "bg-rose-500" : "bg-amber-500")} style={{ width: Math.max(4, Math.min(100, (p.stock / (p.threshold * 2)) * 100)) + "%" }} />
                    </div>
                  </div>
                  <span className={cx("badge shrink-0", s.cls)}><span className={cx("h-1.5 w-1.5 rounded-full", s.dot)} />{p.stock} left</span>
                </div>
              );
            })}
          </div>
          <button onClick={restockAll} className="btn-ghost w-full mt-4 text-[13px]"><PackagePlus size={15} /> Restock all</button>
        </div>
      </div>
    </div>
  );
}

/* ================= INVENTORY ================= */
function InventoryView({ products, setProducts, notify, globalQuery, onAdd, onEdit, onDelete, onRestock, selected, setSelected, syncDeleteProduct }) {
  const [cat, setCat] = useState("All");
  const [status, setStatus] = useState("All");
  const [localQ, setLocalQ] = useState("");
  const q = (globalQuery || localQ).toLowerCase();

  const filtered = useMemo(() => products.filter((p) => {
    const matchQ = !q || (p.name + p.sku + p.category + p.supplier).toLowerCase().includes(q);
    const matchC = cat === "All" || p.category === cat;
    const st = stockStatus(p.stock, p.threshold).label;
    const matchS = status === "All" || st === status;
    return matchQ && matchC && matchS;
  }), [products, q, cat, status]);

  const allChecked = filtered.length > 0 && filtered.every((p) => selected.includes(p.id));
  const toggleAll = () => setSelected(allChecked ? [] : filtered.map((p) => p.id));
  const toggleOne = (id) => setSelected(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  const bulkDelete = () => {
    selected.forEach((id) => syncDeleteProduct && syncDeleteProduct(id));
    setProducts(products.filter((p) => !selected.includes(p.id)));
    notify(`${selected.length} products deleted`);
    setSelected([]);
  };

  const PAGE_SIZE = 8;
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [q, cat, status, products.length]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const productRows = (list) => list.map((p) => [p.sku, p.name, p.category, p.stock, p.threshold, p.cost, p.price, p.supplier]);
  const exportInventory = () => {
    if (!filtered.length) { notify("Nothing to export"); return; }
    downloadCSV("stockpilot-inventory.csv",
      ["SKU", "Name", "Category", "Stock", "Threshold", "Cost ($)", "Price ($)", "Supplier"],
      productRows(filtered));
    notify(`${filtered.length} products exported as CSV`);
  };
  const exportLabels = () => {
    const list = products.filter((p) => selected.includes(p.id));
    if (!list.length) { notify("Select products first"); return; }
    downloadCSV("stockpilot-labels.csv", ["SKU", "Name", "Price ($)"], list.map((p) => [p.sku, p.name, p.price]));
    notify(`${list.length} labels exported as CSV`);
  };

  return (
    <div className="space-y-4">
      <div className="card p-4 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={localQ} onChange={(e) => setLocalQ(e.target.value)} placeholder="Search by name, SKU, supplier… (real-time)" className="input !pl-10" />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <SlidersHorizontal size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="input !pl-9 !w-auto appearance-none pr-8 text-[13px] font-medium cursor-pointer">
                {["All", "In Stock", "Low Stock", "Out of Stock"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <button onClick={exportInventory} className="btn-ghost text-[13px] whitespace-nowrap"><Download size={15} /> <span className="hidden sm:inline">Export</span></button>
            <button onClick={onAdd} className="btn-primary text-[13px] whitespace-nowrap"><Plus size={15} /> <span className="hidden sm:inline">Add Product</span><span className="sm:hidden">Add</span></button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["All", ...CATEGORIES].map((c) => (
            <button key={c} onClick={() => setCat(c)} className={cx("whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition ring-1", cat === c ? "bg-primary-600 text-white ring-primary-600 shadow-soft" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-slate-200 dark:ring-slate-700 hover:ring-primary-600/40")}>{c}</button>
          ))}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="card !bg-slate-900 dark:!bg-white !text-white dark:!text-slate-900 !border-transparent p-3.5 flex items-center gap-3 flex-wrap">
          <span className="badge bg-white/15 dark:bg-slate-900/10 ring-1 ring-white/20 dark:ring-slate-900/15"><Check size={13} /> {selected.length} selected</span>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => notify(`${selected.length} items marked for restock`)} className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 transition">Restock</button>
            <button onClick={exportLabels} className="rounded-xl bg-white/15 dark:bg-slate-900/10 hover:bg-white/25 text-xs font-bold px-3.5 py-2 transition flex items-center gap-1.5"><Printer size={13} /> Labels</button>
            <button onClick={bulkDelete} className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-3.5 py-2 transition">Delete</button>
            <button onClick={() => setSelected([])} className="rounded-xl text-xs font-bold px-2 py-2 opacity-70 hover:opacity-100"><X size={15} /></button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-200/80 dark:border-slate-700/50 bg-slate-50/60 dark:bg-slate-800/40">
                <th className="px-4 py-3.5 w-10"><input type="checkbox" checked={allChecked} onChange={toggleAll} className="h-4 w-4 rounded accent-[#4F46E5] cursor-pointer" /></th>
                <th className="px-2 py-3.5 font-semibold">Product</th>
                <th className="px-4 py-3.5 font-semibold">Category</th>
                <th className="px-4 py-3.5 font-semibold">Stock</th>
                <th className="px-4 py-3.5 font-semibold text-right">Cost</th>
                <th className="px-4 py-3.5 font-semibold text-right">Price</th>
                <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {pageItems.map((p) => {
                const s = stockStatus(p.stock, p.threshold);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group">
                    <td className="px-4 py-3.5"><input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleOne(p.id)} className="h-4 w-4 rounded accent-[#4F46E5] cursor-pointer" /></td>
                    <td className="px-2 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className={cx("grid place-items-center h-11 w-11 rounded-2xl text-white bg-gradient-to-br shrink-0 shadow-soft", p.gradient)}><ProductIcon icon={p.icon} className="h-5 w-5" /></span>
                        <div className="min-w-0">
                          <p className="font-bold text-[13.5px] truncate max-w-[220px]">{p.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">SKU · {p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><span className="badge bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300">{p.category}</span></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold tabular-nums">{p.stock}</span>
                        <span className={cx("badge", s.cls)}><span className={cx("h-1.5 w-1.5 rounded-full", s.dot)} />{s.label}</span>
                      </div>
                      <div className="h-1.5 mt-2 w-32 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div className={cx("h-full rounded-full transition-all", p.stock === 0 ? "bg-rose-500" : p.stock <= p.threshold ? "bg-amber-500" : "bg-emerald-500")} style={{ width: Math.max(3, Math.min(100, (p.stock / 220) * 100)) + "%" }} />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-slate-500 dark:text-slate-400">{money(p.cost)}</td>
                    <td className="px-4 py-3.5 text-right font-extrabold tabular-nums">{money(p.price)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                        <button onClick={() => onEdit(p)} title="Edit" className="p-2 rounded-xl bg-primary-600/10 text-primary-600 dark:text-primary-300 hover:bg-primary-600 hover:text-white transition"><Pencil size={15} /></button>
                        <button onClick={() => onRestock(p)} title="Restock" className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition"><PackagePlus size={15} /></button>
                        <button onClick={() => onDelete(p)} title="Delete" className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <div className="mx-auto grid place-items-center h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400"><Package size={26} /></div>
            <p className="mt-3 font-bold">No products found</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Try a different search or category filter.</p>
          </div>
        )}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200/70 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400">
          <p>Showing <span className="font-bold text-slate-700 dark:text-slate-200">{pageItems.length}</span> of {filtered.length} products · page {safePage}/{totalPages}</p>
          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => <button key={n} onClick={() => setPage(n)} className={cx("h-8 w-8 grid place-items-center rounded-lg font-bold transition", n === safePage ? "bg-primary-600 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-700")}>{n}</button>)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= POS ================= */
function PosView({ products, setProducts, notify, syncProduct }) {
  const [cart, setCart] = useState([{ id: 4, qty: 2 }, { id: 8, qty: 1 }]);
  const [barcode, setBarcode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [payMethod, setPayMethod] = useState("Cash");
  const [adjId, setAdjId] = useState(2);
  const [adjQty, setAdjQty] = useState(10);
  const [adjReason, setAdjReason] = useState("Restock delivery");

  const addToCart = (id) => {
    setCart((c) => c.find((i) => i.id === id) ? c.map((i) => i.id === id ? { ...i, qty: i.qty + 1 } : i) : [...c, { id, qty: 1 }]);
  };
  const lines = cart.map((c) => ({ ...c, p: products.find((p) => p.id === c.id) })).filter((l) => l.p);
  const subtotal = lines.reduce((a, l) => a + l.p.price * l.qty, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      const random = products[Math.floor(Math.random() * products.length)];
      setBarcode(random.sku);
      addToCart(random.id);
      notify(`Scanned ${random.sku} → added to cart`);
      setScanning(false);
    }, 1200);
  };

  const checkout = () => {
    if (!lines.length) { notify("Cart is empty"); return; }
    const next = products.map((p) => {
      const line = cart.find((c) => c.id === p.id);
      return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p;
    });
    if (syncProduct) next.forEach((p) => { if (cart.find((c) => c.id === p.id)) syncProduct(p); });
    setProducts(next);
    setCart([]);
    notify(`Payment ${money(total)} successful (${payMethod})`);
  };

  const applyAdjustment = () => {
    const next = products.map((p) => p.id === Number(adjId) ? { ...p, stock: Math.max(0, p.stock + Number(adjQty)) } : p);
    if (syncProduct) { const hit = next.find((p) => p.id === Number(adjId)); if (hit) syncProduct(hit); }
    setProducts(next);
    notify(`Stock adjusted (${adjReason})`);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* left: scan + catalog */}
      <div className="space-y-4 xl:col-span-1">
        <div className="card p-5">
          <h3 className="font-display font-bold flex items-center gap-2"><ScanLine size={17} className="text-primary-600" /> Barcode Scanner</h3>
          <div className="mt-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 p-5 text-center relative overflow-hidden">
            {scanning && <div className="absolute inset-x-6 top-3 h-0.5 bg-rose-500 shadow-[0_0_12px_2px_rgba(244,63,94,.8)] animate-bounce" />}
            <ScanLine size={34} className={cx("mx-auto transition", scanning ? "text-rose-500 animate-pulse" : "text-slate-400")} />
            <p className="mt-2 text-[13px] font-semibold">{scanning ? "Scanning…" : "Scanner ready — USB / camera"}</p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{barcode || "— awaiting scan —"}</p>
            <div className="mt-3 flex gap-2">
              <input value={barcode} onChange={(e) => setBarcode(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { const f = products.find((p) => p.sku.toLowerCase() === barcode.toLowerCase()); if (f) { addToCart(f.id); notify(`Added ${f.name}`); } else notify("SKU not found"); } }} placeholder="Type or scan SKU…" className="input !py-2 text-[13px] font-mono" />
              <button onClick={simulateScan} className="btn-primary !py-2 text-[13px] whitespace-nowrap">{scanning ? <RefreshCw size={14} className="animate-spin" /> : <ScanLine size={14} />} Simulate</button>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-display font-bold flex items-center gap-2"><ArrowRightLeft size={16} className="text-emerald-500" /> Quick Stock Adjustment</h3>
          <label className="block mt-3 text-xs font-semibold text-slate-500">Product</label>
          <select value={adjId} onChange={(e) => setAdjId(e.target.value)} className="input mt-1 text-[13px]">
            {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.stock})</option>)}
          </select>
          <label className="block mt-3 text-xs font-semibold text-slate-500">Quantity (+ in / − out)</label>
          <div className="mt-1 flex items-center gap-2">
            <button onClick={() => setAdjQty(Math.max(-100, Number(adjQty) - 1))} className="btn-ghost !px-3 !py-2"><Minus size={14} /></button>
            <input type="number" value={adjQty} onChange={(e) => setAdjQty(e.target.value)} className="input text-center font-bold" />
            <button onClick={() => setAdjQty(Number(adjQty) + 1)} className="btn-ghost !px-3 !py-2"><Plus size={14} /></button>
          </div>
          <label className="block mt-3 text-xs font-semibold text-slate-500">Reason</label>
          <select value={adjReason} onChange={(e) => setAdjReason(e.target.value)} className="input mt-1 text-[13px]">
            {["Restock delivery", "Damaged / expired", "Customer return", "Stock recount", "Transfer between stores"].map((r) => <option key={r}>{r}</option>)}
          </select>
          <button onClick={applyAdjustment} className="btn-primary w-full mt-4 text-[13px]"><Check size={15} /> Apply adjustment</button>
        </div>
      </div>

      {/* middle: catalog grid */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold">Quick Add Catalog</h3>
          <span className="badge bg-slate-100 dark:bg-slate-700/70 text-slate-500 dark:text-slate-300">{products.length} SKUs</span>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto pr-1">
          {products.map((p) => (
            <button key={p.id} onClick={() => { addToCart(p.id); }} className="text-left rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-3 hover:border-primary-600/50 hover:shadow-soft transition group">
              <span className={cx("grid place-items-center h-11 w-11 rounded-xl text-white bg-gradient-to-br", p.gradient)}><ProductIcon icon={p.icon} className="h-5 w-5" /></span>
              <p className="mt-2 text-xs font-bold leading-snug line-clamp-2 min-h-[32px]">{p.name}</p>
              <p className="text-[11px] text-slate-400 font-mono">{p.sku}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[13px] font-extrabold text-primary-600 dark:text-primary-300">{money(p.price)}</span>
                <span className={cx("text-[10px] font-bold", p.stock === 0 ? "text-rose-500" : "text-slate-400")}>{p.stock} left</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* right: cart */}
      <div className="card p-5 flex flex-col">
        <h3 className="font-display font-bold flex items-center gap-2"><ClipboardList size={17} className="text-primary-600" /> Current Sale</h3>
        <div className="mt-3 flex-1 space-y-2.5 max-h-[320px] overflow-y-auto">
          {lines.length === 0 && <p className="text-center text-sm text-slate-400 py-8">Cart is empty — tap products or scan a barcode.</p>}
          {lines.map((l) => (
            <div key={l.id} className="flex items-center gap-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 ring-1 ring-slate-200 dark:ring-slate-700/60 p-2.5">
              <span className={cx("grid place-items-center h-9 w-9 rounded-xl text-white bg-gradient-to-br shrink-0", l.p.gradient)}><ProductIcon icon={l.p.icon} className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate">{l.p.name}</p>
                <p className="text-[11px] text-slate-400">{money(l.p.price)} each</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setCart(cart.map((c) => c.id === l.id ? { ...c, qty: Math.max(1, c.qty - 1) } : c))} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"><Minus size={13} /></button>
                <span className="w-6 text-center text-sm font-extrabold tabular-nums">{l.qty}</span>
                <button onClick={() => setCart(cart.map((c) => c.id === l.id ? { ...c, qty: c.qty + 1 } : c))} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"><Plus size={13} /></button>
              </div>
              <button onClick={() => setCart(cart.filter((c) => c.id !== l.id))} className="text-slate-400 hover:text-rose-500 p-1"><X size={14} /></button>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[["Cash", Banknote], ["Card", CreditCard], ["QRIS", QrCode]].map(([m, I]) => (
            <button key={m} onClick={() => setPayMethod(m)} className={cx("flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold ring-1 transition", payMethod === m ? "bg-primary-600 text-white ring-primary-600" : "ring-slate-200 dark:ring-slate-700 text-slate-500 dark:text-slate-300 hover:ring-primary-600/40")}><I size={14} />{m}</button>
          ))}
        </div>
        <div className="mt-4 space-y-1.5 text-sm border-t border-dashed border-slate-200 dark:border-slate-700 pt-3">
          <div className="flex justify-between text-slate-500 dark:text-slate-400"><span>Subtotal</span><span className="tabular-nums">{money(subtotal)}</span></div>
          <div className="flex justify-between text-slate-500 dark:text-slate-400"><span>Tax (10%)</span><span className="tabular-nums">{money(tax)}</span></div>
          <div className="flex justify-between font-display font-extrabold text-lg"><span>Total</span><span className="text-primary-600 dark:text-primary-300 tabular-nums">{money(total)}</span></div>
        </div>
        <button onClick={checkout} className="btn-primary w-full mt-4 !py-3">Charge {money(total)}</button>
      </div>
    </div>
  );
}

/* ================= SUPPLIERS ================= */
function SuppliersView({ suppliers, setSuppliers, notify, syncDeleteSupplier }) {
  const [q, setQ] = useState("");
  const list = suppliers.filter((s) => (s.name + s.contact + s.email).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-4">
      <div className="card p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search suppliers…" className="input !pl-10" />
        </div>
        <button onClick={() => notify("Supplier invite link copied")} className="btn-primary text-[13px] whitespace-nowrap"><Plus size={15} /> Add Supplier</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((s) => (
          <div key={s.id} className="card p-5 hover:shadow-card transition">
            <div className="flex items-start gap-3">
              <span className={cx("grid place-items-center h-12 w-12 rounded-2xl text-white font-display font-extrabold text-lg bg-gradient-to-br shrink-0", s.gradient)}>{s.name[0]}</span>
              <div className="min-w-0 flex-1">
                <p className="font-bold truncate">{s.name}</p>
                <p className="text-xs text-slate-400">{s.contact} · {s.products} products</p>
              </div>
              <span className={cx("badge shrink-0", s.status === "Active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : s.status === "Pending" ? "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300")}>{s.status}</span>
            </div>
            <div className="mt-3 space-y-1.5 text-[13px] text-slate-500 dark:text-slate-400">
              <p className="flex items-center gap-2 truncate"><Mail size={14} className="shrink-0" />{s.email}</p>
              <p className="flex items-center gap-2"><PhoneCall size={14} className="shrink-0" />{s.phone}</p>
              <p className="flex items-center gap-2"><MapPin size={14} className="shrink-0" />Last order · {s.lastOrder}</p>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="flex text-amber-400">{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={14} fill={i <= Math.round(s.rating) ? "currentColor" : "none"} className={i <= Math.round(s.rating) ? "" : "text-slate-300 dark:text-slate-600"} />)}</span>
              <span className="text-xs font-bold">{s.rating}</span>
              <div className="ml-auto flex gap-1.5">
                <button onClick={() => notify(`Purchase order sent to ${s.name}`)} className="btn-ghost !px-3 !py-2 text-xs">Order</button>
                <button onClick={() => { if (syncDeleteSupplier) syncDeleteSupplier(s.id); setSuppliers(suppliers.filter((x) => x.id !== s.id)); notify(`${s.name} removed`); }} className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= REPORTS ================= */
function ReportsView({ notify }) {
  const [range, setRange] = useState("7D");
  const LEDGER = [["Sep 22, 2026", 312, 4180, "33%"], ["Sep 21, 2026", 298, 3860, "31%"], ["Sep 20, 2026", 341, 3420, "34%"], ["Sep 19, 2026", 276, 2780, "30%"], ["Sep 18, 2026", 254, 2210, "32%"]];

  const exportLedger = () => {
    downloadCSV("stockpilot-ledger.csv", ["Date", "Orders", "Revenue ($)", "Margin", "Status"],
      LEDGER.map(([d, o, r, m]) => [d, o, r, m, "Paid"]));
    notify(`${LEDGER.length} rows exported as CSV`);
  };
  return (
    <div className="space-y-4">
      <div className="card p-4 flex flex-wrap items-center gap-2">
        {["24H", "7D", "30D", "90D", "1Y"].map((r) => (
          <button key={r} onClick={() => setRange(r)} className={cx("rounded-xl px-4 py-2 text-xs font-bold transition", range === r ? "bg-primary-600 text-white shadow-soft" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700")}>{r}</button>
        ))}
        <div className="ml-auto flex gap-2">
          <button onClick={exportLedger} className="btn-ghost text-[13px]"><Download size={15} /> Excel</button>
          <button onClick={() => window.print()} className="btn-primary text-[13px]"><Printer size={15} /> PDF</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[["Gross Revenue", "$84,210", "+14.2%", true], ["Units Sold", "9,412", "+9.8%", true], ["Avg. Margin", "32.4%", "−0.6%", false]].map(([l, v, d, up]) => (
          <div key={l} className="card p-5">
            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">{l} · {range}</p>
            <p className="font-display text-3xl font-extrabold mt-1 tracking-tight">{v}</p>
            <span className={cx("badge mt-2", up ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300")}>{up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{d} vs prev.</span>
          </div>
        ))}
      </div>
      <div className="card p-5">
        <h3 className="font-display font-bold">Revenue Overview</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Daily gross revenue · {range}</p>
        <div className="h-[280px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={REVENUE_BY_DAY} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "rgba(79,70,229,.08)" }} />
              <Bar dataKey="revenue" fill="#4F46E5" radius={[8, 8, 4, 4]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200/70 dark:border-slate-700/50 flex items-center justify-between">
          <h3 className="font-display font-bold">Daily Sales Ledger</h3>
          <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"><CheckCircle2 size={13} /> Reconciled</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/60 dark:bg-slate-800/40">
              <th className="px-5 py-3">Date</th><th className="px-4 py-3">Orders</th><th className="px-4 py-3 text-right">Revenue</th><th className="px-4 py-3 text-right">Margin</th><th className="px-5 py-3 text-right">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {LEDGER.map(([d, o, r, m]) => (
                <tr key={d} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3 font-semibold">{d}</td><td className="px-4 py-3 tabular-nums">{o}</td>
                  <td className="px-4 py-3 text-right font-extrabold tabular-nums">${Number(r).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">{m}</td>
                  <td className="px-5 py-3 text-right"><span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">Paid</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================= SETTINGS ================= */
function SettingsView({ role, setRole, dark, toggleDark, notify, email, section }) {
  const DEFAULT_STORE = { name: "Downtown Minimarket", phone: "+1 415 555 0100", address: "88 Market Street, San Francisco", currency: "USD ($)", timezone: "America/Los_Angeles (GMT-8)" };
  const [store, setStore] = useState(() => {
    try { return { ...DEFAULT_STORE, ...JSON.parse(localStorage.getItem("stockpilot-store-v2") || "{}") }; }
    catch { return DEFAULT_STORE; }
  });
  const saveStore = () => {
    try { localStorage.setItem("stockpilot-store-v2", JSON.stringify(store)); } catch { /* storage unavailable */ }
    notify("Store settings saved");
  };
  const [avatar, setAvatar] = useState(null);
  const avatarInput = React.useRef(null);
  const pickAvatar = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setAvatar(URL.createObjectURL(f));
    notify("Avatar updated");
  };
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const changePassword = () => {
    if (!curPw || !newPw) { notify("Fill both password fields"); return; }
    if (newPw.length < 6) { notify("New password min. 6 characters"); return; }
    if (curPw === newPw) { notify("New password must differ"); return; }
    setCurPw(""); setNewPw("");
    notify("Password updated successfully");
  };
  const [notif, setNotif] = useState({ lowStock: true, dailyReport: true, newOrder: false, promo: false });
  useEffect(() => {
    if (!section) return;
    const el = document.getElementById("settings-" + section);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-primary-600/60");
      setTimeout(() => el.classList.remove("ring-2", "ring-primary-600/60"), 1800);
    }
  }, [section]);
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="space-y-4 xl:col-span-2">
        <div id="settings-profile" className="card p-5 sm:p-6 scroll-mt-24 transition">
          <h3 className="font-display font-bold flex items-center gap-2"><User size={17} className="text-primary-600" /> Admin Profile</h3>
          <div className="mt-4 flex items-center gap-4">
            <span className="grid place-items-center h-16 w-16 rounded-3xl bg-gradient-to-br from-primary-600 to-indigo-700 text-white font-display font-extrabold text-2xl shrink-0 overflow-hidden">
              {avatar ? <img src={avatar} alt="avatar" className="h-full w-full object-cover" /> : "A"}
            </span>
            <div>
              <p className="font-bold">{email}</p>
              <span className="badge mt-1 bg-primary-600/10 text-primary-600 dark:text-primary-300 ring-1 ring-primary-600/20">{role === "Super Admin" ? <ShieldCheck size={12} /> : <Store size={12} />} {role}</span>
            </div>
            <input ref={avatarInput} type="file" accept="image/*" onChange={pickAvatar} className="hidden" />
            <button onClick={() => avatarInput.current && avatarInput.current.click()} className="ml-auto btn-ghost text-[13px]">Change</button>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-slate-500">Display name</label><input defaultValue="Alex Morgan" className="input mt-1" /></div>
            <div><label className="text-xs font-semibold text-slate-500">Email</label><input value={email} readOnly className="input mt-1 opacity-70" /></div>
          </div>
          <div className="mt-4">
            <label className="text-xs font-semibold text-slate-500">Role & permissions</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/70">
              {["Super Admin", "Store Clerk"].map((r) => (
                <button key={r} onClick={() => { setRole(r); notify(`Role switched to ${r}`); }} className={cx("rounded-xl px-3 py-2.5 text-[13px] font-semibold transition", role === r ? "bg-white dark:bg-[#1E293B] shadow-soft text-primary-600 dark:text-white ring-1 ring-slate-200 dark:ring-slate-600" : "text-slate-500")}>{r}</button>
              ))}
            </div>
          </div>
        </div>

        <div id="settings-store" className="card p-5 sm:p-6 scroll-mt-24 transition">
          <h3 className="font-display font-bold flex items-center gap-2"><Store size={17} className="text-emerald-500" /> Store Information</h3>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {[["Store name", "name"], ["Phone", "phone"], ["Currency", "currency"], ["Timezone", "timezone"]].map(([l, k]) => (
              <div key={k}><label className="text-xs font-semibold text-slate-500">{l}</label><input value={store[k]} onChange={(e) => setStore({ ...store, [k]: e.target.value })} className="input mt-1" /></div>
            ))}
            <div className="sm:col-span-2"><label className="text-xs font-semibold text-slate-500">Address</label><input value={store.address} onChange={(e) => setStore({ ...store, address: e.target.value })} className="input mt-1" /></div>
          </div>
          <button onClick={saveStore} className="btn-primary mt-4 text-[13px]">Save changes</button>
        </div>

        <div className="card p-5 sm:p-6 !border-rose-200 dark:!border-rose-500/20">
          <h3 className="font-display font-bold text-rose-600 dark:text-rose-400">Danger Zone</h3>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <button onClick={() => notify("All sessions revoked")} className="btn-ghost text-[13px]">Revoke all sessions</button>
            <button onClick={() => notify("Archive started — download sent by email")} className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[13px] font-semibold px-4 py-2.5 transition">Delete workspace</button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card p-5">
          <h3 className="font-display font-bold flex items-center gap-2"><Globe size={16} className="text-primary-600" /> Appearance</h3>
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/60 ring-1 ring-slate-200 dark:ring-slate-700/60 px-4 py-3">
            <span className="text-sm font-semibold flex items-center gap-2">{dark ? <Moon size={16} /> : <Sun size={16} />}{dark ? "Dark mode" : "Light mode"}</span>
            <Toggle on={dark} onClick={toggleDark} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[["#4F46E5", "Indigo"], ["#10B981", "Emerald"]].map(([c, n]) => (
              <button key={n} onClick={() => notify(`Accent switched to ${n}`)} className="flex items-center gap-2 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 px-3 py-2.5 text-xs font-bold hover:shadow-soft"><span className="h-5 w-5 rounded-lg" style={{ background: c }} />{n}</button>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-display font-bold">Notifications</h3>
          <div className="mt-3 space-y-3">
            {[["lowStock", "Low-stock alerts", "Push when SKU hits threshold"], ["dailyReport", "Daily sales report", "Email every 9:00 PM"], ["newOrder", "Supplier updates", "Notify on delivery status"], ["promo", "Marketing tips", "Weekly growth playbooks"]].map(([k, t, s]) => (
              <div key={k} className="flex items-center gap-3">
                <div className="flex-1"><p className="text-[13px] font-bold">{t}</p><p className="text-xs text-slate-400">{s}</p></div>
                <button role="switch" aria-checked={notif[k]} onClick={() => setNotif({ ...notif, [k]: !notif[k] })} className={cx("h-6 w-11 rounded-full p-0.5 transition shrink-0", notif[k] ? "bg-primary-600" : "bg-slate-300 dark:bg-slate-600")}><span className={cx("block h-5 w-5 rounded-full bg-white shadow transition-transform", notif[k] && "translate-x-5")} /></button>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-display font-bold flex items-center gap-2"><Lock size={16} className="text-amber-500" /> Security</h3>
          <input type="password" placeholder="Current password" value={curPw} onChange={(e) => setCurPw(e.target.value)} className="input mt-3" />
          <input type="password" placeholder="New password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="input mt-2" />
          <button onClick={changePassword} className="btn-ghost w-full mt-3 text-[13px]">Update password</button>
        </div>
      </div>
    </div>
  );
}

/* ================= PRODUCT MODALS ================= */
function ProductFormModal({ open, onClose, initial, onSave, notify }) {
  const [f, setF] = useState(initial || { name: "", sku: "", category: "Beverages", stock: 50, threshold: 20, cost: 1, price: 2, supplier: "Java Roast Co." });
  useEffect(() => { setF(initial || { name: "", sku: "", category: "Beverages", stock: 50, threshold: 20, cost: 1, price: 2, supplier: "Java Roast Co." }); }, [initial, open]);
  if (!open) return null;
  const set = (k, v) => setF({ ...f, [k]: v });
  const save = () => {
    if (!f.name.trim() || !f.sku.trim()) { notify("Name & SKU are required"); return; }
    onSave(f); onClose();
  };
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="font-display font-extrabold text-lg">{initial?.id ? "Edit Product" : "Add New Product"}</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"><X size={18} /></button>
      </div>
      {/* barcode scanner placeholder */}
      <div className="mt-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 p-4 flex items-center gap-3">
        <span className="grid place-items-center h-11 w-11 rounded-2xl bg-primary-600 text-white shrink-0"><ScanLine size={20} /></span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold">Barcode scanner</p>
          <p className="text-xs text-slate-400">Point camera or USB scanner here to autofill SKU</p>
        </div>
        <button onClick={() => { const sku = (f.category.slice(0, 3).toUpperCase()) + "-" + Math.floor(1000 + Math.random() * 9000); set("sku", sku); notify(`Scanned → ${sku}`); }} className="btn-ghost !py-2 text-xs whitespace-nowrap"><ScanLine size={14} /> Scan</button>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2"><label className="text-xs font-semibold text-slate-500">Product name *</label><input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Oat Milk 1L" className="input mt-1" /></div>
        <div><label className="text-xs font-semibold text-slate-500">SKU *</label><input value={f.sku} onChange={(e) => set("sku", e.target.value)} placeholder="BEV-1000" className="input mt-1 font-mono" /></div>
        <div><label className="text-xs font-semibold text-slate-500">Category</label>
          <select value={f.category} onChange={(e) => set("category", e.target.value)} className="input mt-1">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><label className="text-xs font-semibold text-slate-500">Cost price ($)</label><input type="number" step="0.01" value={f.cost} onChange={(e) => set("cost", Number(e.target.value))} className="input mt-1" /></div>
        <div><label className="text-xs font-semibold text-slate-500">Selling price ($)</label><input type="number" step="0.01" value={f.price} onChange={(e) => set("price", Number(e.target.value))} className="input mt-1" /></div>
        <div><label className="text-xs font-semibold text-slate-500">Stock qty</label><input type="number" value={f.stock} onChange={(e) => set("stock", Number(e.target.value))} className="input mt-1" /></div>
        <div><label className="text-xs font-semibold text-slate-500">Low-stock threshold</label><input type="number" value={f.threshold} onChange={(e) => set("threshold", Number(e.target.value))} className="input mt-1" /></div>
        <div className="sm:col-span-2"><label className="text-xs font-semibold text-slate-500">Supplier</label>
          <select value={f.supplier} onChange={(e) => set("supplier", e.target.value)} className="input mt-1">{INITIAL_SUPPLIERS.map((s) => <option key={s.id}>{s.name}</option>)}</select></div>
      </div>
      <div className="mt-5 flex gap-2">
        <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
        <button onClick={save} className="btn-primary flex-1"><Check size={15} /> {initial?.id ? "Save changes" : "Add product"}</button>
      </div>
    </Modal>
  );
}

/* ================= APP ================= */
export default function App() {
  const [screen, setScreen] = useState("login"); // login | otp | app
  const [role, setRole] = useState("Super Admin");
  const [email, setEmail] = useState("admin@stockpilot.io");
  const [dark, setDark] = useState(false);
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);
  const [toast, setToast] = useState(null);
  const [settingsSection, setSettingsSection] = useState(null);
  const navigate = (view, section) => {
    if (section) setSettingsSection(section);
    setActive(view);
    setMobileOpen(false);
  };
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [restocking, setRestocking] = useState(null);
  const [restockQty, setRestockQty] = useState(50);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const notify = (msg) => {
    setToast(msg);
    clearTimeout(window.__t);
    window.__t = setTimeout(() => setToast(null), 2600);
  };

  // Database: Neon via /api/*. Falls back to demo data when offline / not configured.
  const [dbLive, setDbLive] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const [p, s] = await Promise.all([api.products(), api.suppliers()]);
        if (Array.isArray(p) && p.length) setProducts(p);
        if (Array.isArray(s) && s.length) setSuppliers(s);
        setDbLive(true);
      } catch {
        /* keep demo data */
      }
    })();
  }, []);
  const syncProduct = (p) => { api.saveProduct(p).catch(() => {}); };
  const syncDeleteProduct = (id) => { api.deleteProduct(id).catch(() => {}); };
  const syncDeleteSupplier = (id) => { api.deleteSupplier(id).catch(() => {}); };

  if (screen === "login") return (<><LoginScreen onLogin={(r, e) => { setRole(r); setEmail(e); setScreen("otp"); }} notify={notify} /><Toast toast={toast} /></>);
  if (screen === "otp") return (<><OtpScreen email={email} onBack={() => setScreen("login")} onVerify={() => { setScreen("app"); notify(`Welcome back — signed in as ${role}`); }} /><Toast toast={toast} /></>);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 font-sans flex">
      <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} dark={dark} toggleDark={() => setDark(!dark)} role={role} notify={notify} />
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <Topbar onMenu={() => setMobileOpen(true)} dark={dark} toggleDark={() => setDark(!dark)} role={role} email={email} onLogout={() => { setScreen("login"); setSelected([]); }} query={query} setQuery={setQuery} active={active} onNavigate={navigate} />
        <main className="flex-1 p-4 sm:p-6 max-w-[1400px] w-full mx-auto">
          {active === "dashboard" && <DashboardView products={products} setProducts={setProducts} notify={notify} dbLive={dbLive} syncProduct={syncProduct} onAdd={() => setShowAdd(true)} />}
          {active === "inventory" && (
            <InventoryView products={products} setProducts={setProducts} notify={notify} globalQuery={query}
              onAdd={() => setShowAdd(true)} onEdit={setEditing} onDelete={setDeleting}
              onRestock={(p) => { setRestocking(p); setRestockQty(50); }} selected={selected} setSelected={setSelected} syncDeleteProduct={syncDeleteProduct} />
          )}
          {active === "pos" && <PosView products={products} setProducts={setProducts} notify={notify} syncProduct={syncProduct} />}
          {active === "suppliers" && <SuppliersView suppliers={suppliers} setSuppliers={setSuppliers} notify={notify} syncDeleteSupplier={syncDeleteSupplier} />}
          {active === "reports" && <ReportsView notify={notify} />}
          {active === "settings" && <SettingsView role={role} setRole={setRole} dark={dark} toggleDark={() => setDark(!dark)} notify={notify} email={email} section={settingsSection} />}
          <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 mt-8 pb-2">StockPilot v3.2 · Crafted for modern retail · Inter + Plus Jakarta Sans · Tailwind + Lucide</p>
        </main>
      </div>

      {/* add / edit */}
      <ProductFormModal open={showAdd} onClose={() => setShowAdd(false)} initial={null} notify={notify}
        onSave={(f) => { syncProduct({ ...f, id: Date.now() }); setProducts([{ ...f, id: Date.now(), gradient: "from-primary-500 to-indigo-700", icon: "Package" }, ...products]); notify(`${f.name} added to inventory`); }} />
      <ProductFormModal open={!!editing} onClose={() => setEditing(null)} initial={editing} notify={notify}
        onSave={(f) => { syncProduct(f); setProducts(products.map((p) => p.id === f.id ? { ...p, ...f } : p)); setEditing(null); notify(`${f.name} updated`); }} />

      {/* delete confirm */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} width="max-w-sm">
        <div className="text-center">
          <div className="mx-auto grid place-items-center h-14 w-14 rounded-2xl bg-rose-500/10 text-rose-500"><Trash2 size={26} /></div>
          <h3 className="mt-3 font-display font-extrabold text-lg">Delete product?</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">“{deleting?.name}” will be permanently removed. This cannot be undone.</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button onClick={() => setDeleting(null)} className="btn-ghost">Cancel</button>
            <button onClick={() => { syncDeleteProduct(deleting.id); setProducts(products.filter((p) => p.id !== deleting.id)); notify(`${deleting.name} deleted`); setDeleting(null); }} className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-2.5 transition">Delete</button>
          </div>
        </div>
      </Modal>

      {/* restock */}
      <Modal open={!!restocking} onClose={() => setRestocking(null)} width="max-w-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-extrabold text-lg">Restock product</h3>
          <button onClick={() => setRestocking(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"><X size={18} /></button>
        </div>
        {restocking && (
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 ring-1 ring-slate-200 dark:ring-slate-700/60 p-3">
            <span className={cx("grid place-items-center h-11 w-11 rounded-xl text-white bg-gradient-to-br shrink-0", restocking.gradient)}><ProductIcon icon={restocking.icon} className="h-5 w-5" /></span>
            <div><p className="text-sm font-bold">{restocking.name}</p><p className="text-xs text-slate-400">Current stock · <span className="font-bold text-slate-600 dark:text-slate-200">{restocking.stock}</span></p></div>
          </div>
        )}
        <label className="block mt-4 text-xs font-semibold text-slate-500">Quantity to add</label>
        <div className="mt-1.5 flex items-center gap-2">
          <button onClick={() => setRestockQty(Math.max(1, restockQty - 10))} className="btn-ghost !px-3"><Minus size={15} /></button>
          <input type="number" value={restockQty} onChange={(e) => setRestockQty(Number(e.target.value))} className="input text-center font-extrabold text-lg" />
          <button onClick={() => setRestockQty(restockQty + 10)} className="btn-ghost !px-3"><Plus size={15} /></button>
        </div>
        <div className="mt-2 flex gap-2">
          {[25, 50, 100, 200].map((q) => <button key={q} onClick={() => setRestockQty(q)} className={cx("flex-1 rounded-xl py-2 text-xs font-bold ring-1 transition", restockQty === q ? "bg-primary-600 text-white ring-primary-600" : "ring-slate-200 dark:ring-slate-700 hover:ring-primary-600/40")}>{q}</button>)}
        </div>
        <button onClick={() => { const updated = { ...restocking, stock: restocking.stock + Number(restockQty) }; syncProduct(updated); setProducts(products.map((p) => p.id === restocking.id ? updated : p)); notify(`+${restockQty} units added to ${restocking.name}`); setRestocking(null); }} className="btn-primary w-full mt-4"><PackagePlus size={16} /> Confirm restock</button>
      </Modal>

      <Toast toast={toast} />
    </div>
  );
}
