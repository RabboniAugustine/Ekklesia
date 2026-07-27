import { useState, useEffect, useMemo } from "react";
import {
  Bell, Search, ChevronDown, Shield, Menu, LogOut,
} from "lucide-react";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { WelcomePage } from "./auth/WelcomePage";
import { SignInPage } from "./auth/SignInPage";
import { Dashboard } from "./modules/dashboard/Dashboard";
import { Attendance } from "./modules/attendance/Attendance";
import { Members } from "./modules/members/Members";
import { Events } from "./modules/events/Events";
import { Finance } from "./modules/finance/Finance";
import { Ministries } from "./modules/ministries/Ministries";
import { Communication } from "./modules/communication/Communication";
import { Reports } from "./modules/reports/Reports";
import { Settings } from "./modules/settings/Settings";
import { navItems } from "./nav";
import { getAccessibleModules, canAccessModule } from "./access";
import type { NavModule } from "./types";

function AppShell() {
  const { profile, loading, error, refresh, logout } = useAuth();
  const [active, setActive] = useState<NavModule>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  const accessibleModules = useMemo(() => getAccessibleModules(profile?.role), [profile?.role]);
  const visibleNavItems = useMemo(() => navItems.filter((item) => accessibleModules.includes(item.id)), [accessibleModules]);

  // Land on the first module this role can actually see, and bail out of
  // a tab the role loses access to (e.g. after an admin changes their role).
  useEffect(() => {
    if (!profile) return;
    if (!accessibleModules.includes(active)) {
      setActive(accessibleModules[0] ?? "settings");
    }
  }, [profile, accessibleModules, active]);

  const userInitials =
    profile?.full_name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const pageTitle = navItems.find(n => n.id === active)?.label ?? "Dashboard";

  const renderContent = () => {
    if (!canAccessModule(profile?.role, active)) {
      return (
        <div className="bg-card border border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
          Your role doesn't have access to this section.
        </div>
      );
    }

    switch (active) {
      case "dashboard": return <Dashboard />;
      case "attendance": return <Attendance />;
      case "members": return <Members />;
      case "events": return <Events />;
      case "finance": return <Finance />;
      case "ministries": return <Ministries />;
      case "communication": return <Communication />;
      case "reports": return <Reports />;
      case "settings": return <Settings />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!profile && !showSignIn) {
    return <WelcomePage onGetStarted={() => setShowSignIn(true)} />;
  }

  if (!profile) {
    return (
      <SignInPage
        onBack={() => setShowSignIn(false)}
        onSignedIn={refresh}
        externalError={error}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-60 bg-card border-r border-border flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-border">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-tight">Grace Community</p>
            <p className="text-xs text-muted-foreground leading-tight">Church Management</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActive(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  isActive
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-border relative">
          <button
            onClick={() => setProfileMenuOpen((open) => !open)}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/60 cursor-pointer transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {profile?.full_name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {profile?.role || "User"}
              </p>
            </div>
            <ChevronDown size={13} className="text-muted-foreground shrink-0" />
          </button>

          {profileMenuOpen && (
            <div className="absolute bottom-16 left-3 right-3 bg-card border border-border rounded-lg shadow-lg p-2 z-50">
              <button
                onClick={() => {
                  setActive("settings");
                  setProfileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted"
              >
                Profile
              </button>

              <button
                onClick={async () => {
                  await logout();
                  setProfileMenuOpen(false);
                  setShowSignIn(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted text-rose-600 flex items-center gap-2"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-card border-b border-border flex items-center gap-4 px-5 shrink-0">
          <button className="lg:hidden text-muted-foreground hover:text-foreground transition-colors" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <h1 className="text-base font-semibold text-foreground">{pageTitle}</h1>
          <div className="flex-1" />
          <div className="relative hidden sm:block">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search..."
              className="pl-9 pr-4 py-1.5 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all w-48"
            />
          </div>
          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
          </button>
          <button
            onClick={() => setActive("settings")}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold"
          >
            {userInitials}
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
