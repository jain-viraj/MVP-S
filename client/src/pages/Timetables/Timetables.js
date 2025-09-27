import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { timetablesAPI } from '../../services/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Send,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const Timetables = () => {
  const { user, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error, refetch } = useQuery(
    ['timetables', { status: statusFilter, department: departmentFilter }],
    () => timetablesAPI.getAll({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      department: departmentFilter !== 'all' ? departmentFilter : undefined,
      page: 1,
      limit: 50
    }),
    {
      keepPreviousData: true
    }
  );

  const timetables = data?.data?.timetables || [];
  const filteredTimetables = timetables.filter(timetable =>
    timetable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    timetable.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const departments = [...new Set(timetables.map(t => t.department))];
  const statuses = ['draft', 'pending_approval', 'approved', 'rejected', 'active'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending_approval':
        return <Clock className="w-4 h-4" />;
      case 'draft':
        return <Edit className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleAction = async (action, timetableId, data = {}) => {
    try {
      switch (action) {
        case 'approve':
          await timetablesAPI.approve(timetableId);
          toast.success('Timetable approved successfully');
          break;
        case 'reject':
          await timetablesAPI.reject(timetableId, data.reason);
          toast.success('Timetable rejected');
          break;
        case 'submit':
          await timetablesAPI.submit(timetableId);
          toast.success('Timetable submitted for approval');
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this timetable?')) {
            await timetablesAPI.delete(timetableId);
            toast.success('Timetable deleted successfully');
          }
          break;
        default:
          break;
      }
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading timetables</h3>
        <p className="text-gray-500 mb-4">{error.message}</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetables</h1>
          <p className="text-gray-600">Manage and optimize your class schedules</p>
        </div>
        {hasPermission('canCreateTimetables') && (
          <Button
            onClick={() => window.location.href = '/timetables/create'}
            className="mt-4 sm:mt-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Timetable
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <Card.Body>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search timetables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Filter Toggle */}
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>Total: {timetables.length}</span>
              <span>Active: {timetables.filter(t => t.status === 'active').length}</span>
              <span>Pending: {timetables.filter(t => t.status === 'pending_approval').length}</span>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Statuses</option>
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </Card.Body>
      </Card>

      {/* Timetables Grid */}
      {filteredTimetables.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No timetables found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first timetable'
              }
            </p>
            {hasPermission('canCreateTimetables') && (
              <Button onClick={() => window.location.href = '/timetables/create'}>
                <Plus className="w-4 h-4 mr-2" />
                Create Timetable
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTimetables.map((timetable, index) => (
            <motion.div
              key={timetable._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <Card.Body>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {timetable.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {timetable.department} • Semester {timetable.semester}
                      </p>
                      <p className="text-xs text-gray-500">
                        Academic Year: {timetable.academicYear}
                      </p>
                    </div>
                    <div className="relative">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(timetable.status)}`}>
                      {getStatusIcon(timetable.status)}
                      <span className="ml-1 capitalize">
                        {timetable.status.replace('_', ' ')}
                      </span>
                    </span>
                    {timetable.optimizationScore && (
                      <span className="text-sm text-gray-600">
                        Score: {timetable.optimizationScore}%
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Time Slots:</span>
                      <span className="text-gray-900">{timetable.timeSlots?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Created by:</span>
                      <span className="text-gray-900">{timetable.createdBy?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Last modified:</span>
                      <span className="text-gray-900">
                        {new Date(timetable.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = `/timetables/${timetable._id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {hasPermission('canCreateTimetables') && timetable.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.location.href = `/timetables/${timetable._id}/edit`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {hasPermission('canCreateTimetables') && 
                       (timetable.status === 'draft' || timetable.status === 'rejected') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAction('delete', timetable._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      {hasPermission('canCreateTimetables') && timetable.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => handleAction('submit', timetable._id)}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Submit
                        </Button>
                      )}
                      {hasPermission('canApproveTimetables') && timetable.status === 'pending_approval' && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleAction('approve', timetable._id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              const reason = prompt('Reason for rejection:');
                              if (reason) {
                                handleAction('reject', timetable._id, { reason });
                              }
                            }}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Timetables;
