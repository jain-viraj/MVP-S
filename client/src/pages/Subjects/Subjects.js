import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { subjectsAPI } from '../../services/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  Clock,
  Award
} from 'lucide-react';

const Subjects = () => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data, isLoading, error, refetch } = useQuery(
    ['subjects', { semester: semesterFilter, type: typeFilter }],
    () => subjectsAPI.getAll({
      semester: semesterFilter !== 'all' ? parseInt(semesterFilter) : undefined,
      type: typeFilter !== 'all' ? typeFilter : undefined,
      page: 1,
      limit: 50
    }),
    {
      keepPreviousData: true
    }
  );

  const subjects = data?.data?.subjects || [];
  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type) => {
    switch (type) {
      case 'theory':
        return 'bg-blue-100 text-blue-800';
      case 'practical':
        return 'bg-green-100 text-green-800';
      case 'project':
        return 'bg-purple-100 text-purple-800';
      case 'seminar':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-600">Manage subject information and curriculum</p>
        </div>
        {hasPermission('canCreateTimetables') && (
          <Button className="mt-4 sm:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
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
                  placeholder="Search subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>Total: {subjects.length}</span>
              <span>Theory: {subjects.filter(s => s.type === 'theory').length}</span>
              <span>Practical: {subjects.filter(s => s.type === 'practical').length}</span>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject, index) => (
          <motion.div
            key={subject._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <Card.Body>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {subject.code}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {subject.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {subject.department} • Semester {subject.semester}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(subject.type)}`}>
                    {subject.type.charAt(0).toUpperCase() + subject.type.slice(1)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Hours/Week:
                    </span>
                    <span className="text-gray-900">{subject.hoursPerWeek}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      Credits:
                    </span>
                    <span className="text-gray-900">{subject.credits}</span>
                  </div>
                </div>

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
                    {subject.isActive ? 'Active' : 'Inactive'}
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

export default Subjects;
