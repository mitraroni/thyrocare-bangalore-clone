"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Package,
  HelpCircle,
  Image,
  MapPin,
  Calendar,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Loader2
} from "lucide-react";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavigationItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Packages", href: "/admin/packages", icon: Package },
  { name: "FAQs", href: "/admin/faqs", icon: HelpCircle },
  { name: "Hero Banners", href: "/admin/hero-banners", icon: Image },
  { name: "Lab Info", href: "/admin/lab-info", icon: MapPin },
  { name: "Appointments", href: "/admin/appointments", icon: Calendar },
  { name: "Site Settings", href: "/admin/settings", icon: Settings },
];

export const AdminDashboardLayout = ({ children }: AdminDashboardLayoutProps) => {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      router.push("/");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Show loading spinner during authentication check
  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!session?.user) {
    return null;
  }

  const getBreadcrumbs = () => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];
    
    if (pathSegments.length === 1) {
      breadcrumbs.push({ name: "Dashboard", href: "/admin" });
    } else {
      breadcrumbs.push({ name: "Dashboard", href: "/admin" });
      const currentItem = navigationItems.find(item => 
        item.href === pathname
      );
      if (currentItem) {
        breadcrumbs.push({ name: currentItem.name, href: pathname });
      }
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-secondary transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-secondary/20">
          <h2 className="text-lg font-semibold text-secondary-foreground">
            Medical Admin
          </h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-secondary-foreground hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
                      ${isActive 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'text-secondary-foreground hover:bg-secondary/80 hover:text-white'
                      }
                    `}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="lg:hidden mr-3 text-foreground hover:text-primary transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-semibold text-foreground">
                Medical Admin Panel
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{session.user.name || session.user.email}</span>
            </div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Breadcrumbs */}
        <div className="px-4 lg:px-6 py-3 bg-muted/30 border-b border-border">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm">
              {breadcrumbs.map((breadcrumb, index) => (
                <li key={breadcrumb.href} className="flex items-center">
                  {index > 0 && (
                    <span className="mx-2 text-muted-foreground">/</span>
                  )}
                  <a
                    href={breadcrumb.href}
                    className={`
                      ${index === breadcrumbs.length - 1
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                      } transition-colors
                    `}
                  >
                    {breadcrumb.name}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};