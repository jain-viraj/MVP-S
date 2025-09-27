import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { classroomsAPI } from '../../services/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Users,
  Wifi,
  Monitor,
  Projector,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';

const Classrooms = () => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error, refetch } = useQuery(
    ['classrooms', { type: typeFilter }],
    () => classroomsAPI.getAll({
      type: typeFilter !== 'all' ? typeFilter : undefined,
      page: 1,
      limit: 50
    }),
    {
      keepPreviousData: true
    }
  );

  const classrooms = data?.data?.classrooms || [];
  const filteredClassrooms = classrooms.filter(classroom =>
    classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classroom.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classroom.building.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const classroomTypes = ['lecture', 'lab', 'seminar', 'conference', 'auditorium'];

  const getTypeColor = (type) => {
    switch (type) {
      case 'lecture':
        return 'bg-blue-100 text-blue-800';
      case 'lab':
        return 'bg-green-100 text-green-800';
      case 'seminar':
        return 'bg-purple-100 text-purple-800';
      case 'conference':
        return 'bg-orange-100 text-orange-800';
      case 'auditorium':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEquipmentIcon = (equipment) => {
    switch (equipment.toLowerCase()) {
      case 'wifi':
        return <Wifi className="w-4 h-4" />;
      case 'projector':
        return <Projector className="w-4 h-4" />;
      case 'computer':
      case 'computers':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
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
        <Building2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading classrooms</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">Classrooms</h1>
          <p className="text-gray-600">Manage classroom information and availability</p>
        </div>
        {hasPermission('canCreateTimetables') && (
          <Button
            onClick={() => {/* Add create classroom modal */}}
            className="mt-4 sm:mt-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Classroom
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
                  placeholder="Search classrooms..."
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
              <span>Total: {classrooms.length}</span>
              <span>Available: {classrooms.filter(c => c.isAvailable).length}</span>
              <span>Labs: {classrooms.filter(c => c.type === 'lab').length}</span>
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
                    Type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Types</option>
                    {classroomTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </Card.Body>
      </Card>

      {/* Classrooms Grid */}
      {filteredClassrooms.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No classrooms found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || typeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first classroom'
              }
            </p>
            {hasPermission('canCreateTimetables') && (
              <Button onClick={() => {/* Add create classroom modal */}}>
                <Plus className="w-4 h-4 mr-2" />
                Add Classroom
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClassrooms.map((classroom, index) => (
            <motion.div
              key={classroom._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <Card.Body>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {classroom.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {classroom.building} • Floor {classroom.floor}
                      </p>
                      <p className="text-xs text-gray-500">
                        {classroom.department}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(classroom.type)}`}>
                        {classroom.type.charAt(0).toUpperCase() + classroom.type.slice(1)}
                      </span>
                      <div className={`w-3 h-3 rounded-full ${classroom.isAvailable ? 'bg-green-400' : 'bg-red-400'}`} />
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Capacity:</span>
                      <span className="text-gray-900 flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {classroom.capacity}
                      </span>
                    </div>
                    
                    {classroom.equipment && classroom.equipment.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-500 block mb-2">Equipment:</span>
                        <div className="flex flex-wrap gap-2">
                          {classroom.equipment.map((item, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                            >
                              {getEquipmentIcon(item.name)}
                              <span className="ml-1">{item.name}</span>
                              {item.quantity > 1 && (
                                <span className="ml-1 text-gray-500">({item.quantity})</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {classroom.specialRequirements && classroom.specialRequirements.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-500 block mb-1">Special Requirements:</span>
                        <div className="flex flex-wrap gap-1">
                          {classroom.specialRequirements.map((req, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md"
                            >
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {/* View classroom details */}}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {hasPermission('canCreateTimetables') && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* Edit classroom */}}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* Delete classroom */}}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>

                    <div className="text-sm text-gray-500">
                      {classroom.isAvailable ? 'Available' : 'Unavailable'}
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

export default Classrooms;
