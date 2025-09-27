import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import {
  Calendar,
  Building2,
  BookOpen,
  Users,
  GraduationCap,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';

const Dashboard = () => {
  const { user, hasPermission } = useAuth();

  const stats = [
    {
      name: 'Active Timetables',
      value: '12',
      change: '+2.5%',
      changeType: 'positive',
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      name: 'Total Classrooms',
      value: '45',
      change: '+1.2%',
      changeType: 'positive',
      icon: Building2,
      color: 'bg-green-500'
    },
    {
      name: 'Subjects',
      value: '128',
      change: '+5.1%',
      changeType: 'positive',
      icon: BookOpen,
      color: 'bg-purple-500'
    },
    {
      name: 'Faculty Members',
      value: '89',
      change: '+0.8%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-orange-500'
    }
  ];

  const recentTimetables = [
    {
      id: 1,
      name: 'Computer Science - Semester 3',
      department: 'Computer Science',
      status: 'approved',
      lastModified: '2 hours ago',
      createdBy: 'Dr. John Smith'
    },
    {
      id: 2,
      name: 'IT - Semester 5',
      department: 'Information Technology',
      status: 'pending',
      lastModified: '4 hours ago',
      createdBy: 'Prof. Jane Doe'
    },
    {
      id: 3,
      name: 'ECE - Semester 1',
      department: 'Electronics & Communication',
      status: 'draft',
      lastModified: '1 day ago',
      createdBy: 'Dr. Mike Johnson'
    }
  ];

  const quickActions = [
    {
      name: 'Create Timetable',
      description: 'Generate a new optimized timetable',
      icon: Plus,
      href: '/timetables/create',
      permission: 'canCreateTimetables',
      color: 'bg-primary-500'
    },
    {
      name: 'Manage Classrooms',
      description: 'Add or update classroom information',
      icon: Building2,
      href: '/classrooms',
      permission: 'canCreateTimetables',
      color: 'bg-green-500'
    },
    {
      name: 'View Reports',
      description: 'Analyze timetable performance',
      icon: BarChart3,
      href: '/reports',
      permission: 'canViewReports',
      color: 'bg-purple-500'
    },
    {
      name: 'Manage Faculty',
      description: 'Update faculty information',
      icon: Users,
      href: '/faculties',
      permission: 'canCreateTimetables',
      color: 'bg-orange-500'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'draft':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-primary-100">
            Here's what's happening with your timetables today.
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
          >
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </Card.Header>
            <Card.Body className="space-y-4">
              {quickActions
                .filter(action => !action.permission || hasPermission(action.permission))
                .map((action, index) => (
                  <motion.div
                    key={action.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-4 h-auto"
                      onClick={() => window.location.href = action.href}
                    >
                      <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{action.name}</p>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </div>
                    </Button>
                  </motion.div>
                ))}
            </Card.Body>
          </Card>
        </motion.div>

        {/* Recent Timetables */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Timetables</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/timetables'}
                >
                  View All
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                {recentTimetables.map((timetable, index) => (
                  <motion.div
                    key={timetable.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{timetable.name}</h4>
                        <p className="text-sm text-gray-500">
                          {timetable.department} • {timetable.createdBy}
                        </p>
                        <p className="text-xs text-gray-400">{timetable.lastModified}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(timetable.status)}`}>
                        {getStatusIcon(timetable.status)}
                        <span className="ml-1 capitalize">{timetable.status}</span>
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900">Database</h4>
                <p className="text-sm text-gray-500">All systems operational</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900">Optimization Engine</h4>
                <p className="text-sm text-gray-500">Running smoothly</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <h4 className="font-medium text-gray-900">Backup</h4>
                <p className="text-sm text-gray-500">Scheduled for tonight</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
