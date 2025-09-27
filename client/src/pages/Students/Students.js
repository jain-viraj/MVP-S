import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { studentsAPI } from '../../services/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  BookOpen,
  Users,
  Calendar
} from 'lucide-react';

const Students = () => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');

  const { data, isLoading, error, refetch } = useQuery(
    ['students', { batch: batchFilter, semester: semesterFilter }],
    () => studentsAPI.getAll({
      batch: batchFilter !== 'all' ? batchFilter : undefined,
      semester: semesterFilter !== 'all' ? parseInt(semesterFilter) : undefined,
      page: 1,
      limit: 50
    }),
    {
      keepPreviousData: true
    }
  );

  const students = data?.data?.students || [];
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const batches = [...new Set(students.map(s => s.batch))];
  const semesters = [...new Set(students.map(s => s.semester))];

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
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">Manage student information and enrollment</p>
        </div>
        {hasPermission('canCreateTimetables') && (
          <Button className="mt-4 sm:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            Add Student
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
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Batches</option>
                {batches.map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Semesters</option>
                {semesters.map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>Total: {students.length}</span>
              <span>Active: {students.filter(s => s.isActive).length}</span>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <Card.Body>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {student.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {student.studentId}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {student.department}
                    </p>
                    <p className="text-xs text-gray-500">
                      {student.batch} • Section {student.section}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${student.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Semester:
                    </span>
                    <span className="text-gray-900">{student.semester}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      Subjects:
                    </span>
                    <span className="text-gray-900">{student.subjects?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Section:
                    </span>
                    <span className="text-gray-900">{student.section}</span>
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
                    {student.isActive ? 'Active' : 'Inactive'}
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

export default Students;
