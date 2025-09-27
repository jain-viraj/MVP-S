import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { facultiesAPI } from '../../services/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import {
  Users,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  Clock,
  BookOpen,
  Mail,
  Phone
} from 'lucide-react';

const Faculties = () => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const { data, isLoading, error, refetch } = useQuery(
    ['faculties', { department: departmentFilter }],
    () => facultiesAPI.getAll({
      department: departmentFilter !== 'all' ? departmentFilter : undefined,
      page: 1,
      limit: 50
    }),
    {
      keepPreviousData: true
    }
  );

  const faculties = data?.data?.faculties || [];
  const filteredFaculties = faculties.filter(faculty =>
    faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const departments = [...new Set(faculties.map(f => f.department))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faculty Members</h1>
          <p className="text-gray-600">Manage faculty information and teaching assignments</p>
        </div>
        {hasPermission('canCreateTimetables') && (
          <Button className="mt-4 sm:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            Add Faculty
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <Card.Body>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search faculty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>Total: {faculties.length}</span>
              <span>Active: {faculties.filter(f => f.isActive).length}</span>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Faculties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFaculties.map((faculty, index) => (
          <motion.div
            key={faculty._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <Card.Body>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {faculty.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {faculty.employeeId}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {faculty.designation}
                    </p>
                    <p className="text-xs text-gray-500">
                      {faculty.department}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${faculty.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Max Hours/Week:
                    </span>
                    <span className="text-gray-900">{faculty.maxHoursPerWeek}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      Subjects:
                    </span>
                    <span className="text-gray-900">{faculty.subjects?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Experience:
                    </span>
                    <span className="text-gray-900">{faculty.experience} years</span>
                  </div>
                </div>

                {faculty.specializations && faculty.specializations.length > 0 && (
                  <div className="mb-4">
                    <span className="text-sm text-gray-500 block mb-2">Specializations:</span>
                    <div className="flex flex-wrap gap-1">
                      {faculty.specializations.map((spec, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {hasPermission('canCreateTimetables') && (
                      <>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {faculty.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Faculties;
