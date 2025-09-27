import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { 
  timetablesAPI, 
  subjectsAPI, 
  facultiesAPI, 
  classroomsAPI, 
  studentsAPI,
  optimizationAPI 
} from '../../services/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import {
  Calendar,
  Plus,
  Trash2,
  Settings,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Building2,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

const CreateTimetable = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    department: user?.department || '',
    semester: 1,
    academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    maxClassesPerDay: 6,
    subjects: [],
    batches: [],
    constraints: {
      subjects: [],
      batches: [],
      maxClassesPerDay: 6
    }
  });
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Fetch data
  const { data: subjects } = useQuery(
    ['subjects', formData.department],
    () => subjectsAPI.getByDepartment(formData.department, { semester: formData.semester }),
    { enabled: !!formData.department }
  );

  const { data: faculties } = useQuery(
    ['faculties', formData.department],
    () => facultiesAPI.getByDepartment(formData.department),
    { enabled: !!formData.department }
  );

  const { data: classrooms } = useQuery(
    ['classrooms', formData.department],
    () => classroomsAPI.getAll({ department: formData.department }),
    { enabled: !!formData.department }
  );

  const { data: students } = useQuery(
    ['students', formData.department],
    () => studentsAPI.getByDepartment(formData.department, { semester: formData.semester }),
    { enabled: !!formData.department }
  );

  // Mutations
  const createTimetableMutation = useMutation(timetablesAPI.create, {
    onSuccess: () => {
      toast.success('Timetable created successfully!');
      window.location.href = '/timetables';
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create timetable');
    }
  });

  const optimizeMutation = useMutation(optimizationAPI.generate, {
    onSuccess: (response) => {
      setOptimizationResult(response.data.result);
      setIsOptimizing(false);
      toast.success('Timetable optimized successfully!');
    },
    onError: (error) => {
      setIsOptimizing(false);
      toast.error(error.response?.data?.message || 'Optimization failed');
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubjectSelect = (subjectId) => {
    const subject = subjects?.data?.subjects?.find(s => s._id === subjectId);
    if (!subject) return;

    const newSubject = {
      subjectId,
      name: subject.name,
      code: subject.code,
      hoursPerWeek: subject.hoursPerWeek,
      batch: '',
      section: '',
      faculty: ''
    };

    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
      constraints: {
        ...prev.constraints,
        subjects: [...prev.constraints.subjects, {
          subjectId,
          hoursPerWeek: subject.hoursPerWeek,
          batch: '',
          section: ''
        }]
      }
    }));
  };

  const handleSubjectUpdate = (index, field, value) => {
    setFormData(prev => {
      const newSubjects = [...prev.subjects];
      newSubjects[index] = { ...newSubjects[index], [field]: value };
      
      const newConstraints = [...prev.constraints.subjects];
      newConstraints[index] = { ...newConstraints[index], [field]: value };
      
      return {
        ...prev,
        subjects: newSubjects,
        constraints: {
          ...prev.constraints,
          subjects: newConstraints
        }
      };
    });
  };

  const handleSubjectRemove = (index) => {
    setFormData(prev => {
      const newSubjects = prev.subjects.filter((_, i) => i !== index);
      const newConstraints = prev.constraints.subjects.filter((_, i) => i !== index);
      
      return {
        ...prev,
        subjects: newSubjects,
        constraints: {
          ...prev.constraints,
          subjects: newConstraints
        }
      };
    });
  };

  const handleOptimize = async () => {
    if (formData.subjects.length === 0) {
      toast.error('Please add at least one subject');
      return;
    }

    setIsOptimizing(true);
    optimizeMutation.mutate(formData.constraints);
  };

  const handleCreateTimetable = () => {
    if (!optimizationResult) {
      toast.error('Please optimize the timetable first');
      return;
    }

    const timetableData = {
      ...formData,
      timeSlots: optimizationResult.timeSlots,
      optimizationScore: optimizationResult.optimizationScore,
      conflicts: optimizationResult.conflicts,
      suggestions: optimizationResult.suggestions
    };

    createTimetableMutation.mutate(timetableData);
  };

  const getAvailableBatches = () => {
    if (!students?.data?.students) return [];
    return [...new Set(students.data.students.map(s => s.batch))];
  };

  const getAvailableSections = (batch) => {
    if (!students?.data?.students) return [];
    return [...new Set(students.data.students.filter(s => s.batch === batch).map(s => s.section))];
  };

  const getAvailableFaculties = (subjectId) => {
    if (!faculties?.data?.faculties) return [];
    return faculties.data.faculties.filter(f => 
      f.subjects.some(s => s._id === subjectId)
    );
  };

  const steps = [
    { id: 1, name: 'Basic Info', icon: Settings },
    { id: 2, name: 'Subjects', icon: BookOpen },
    { id: 3, name: 'Optimize', icon: Zap },
    { id: 4, name: 'Review', icon: CheckCircle }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Timetable</h1>
        <p className="text-gray-600">Generate an optimized timetable for your department</p>
      </div>

      {/* Progress Steps */}
      <Card>
        <Card.Body>
          <div className="flex items-center justify-between">
            {steps.map((stepItem, index) => (
              <div key={stepItem.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= stepItem.id 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  <stepItem.icon className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    step >= stepItem.id ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    {stepItem.name}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step > stepItem.id ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Step Content */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {step === 1 && (
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </Card.Header>
            <Card.Body className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timetable Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Computer Science - Semester 3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => handleInputChange('semester', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => handleInputChange('academicYear', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="2024-2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Classes Per Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.maxClassesPerDay}
                    onChange={(e) => handleInputChange('maxClassesPerDay', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </Card.Body>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold">Subjects & Configuration</h3>
            </Card.Header>
            <Card.Body className="space-y-6">
              {/* Add Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Subject
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleSubjectSelect(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select a subject to add</option>
                  {subjects?.data?.subjects?.map(subject => (
                    <option key={subject._id} value={subject._id}>
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject List */}
              {formData.subjects.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Selected Subjects</h4>
                  {formData.subjects.map((subject, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h5 className="font-medium text-gray-900">
                            {subject.code} - {subject.name}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {subject.hoursPerWeek} hours/week
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSubjectRemove(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Batch
                          </label>
                          <select
                            value={subject.batch}
                            onChange={(e) => handleSubjectUpdate(index, 'batch', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="">Select batch</option>
                            {getAvailableBatches().map(batch => (
                              <option key={batch} value={batch}>{batch}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Section
                          </label>
                          <select
                            value={subject.section}
                            onChange={(e) => handleSubjectUpdate(index, 'section', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="">Select section</option>
                            {getAvailableSections(subject.batch).map(section => (
                              <option key={section} value={section}>{section}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Faculty
                          </label>
                          <select
                            value={subject.faculty}
                            onChange={(e) => handleSubjectUpdate(index, 'faculty', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="">Select faculty</option>
                            {getAvailableFaculties(subject.subjectId).map(faculty => (
                              <option key={faculty._id} value={faculty._id}>
                                {faculty.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold">Optimize Timetable</h3>
            </Card.Header>
            <Card.Body className="space-y-6">
              <div className="text-center py-8">
                <Zap className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to optimize your timetable?
                </h4>
                <p className="text-gray-600 mb-6">
                  Our AI will analyze all constraints and generate the best possible schedule
                </p>
                
                <Button
                  onClick={handleOptimize}
                  loading={isOptimizing}
                  disabled={isOptimizing || formData.subjects.length === 0}
                  size="lg"
                >
                  {isOptimizing ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Optimize Timetable
                    </>
                  )}
                </Button>
              </div>

              {optimizationResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <h5 className="font-medium text-green-800">
                        Optimization Complete!
                      </h5>
                    </div>
                    <p className="text-green-700 mt-1">
                      Optimization Score: {optimizationResult.optimizationScore}%
                    </p>
                  </div>

                  {optimizationResult.conflicts.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                        <h5 className="font-medium text-red-800">Conflicts Found</h5>
                      </div>
                      <ul className="text-red-700 text-sm space-y-1">
                        {optimizationResult.conflicts.map((conflict, index) => (
                          <li key={index}>• {conflict.description}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {optimizationResult.suggestions.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Clock className="w-5 h-5 text-blue-600 mr-2" />
                        <h5 className="font-medium text-blue-800">Suggestions</h5>
                      </div>
                      <ul className="text-blue-700 text-sm space-y-1">
                        {optimizationResult.suggestions.map((suggestion, index) => (
                          <li key={index}>• {suggestion.description}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </Card.Body>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold">Review & Create</h3>
            </Card.Header>
            <Card.Body className="space-y-6">
              {optimizationResult ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Timetable Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="text-gray-900">{formData.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Department:</span>
                          <span className="text-gray-900">{formData.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Semester:</span>
                          <span className="text-gray-900">{formData.semester}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subjects:</span>
                          <span className="text-gray-900">{formData.subjects.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time Slots:</span>
                          <span className="text-gray-900">{optimizationResult.timeSlots.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Optimization Score:</span>
                          <span className="text-gray-900">{optimizationResult.optimizationScore}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Quick Stats</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">Faculty Utilization: High</span>
                        </div>
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">Classroom Usage: Optimized</span>
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">Subject Distribution: Balanced</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      variant="secondary"
                      onClick={() => setStep(3)}
                    >
                      Back to Optimization
                    </Button>
                    <Button
                      onClick={handleCreateTimetable}
                      loading={createTimetableMutation.isLoading}
                    >
                      Create Timetable
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Optimization Required
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Please complete the optimization step before creating the timetable
                  </p>
                  <Button onClick={() => setStep(3)}>
                    Go to Optimization
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
        >
          Previous
        </Button>
        <Button
          onClick={() => setStep(step + 1)}
          disabled={step === 4 || (step === 2 && formData.subjects.length === 0)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default CreateTimetable;
