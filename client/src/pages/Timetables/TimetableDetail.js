import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { timetablesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import {
  Calendar,
  Clock,
  Users,
  Building2,
  BookOpen,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Download,
  Share2
} from 'lucide-react';

const TimetableDetail = () => {
  const { id } = useParams();
  const { hasPermission } = useAuth();

  const { data: timetable, isLoading, error } = useQuery(
    ['timetable', id],
    () => timetablesAPI.getById(id),
    {
      enabled: !!id
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !timetable?.data) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Timetable not found</h3>
        <p className="text-gray-500 mb-4">The requested timetable could not be found.</p>
        <Button onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const timetableData = timetable.data;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  const getTimeSlotForDay = (day, time) => {
    return timetableData.timeSlots?.find(slot => 
      slot.day === day && slot.startTime === time
    );
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{timetableData.name}</h1>
            <p className="text-gray-600">
              {timetableData.department} • Semester {timetableData.semester} • {timetableData.academicYear}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Status and Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <Card.Body className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Status</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mt-2 ${getStatusColor(timetableData.status)}`}>
              {timetableData.status.replace('_', ' ').toUpperCase()}
            </span>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Time Slots</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {timetableData.timeSlots?.length || 0}
            </p>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Subjects</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {new Set(timetableData.timeSlots?.map(slot => slot.subject?._id)).size || 0}
            </p>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Optimization</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {timetableData.optimizationScore || 0}%
            </p>
          </Card.Body>
        </Card>
      </div>

      {/* Timetable Grid */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold">Weekly Schedule</h3>
        </Card.Header>
        <Card.Body>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 bg-gray-50 font-medium text-gray-900">
                    Time
                  </th>
                  {days.map(day => (
                    <th key={day} className="border border-gray-300 px-4 py-2 bg-gray-50 font-medium text-gray-900 min-w-[200px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(time => (
                  <tr key={time}>
                    <td className="border border-gray-300 px-4 py-2 bg-gray-50 font-medium text-gray-900">
                      {time}
                    </td>
                    {days.map(day => {
                      const slot = getTimeSlotForDay(day, time);
                      return (
                        <td key={`${day}-${time}`} className="border border-gray-300 px-4 py-2 min-h-[80px]">
                          {slot ? (
                            <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 h-full">
                              <div className="text-sm font-medium text-primary-900 mb-1">
                                {slot.subject?.name || 'Unknown Subject'}
                              </div>
                              <div className="text-xs text-primary-700 mb-1">
                                {slot.subject?.code || 'N/A'}
                              </div>
                              <div className="text-xs text-primary-600 mb-1">
                                {slot.faculty?.name || 'Unknown Faculty'}
                              </div>
                              <div className="text-xs text-primary-600">
                                {slot.classroom?.name || 'Unknown Room'}
                              </div>
                              <div className="text-xs text-primary-500 mt-1">
                                {slot.batch} - {slot.section}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                              Free
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>

      {/* Conflicts and Suggestions */}
      {(timetableData.conflicts?.length > 0 || timetableData.suggestions?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {timetableData.conflicts?.length > 0 && (
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold text-red-800">Conflicts</h3>
              </Card.Header>
              <Card.Body>
                <div className="space-y-3">
                  {timetableData.conflicts.map((conflict, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-800">{conflict.type}</p>
                        <p className="text-sm text-red-700">{conflict.description}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                          conflict.severity === 'high' ? 'bg-red-200 text-red-800' :
                          conflict.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {conflict.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}

          {timetableData.suggestions?.length > 0 && (
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold text-blue-800">Suggestions</h3>
              </Card.Header>
              <Card.Body>
                <div className="space-y-3">
                  {timetableData.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">{suggestion.type}</p>
                        <p className="text-sm text-blue-700">{suggestion.description}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                          suggestion.priority === 'high' ? 'bg-red-200 text-red-800' :
                          suggestion.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {suggestion.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
        </div>
      )}

      {/* Timetable Details */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold">Timetable Information</h3>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created by:</span>
                  <span className="text-gray-900">{timetableData.createdBy?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created on:</span>
                  <span className="text-gray-900">
                    {new Date(timetableData.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last modified:</span>
                  <span className="text-gray-900">
                    {new Date(timetableData.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                {timetableData.approvedBy && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approved by:</span>
                    <span className="text-gray-900">{timetableData.approvedBy.name}</span>
                  </div>
                )}
                {timetableData.approvalDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approved on:</span>
                    <span className="text-gray-900">
                      {new Date(timetableData.approvalDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total time slots:</span>
                  <span className="text-gray-900">{timetableData.timeSlots?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unique subjects:</span>
                  <span className="text-gray-900">
                    {new Set(timetableData.timeSlots?.map(slot => slot.subject?._id)).size || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Faculty involved:</span>
                  <span className="text-gray-900">
                    {new Set(timetableData.timeSlots?.map(slot => slot.faculty?._id)).size || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Classrooms used:</span>
                  <span className="text-gray-900">
                    {new Set(timetableData.timeSlots?.map(slot => slot.classroom?._id)).size || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span className="text-gray-900">{timetableData.version || 1}</span>
                </div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TimetableDetail;
