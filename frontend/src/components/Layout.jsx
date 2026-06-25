import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, LogOut, LayoutDashboard, Users, BookOpen, 
  LineChart, MessageSquare, BarChart3, Settings, User, 
  Menu, X, ChevronLeft, ChevronRight, Bell
} from "lucide-react";

export default function Layout({ children, role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDoctor = role === "doctor";
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll for global messages/unread notifications
  useEffect(() => {
    if (!user) return;
    
    const checkUnreads = async () => {
      try {
        if (isDoctor) {
          // Fetch patients list which includes unread count per patient
          const res = await api.get('/doctor/patients');
          const totalUnread = res.data.reduce((acc, curr) => acc + (curr.unreadMessagesCount || 0), 0);
          setUnreadCount(totalUnread);
        } else {
          // Fetch messages list directly
          const res = await api.get(`/messages/conversation/${user.id}`);
          const patientUnread = res.data.filter(m => m.senderId !== user.id && !m.isRead).length;
          setUnreadCount(patientUnread);
        }
      } catch (err) {
        console.error("Error loading unreads count", err);
      }
    };

    checkUnreads();
    const interval = setInterval(checkUnreads, 5000);
    return () => clearInterval(interval);
  }, [user, isDoctor]);

  // Grouped Sidebar Links matching Attio/Linear
  const doctorGroups = [
    {
      title: "Clinic Workspace",
      links: [
        { href: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/doctor/patients", label: "Patients", icon: Users },
        { href: "/doctor/analytics", label: "Analytics", icon: BarChart3 }
      ]
    },
    {
      title: "Communications",
      links: [
        { 
          href: "/doctor/patients", // Redirects to patient list to click chat, or fallback
          label: "Messages", 
          icon: MessageSquare,
          badge: unreadCount > 0 ? unreadCount : null
        }
      ]
    },
    {
      title: "System",
      links: [
        { href: "/doctor/settings", label: "Settings", icon: Settings }
      ]
    }
  ];

  const patientGroups = [
    {
      title: "Recovery Tracker",
      links: [
        { href: "/patient/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/patient/plan", label: "My Plan", icon: BookOpen },
        { href: "/patient/progress", label: "Log Progress", icon: LineChart },
        { href: "/patient/measurements", label: "Measurements", icon: Activity }
      ]
    },
    {
      title: "Communications",
      links: [
        { 
          href: "/patient/messages", 
          label: "Messages", 
          icon: MessageSquare,
          badge: unreadCount > 0 ? unreadCount : null
        }
      ]
    },
    {
      title: "Account",
      links: [
        { href: "/patient/profile", label: "Profile", icon: User }
      ]
    }
  ];

  const sidebarGroups = isDoctor ? doctorGroups : patientGroups;

  // Breadcrumbs title calculations
  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path.includes("dashboard")) return "Dashboard Overview";
    if (path.includes("patients")) {
      if (path.includes("new")) return "Invite Patient";
      if (path.includes("edit")) return "Edit Patient Details";
      if (path.includes("progress")) return "Patient Progress logs";
      if (path.includes("plan")) return "Plan Editor";
      return "Patients Directory";
    }
    if (path.includes("plan")) return "Rehabilitation Plan";
    if (path.includes("progress") || path.includes("log")) return "Recovery Logs";
    if (path.includes("measurements")) return "Baseline Measurements";
    if (path.includes("messages")) return "Clinical Secure Chat";
    if (path.includes("analytics")) return "Clinical Analytics & RTS Reports";
    if (path.includes("settings")) return "Workspace Settings";
    if (path.includes("profile")) return "Account Settings";
    return "Workspace";
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userInitials = user?.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U";

  return (
    <div className="min-h-screen flex bg-brand-bg relative overflow-x-hidden font-sans">
      
      {/* 1. Desktop Collapsible Sidebar */}
      <motion.aside 
        animate={{ width: isCollapsed ? 76 : 280 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="fixed top-0 bottom-0 left-0 bg-white border-r border-slate-200/80 z-20 hidden md:flex flex-col select-none"
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold flex-shrink-0">
              <Activity size={18} />
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 }}
                className="font-extrabold text-slate-900 tracking-tight text-base whitespace-nowrap"
              >
                ACL Rehab Pro
              </motion.span>
            )}
          </div>
          
          {!isCollapsed && (
            <button 
              onClick={() => setIsCollapsed(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Sidebar Navigation Links */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6 custom-scrollbar">
          {sidebarGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1.5">
              {!isCollapsed && (
                <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase px-4 block mb-2">
                  {group.title}
                </span>
              )}
              {group.links.map((link) => {
                const isActive = location.pathname.startsWith(link.href);
                const IconComponent = link.icon;
                
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    title={isCollapsed ? link.label : ""}
                    className={isActive ? "sidebar-link-active" : "sidebar-link-inactive"}
                  >
                    <IconComponent size={20} className={isActive ? "text-brand-primary" : "text-brand-mute"} />
                    {!isCollapsed && (
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[13px] whitespace-nowrap flex-1"
                      >
                        {link.label}
                      </motion.span>
                    )}
                    {!isCollapsed && link.badge && (
                      <span className="bg-brand-primary text-white rounded-full text-[10px] font-bold px-2 py-0.5">
                        {link.badge}
                      </span>
                    )}
                    {isCollapsed && link.badge && (
                      <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-brand-primary rounded-full ring-2 ring-brand-canvas"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Collapse Expand Toggle Trigger & Profile */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <button 
                onClick={() => setIsCollapsed(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-slate-100 transition"
              >
                <ChevronRight size={16} />
              </button>
              <div 
                onClick={handleLogout}
                className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center cursor-pointer transition"
                title="Logout"
              >
                <LogOut size={18} />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-[16px] bg-brand-surfaceCard border border-brand-hairlineSoft">
                <div className="w-9 h-9 rounded-[16px] bg-brand-secondaryBg text-brand-onSecondary flex items-center justify-center font-bold text-sm">
                  {userInitials}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                  <span className="text-[10px] text-slate-400 font-bold capitalize block">{user?.role} portal</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="sidebar-link-inactive w-full text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 px-4 py-2.5 rounded-xl transition"
              >
                <LogOut size={18} />
                <span className="text-[13px] font-semibold">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* 2. Mobile Drawer Sidebar Backdrop & Draw */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black z-30 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-white z-40 p-5 flex flex-col md:hidden select-none border-r border-slate-200"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-hairlineSoft">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold">
                    <Activity size={18} />
                  </div>
                  <span className="font-extrabold text-slate-900 tracking-tight">ACL Rehab Pro</span>
                </div>
                <button onClick={() => setIsMobileOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar">
                {sidebarGroups.map((group, groupIdx) => (
                  <div key={groupIdx} className="space-y-1.5">
                    <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase px-4 block mb-2">
                      {group.title}
                    </span>
                    {group.links.map((link) => {
                      const isActive = location.pathname.startsWith(link.href);
                      const IconComponent = link.icon;
                      
                      return (
                        <Link
                          key={link.href}
                          to={link.href}
                          onClick={() => setIsMobileOpen(false)}
                          className={isActive ? "sidebar-link-active" : "sidebar-link-inactive"}
                        >
                          <IconComponent size={20} className={isActive ? "text-brand-primary" : "text-brand-mute"} />
                          <span className="text-[13px] flex-1">{link.label}</span>
                          {link.badge && (
                            <span className="bg-red-500 text-white rounded-full text-[10px] font-bold px-2 py-0.5 shadow-sm">
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-brand-hairlineSoft space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-[16px] bg-brand-surfaceCard">
                  <div className="w-9 h-9 rounded-[16px] bg-brand-secondaryBg text-brand-onSecondary flex items-center justify-center font-bold text-sm">
                    {userInitials}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                    <span className="text-[10px] text-slate-400 font-bold capitalize">{user?.role}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="sidebar-link-inactive w-full text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 px-4 py-2.5 rounded-xl transition"
                >
                  <LogOut size={18} />
                  <span className="text-[13px] font-semibold">Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 3. Main content frame */}
      <div 
        className="flex-1 flex flex-col min-w-0 transition-all duration-200"
        style={{ paddingLeft: typeof window !== "undefined" && window.innerWidth >= 768 ? (isCollapsed ? 76 : 280) : 0 }}
      >
        {/* Top Navbar */}
        <header className="h-16 bg-brand-canvas/90 backdrop-blur-md border-b border-brand-hairlineSoft px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 select-none">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-xl hover:bg-slate-50 border border-slate-100 md:hidden text-slate-600 transition"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                {isDoctor ? "Clinician Workspace" : "Patient Recovery Portal"}
              </span>
              <h1 className="font-extrabold text-slate-800 text-sm tracking-tight">
                {getBreadcrumbTitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Badge */}
            <button className="p-2.5 text-brand-mute hover:text-brand-ink hover:bg-brand-surfaceCard rounded-[16px] transition relative border border-brand-hairlineSoft bg-brand-canvas">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-brand-primary rounded-full ring-2 ring-brand-canvas"></span>
              )}
            </button>
            
            <div className="h-8 w-px bg-slate-200/60"></div>
            
            {/* User Quick Info */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[16px] bg-brand-surfaceCard border border-brand-hairlineSoft flex items-center justify-center font-bold text-xs text-brand-charcoal select-none">
                {userInitials}
              </div>
              <span className="text-xs font-bold text-brand-ink hidden sm:block">{user?.name}</span>
              <span className="rounded-full bg-brand-successPale text-brand-successDeep text-[10px] font-bold capitalize py-0.5 px-2 border border-brand-successDeep/10">
                {user?.role}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* 4. Touch-friendly Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-brand-canvas/95 backdrop-blur-md border-t border-brand-hairlineSoft z-35 md:hidden flex items-center justify-around px-2 select-none">
        {isDoctor ? (
          <>
            <Link to="/doctor/dashboard" className={`flex flex-col items-center justify-center p-1.5 text-xs font-semibold ${location.pathname.startsWith('/doctor/dashboard') ? 'text-brand-primary' : 'text-brand-mute'}`}>
              <LayoutDashboard size={20} />
              <span className="text-[10px] mt-0.5">Overview</span>
            </Link>
            <Link to="/doctor/patients" className={`flex flex-col items-center justify-center p-1.5 text-xs font-semibold ${location.pathname.startsWith('/doctor/patients') ? 'text-brand-primary' : 'text-brand-mute'}`}>
              <Users size={20} />
              <span className="text-[10px] mt-0.5">Patients</span>
            </Link>
            <Link to="/doctor/analytics" className={`flex flex-col items-center justify-center p-1.5 text-xs font-semibold ${location.pathname.startsWith('/doctor/analytics') ? 'text-brand-primary' : 'text-brand-mute'}`}>
              <BarChart3 size={20} />
              <span className="text-[10px] mt-0.5">Analytics</span>
            </Link>
          </>
        ) : (
          <>
            <Link to="/patient/dashboard" className={`flex flex-col items-center justify-center p-1.5 text-xs font-semibold ${location.pathname.startsWith('/patient/dashboard') ? 'text-brand-primary' : 'text-brand-mute'}`}>
              <LayoutDashboard size={20} />
              <span className="text-[10px] mt-0.5">Dashboard</span>
            </Link>
            <Link to="/patient/plan" className={`flex flex-col items-center justify-center p-1.5 text-xs font-semibold ${location.pathname.startsWith('/patient/plan') ? 'text-brand-primary' : 'text-brand-mute'}`}>
              <BookOpen size={20} />
              <span className="text-[10px] mt-0.5">Plan</span>
            </Link>
            <Link to="/patient/progress" className={`flex flex-col items-center justify-center p-1.5 text-xs font-semibold ${location.pathname.startsWith('/patient/progress') ? 'text-brand-primary' : 'text-brand-mute'}`}>
              <LineChart size={20} />
              <span className="text-[10px] mt-0.5">Log</span>
            </Link>
            <Link to="/patient/messages" className={`flex flex-col items-center justify-center p-1.5 text-xs font-semibold ${location.pathname.startsWith('/patient/messages') ? 'text-brand-primary' : 'text-brand-mute'} relative`}>
              <MessageSquare size={20} />
              <span className="text-[10px] mt-0.5">Chat</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-2 bg-brand-primary text-white rounded-full text-[8px] font-bold h-4 w-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          </>
        )}
      </nav>

    </div>
  );
}
