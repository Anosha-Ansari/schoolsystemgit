import { useState } from "react";
import { NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Search, Bell, Sun, Moon, Globe, LogOut, Menu, ChevronDown,
  Settings as SettingsIcon, User, Check,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { navForRole } from "../data/navConfig";
import { roleColor } from "../data/roles";
import { notices } from "../data/sampleData";
import { useClickOutside } from "../hooks/useClickOutside";
import Logo from "./Logo";

function GroupItem({ item }) {
  const location = useLocation();
  const isChildActive = item.children.some((c) => location.pathname.startsWith(c.to));
  const [open, setOpen] = useState(isChildActive);

  return (
    <div>
      <div onClick={() => setOpen((o) => !o)} className="nav-item justify-between">
        <span className="flex items-center gap-3"><item.icon size={17} />{item.label}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="ml-7 flex flex-col gap-0.5 mt-0.5 mb-1">
          {item.children.map((c) => (
            <NavLink
              key={c.to}
              to={c.to}
              className={({ isActive }) => "text-[13px] px-3 py-2 rounded-lg " + (isActive ? "bg-brand-blue text-white" : "text-[#9aa4c8] hover:bg-[#1c295a] hover:text-white")}
            >
              {c.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="relative text-muted hover:text-ink transition-colors">
        <Bell size={18} />
        <span className="absolute -top-1.5 -right-2 bg-brand-red text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
          {notices.length}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-card border border-border rounded-xl2 shadow-lg z-20 overflow-hidden">
          <div className="px-4 py-3 border-b border-border font-heading font-semibold text-[13.5px]">Notifications</div>
          <div className="max-h-72 overflow-y-auto">
            {notices.map((n) => (
              <div key={n.title} className="px-4 py-3 border-b border-border last:border-none row-hover text-[12.5px]">
                <b className="block">{n.title}</b>
                <span className="text-muted">{n.date}</span>
              </div>
            ))}
          </div>
          <Link to="/notices" onClick={() => setOpen(false)} className="block text-center py-2.5 text-brand-blue text-[13px] font-semibold row-hover">
            View All Notices
          </Link>
        </div>
      )}
    </div>
  );
}

function LanguageMenu() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("English");
  const ref = useClickOutside(() => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 text-muted hover:text-ink text-[13px] transition-colors">
        <Globe size={15} /> {lang}
      </button>
      {open && (
        <div className="absolute right-0 mt-3 w-36 bg-card border border-border rounded-xl2 shadow-lg z-20 overflow-hidden">
          {["English", "Urdu"].map((l) => (
            <div
              key={l}
              onClick={() => { setLang(l); setOpen(false); }}
              className="flex items-center justify-between px-3.5 py-2.5 text-[13px] cursor-pointer row-hover"
            >
              {l} {lang === l && <Check size={14} className="text-brand-blue" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  return (
    <div className="relative pl-3 border-l border-border" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-blue-300 flex items-center justify-center text-white font-bold text-xs shrink-0">
          {user?.name?.[0] ?? "A"}
        </div>
        <div className="text-[12.5px] leading-tight text-left">
          <div className="font-semibold">{user?.name ?? "Admin"}</div>
          <span
            className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded-md"
            style={{ color: roleColor(user?.role), background: `${roleColor(user?.role)}1a` }}
          >
            {user?.roleLabel}
          </span>
        </div>
        <ChevronDown size={13} className="text-muted" />
      </button>
      {open && (
        <div className="absolute right-0 mt-3 w-48 bg-card border border-border rounded-xl2 shadow-lg z-20 overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <div className="font-semibold text-[13px] truncate">{user?.name}</div>
            <div className="text-muted text-[11.5px] truncate">{user?.email}</div>
          </div>
          <Link to="/settings" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-[13px] row-hover">
            <User size={14} /> Profile
          </Link>
          <Link to="/settings" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-[13px] row-hover">
            <SettingsIcon size={14} /> Settings
          </Link>
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-brand-red row-hover text-left">
            <LogOut size={14} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const nav = navForRole(user?.role || "student");

  const doLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="grid grid-cols-[260px_1fr] min-h-screen">
      <aside className="bg-navy text-white/80 px-4 py-5 sticky top-0 h-screen overflow-y-auto flex flex-col">
        <Link to="/" className="block px-2 pb-5">
          <Logo size="sm" light />
        </Link>
        <nav className="flex flex-col gap-0.5">
          {nav.map((item) =>
            item.type === "group" ? (
              <GroupItem key={item.label} item={item} />
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
              >
                <item.icon size={17} />
                {item.label}
              </NavLink>
            )
          )}
        </nav>
        <div className="mt-5 bg-navy2 rounded-xl p-4 text-[12.5px] text-blue-100">
          <b className="text-white font-heading block mb-1">Better Education, Brighter Future</b>
          Together we build a brighter tomorrow.
        </div>
        <div className="mt-auto pt-5 border-t border-white/10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-blue to-blue-300 flex items-center justify-center font-bold text-xs">
            {user?.name?.[0] ?? "A"}
          </div>
          <div className="text-[12.5px] leading-tight flex-1 min-w-0">
            <div className="text-white font-semibold truncate">{user?.name ?? "Admin"}</div>
            <div className="text-blue-200 truncate">{user?.roleLabel ?? "Super Administrator"}</div>
          </div>
          <button onClick={doLogout} title="Logout" className="text-blue-200 hover:text-white shrink-0">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="bg-card border-b border-border px-6 py-3 flex items-center gap-4 sticky top-0 z-10">
          <Menu size={20} className="text-muted md:hidden" />
          <div className="flex-1 max-w-[420px] bg-bg rounded-lg px-3.5 py-2 flex items-center gap-2 text-muted text-[13.5px]">
            <Search size={15} />
            <input placeholder="Search students, teachers, classes…" className="bg-transparent outline-none w-full text-ink placeholder:text-muted" />
          </div>
          <div className="ml-auto flex items-center gap-4">
            <NotificationsMenu />
            <button onClick={toggle} className="text-muted hover:text-ink transition-colors" title="Toggle theme">
              {theme === "dark" ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <LanguageMenu />
            <ProfileMenu user={user} onLogout={doLogout} />
          </div>
        </header>
        <main className="p-6 w-full">{children}</main>
      </div>
    </div>
  );
}
