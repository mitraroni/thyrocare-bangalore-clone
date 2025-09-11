"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient, useSession } from '@/lib/auth-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Package, 
  Calendar, 
  HelpCircle, 
  MapPin, 
  Plus, 
  Settings, 
  Users, 
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Stethoscope,
  RefreshCw,
  BookOpen,
  Image,
  Megaphone
} from 'lucide-react';
import { AdminDashboardLayout } from './layout';
import { toast } from 'sonner';

interface StatsCard {
  title: string;
  value: number | string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface RecentActivity {
  id: number;
  type: 'appointment' | 'package' | 'faq';
  title: string;
  description: string;
  time: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
}

interface DashboardData {
  stats: {
    totalPackages: number;
    activeFaqs: number;
    recentAppointments: number;
    labLocations: number;
    pendingAppointments: number;
    confirmedAppointments: number;
  };
  recentActivities: RecentActivity[];
}

export default function AdminDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      // Remove hard dependency on localStorage token; rely on auth cookies set by backend
      const commonHeaders = {
        'Content-Type': 'application/json'
      } as const;

      // Fetch data from all endpoints
      const [packagesRes, faqsRes, appointmentsRes, labInfoRes] = await Promise.all([
        fetch('/api/admin/packages?limit=100', { headers: commonHeaders }),
        fetch('/api/admin/faqs?limit=100', { headers: commonHeaders }),
        fetch('/api/admin/appointments?limit=100', { headers: commonHeaders }),
        fetch('/api/admin/lab-info?limit=100', { headers: commonHeaders })
      ]);

      const [packages, faqs, appointments, labInfo] = await Promise.all([
        packagesRes.ok ? packagesRes.json() : [],
        faqsRes.ok ? faqsRes.json() : [],
        appointmentsRes.ok ? appointmentsRes.json() : [],
        labInfoRes.ok ? labInfoRes.json() : []
      ]);

      // Calculate stats
      const stats = {
        totalPackages: packages.length || 0,
        activeFaqs: faqs.filter((faq: any) => faq.isActive).length || 0,
        recentAppointments: appointments.length || 0,
        labLocations: labInfo.filter((lab: any) => lab.isActive).length || 0,
        pendingAppointments: appointments.filter((apt: any) => apt.status === 'pending').length || 0,
        confirmedAppointments: appointments.filter((apt: any) => apt.status === 'confirmed').length || 0
      };

      // Create recent activities
      const recentActivities: RecentActivity[] = [
        ...appointments.slice(0, 3).map((apt: any) => ({
          id: apt.id,
          type: 'appointment' as const,
          title: `Appointment - ${apt.patientName}`,
          description: `${apt.appointmentSlot} slot on ${apt.appointmentDate}`,
          time: new Date(apt.createdAt).toLocaleDateString(),
          status: apt.status
        })),
        ...packages.slice(0, 2).map((pkg: any) => ({
          id: pkg.id,
          type: 'package' as const,
          title: pkg.name,
          description: `₹${pkg.price} ${pkg.discountPrice ? `(Discounted: ₹${pkg.discountPrice})` : ''}`,
          time: new Date(pkg.createdAt).toLocaleDateString()
        }))
      ].slice(0, 5);

