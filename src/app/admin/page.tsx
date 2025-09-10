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
  RefreshCw
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

  const statsCards: StatsCard[] = [
    {
      title: 'Total Packages',
      value: dashboardData?.stats.totalPackages || 0,
      change: '+12%',
      trend: 'up',
      icon: <Package className="h-5 w-5" />,
      color: 'text-blue-600'
    },
    {
      title: 'Active FAQs',
      value: dashboardData?.stats.activeFaqs || 0,
      change: '+5%',
      trend: 'up',
      icon: <HelpCircle className="h-5 w-5" />,
      color: 'text-green-600'
    },
    {
      title: 'Recent Appointments',
      value: dashboardData?.stats.recentAppointments || 0,
      change: '+8%',
      trend: 'up',
      icon: <Calendar className="h-5 w-5" />,
      color: 'text-purple-600'
    },
    {
      title: 'Lab Locations',
      value: dashboardData?.stats.labLocations || 0,
      change: 'Active',
      trend: 'neutral',
      icon: <MapPin className="h-5 w-5" />,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your medical lab today
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className="transition-all duration-200 hover:shadow-lg hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={stat.color}>
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="flex items-center text-sm">
                {stat.trend === 'up' && (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                )}
                <span className={
                  stat.trend === 'up' ? 'text-green-600' : 
                  stat.trend === 'down' ? 'text-red-600' : 
                  'text-gray-500'
                }>
                  {stat.change}
                </span>
                <span className="text-gray-500 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.recentActivities.length ? (
                dashboardData.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      {activity.type === 'appointment' ? (
                        <Calendar className="h-5 w-5 text-purple-600 mt-0.5" />
                      ) : activity.type === 'package' ? (
                        <Package className="h-5 w-5 text-blue-600 mt-0.5" />
                      ) : (
                        <HelpCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        {activity.status && (
                          <Badge 
                            variant={
                              activity.status === 'confirmed' ? 'default' :
                              activity.status === 'pending' ? 'secondary' :
                              'destructive'
                            }
                            className="ml-2"
                          >
                            {activity.status === 'confirmed' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {activity.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                            {activity.status === 'cancelled' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {activity.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No recent activities</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-red-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`h-auto p-4 flex flex-col items-center space-y-2 transition-all duration-200 hover:scale-105 ${action.color} text-white border-0`}
                  onClick={() => router.push(action.href)}
                >
                  {action.icon}
                  <div className="text-center">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs opacity-90">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Pending Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {dashboardData?.stats.pendingAppointments || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Require confirmation
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Confirmed Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {dashboardData?.stats.confirmedAppointments || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ready for service
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Operational
            </div>
            <p className="text-xs text-gray-500 mt-1">
              All systems running
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}