      setDashboardData({
        stats,
        recentActivities
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchDashboardData();
    }
  }, [session]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    toast.success('Dashboard refreshed');
  };

  const quickActions = [
    {
      title: 'Add Package',
      description: 'Create new test package',
      icon: <Plus className="h-5 w-5" />,
      href: '/admin/packages/new',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Add FAQ',
      description: 'Create new FAQ entry',
      icon: <HelpCircle className="h-5 w-5" />,
      href: '/admin/faqs/new',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'View Appointments',
      description: 'Manage appointments',
      icon: <Calendar className="h-5 w-5" />,
      href: '/admin/appointments',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Site Settings',
      description: 'Configure website',
      icon: <Settings className="h-5 w-5" />,
      href: '/admin/settings',
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  if (isPending || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  // Simplified Admin Dashboard UI
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-1">Welcome, {session.user.name}. Manage website content easily.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/')} variant="outline">View Site</Button>
          <Button onClick={() => router.push('/blog')} variant="outline">View Blog</Button>
          <Button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition" onClick={() => router.push('/admin/packages/new')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Add Package</CardTitle>
          </CardHeader>
          <CardContent>Create a new test package for any page.</CardContent>
        </Card>

        <Card className="hover:shadow-md transition" onClick={() => router.push('/admin/packages')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Manage Packages</CardTitle>
          </CardHeader>
          <CardContent>View, edit, activate/deactivate packages.</CardContent>
        </Card>

        <Card className="hover:shadow-md transition" onClick={() => router.push('/admin/blogs/new')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> New Blog</CardTitle>
          </CardHeader>
          <CardContent>Publish a new blog post.</CardContent>
        </Card>

        <Card className="hover:shadow-md transition" onClick={() => router.push('/admin/blogs')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Manage Blogs</CardTitle>
          </CardHeader>
          <CardContent>Edit, categorize, or tag blog posts.</CardContent>
        </Card>

        <Card className="hover:shadow-md transition" onClick={() => router.push('/admin/faqs')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5" /> FAQs</CardTitle>
          </CardHeader>
          <CardContent>Manage frequently asked questions.</CardContent>
        </Card>

        <Card className="hover:shadow-md transition" onClick={() => router.push('/admin/hero-banners')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Image className="h-5 w-5" /> Hero Banners</CardTitle>
          </CardHeader>
          <CardContent>Update homepage hero banners.</CardContent>
        </Card>

        <Card className="hover:shadow-md transition" onClick={() => router.push('/admin/promotional-banners')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" /> Promotions</CardTitle>
          </CardHeader>
          <CardContent>Manage promotional banners/offers.</CardContent>
        </Card>

        <Card className="hover:shadow-md transition" onClick={() => router.push('/admin/lab-info')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Stethoscope className="h-5 w-5" /> Lab Info</CardTitle>
          </CardHeader>
          <CardContent>Edit lab details and services.</CardContent>
        </Card>

        <Card className="hover:shadow-md transition" onClick={() => router.push('/admin/footer-addresses')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Footer Addresses</CardTitle>
          </CardHeader>
          <CardContent>Manage branch addresses.</CardContent>
        </Card>

        <Card className="hover:shadow-md transition" onClick={() => router.push('/admin/footer-contacts')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Footer Contacts</CardTitle>
          </CardHeader>
          <CardContent>Manage contact numbers and emails.</CardContent>
        </Card>

        <Card className="hover:shadow-md transition" onClick={() => router.push('/admin/testimonials')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Testimonials</CardTitle>
          </CardHeader>
          <CardContent>Add or edit patient testimonials.</CardContent>
        </Card>

        <Card className="hover:shadow-md transition" onClick={() => router.push('/admin/team-members')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Team</CardTitle>
          </CardHeader>
          <CardContent>Manage team member profiles.</CardContent>
        </Card>

        <Card className="hover:shadow-md transition" onClick={() => router.push('/admin/gallery')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Image className="h-5 w-5" /> Gallery</CardTitle>
          </CardHeader>
          <CardContent>Upload or remove gallery images.</CardContent>
        </Card>

        <Card className="hover:shadow-md transition" onClick={() => router.push('/admin/appointments')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Appointments</CardTitle>
          </CardHeader>
          <CardContent>View and manage bookings.</CardContent>
        </Card>

        <Card className="hover:shadow-md transition" onClick={() => router.push('/admin/site-settings')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Site Settings</CardTitle>
          </CardHeader>
          <CardContent>General configuration and preferences.</CardContent>
        </Card>
      </div>
    </div>
  );
}