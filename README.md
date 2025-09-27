<<<<<<< HEAD
# Smart Classroom & Timetable Scheduler

A comprehensive web application for managing classroom schedules and timetables with AI-powered optimization features.

## 🚀 Features

### Core Functionality
- **Login System**: Secure authentication for authorized personnel
- **Timetable Management**: Create, edit, and manage class schedules
- **AI Optimization**: Intelligent timetable generation with constraint handling
- **Review & Approval**: Multi-level approval workflow for timetables
- **Multi-Department Support**: Handle multiple departments and shifts
- **Suggestion System**: Smart recommendations for timetable improvements

### Key Capabilities
- **Constraint-Based Optimization**: 
  - Number of classrooms available
  - Number of student batches
  - Subject requirements and hours per week
  - Faculty availability and preferences
  - Classroom capacity and equipment
  - Maximum classes per day limits
  - Special class scheduling

- **Professional UI**: Modern, responsive design with smooth animations
- **Real-time Updates**: Live timetable status and conflict detection
- **Export/Import**: Timetable data export capabilities
- **Role-based Access**: Different permission levels for users

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **Styled Components** for styling
- **Framer Motion** for animations
- **React Query** for data fetching
- **React Hook Form** for form management
- **Lucide React** for icons

### Additional Tools
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Concurrently** for running multiple processes

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd smart-classroom-timetable-scheduler
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (root, server, and client)
npm run install-all
```

### 3. Environment Setup
Create a `.env` file in the `server` directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-classroom
JWT_SECRET=your-super-secret-jwt-key-here
CLIENT_URL=http://localhost:3000
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For macOS with Homebrew
brew services start mongodb-community

# For Ubuntu/Debian
sudo systemctl start mongod

# For Windows
net start MongoDB
```

### 5. Run the Application
```bash
# Start both server and client in development mode
npm run dev

# Or start them separately:
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
smart-classroom-timetable-scheduler/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, Theme)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   └── App.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Database configuration
│   ├── middleware/        # Express middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── index.js          # Server entry point
│   └── package.json
├── package.json          # Root package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Timetables
- `GET /api/timetables` - Get all timetables
- `POST /api/timetables` - Create timetable
- `GET /api/timetables/:id` - Get timetable by ID
- `PUT /api/timetables/:id` - Update timetable
- `DELETE /api/timetables/:id` - Delete timetable
- `POST /api/timetables/:id/approve` - Approve timetable
- `POST /api/timetables/:id/reject` - Reject timetable
- `POST /api/timetables/:id/submit` - Submit for approval

### Optimization
- `POST /api/optimization/generate` - Generate optimized timetable
- `POST /api/optimization/suggestions` - Get optimization suggestions

### Resources
- `GET /api/classrooms` - Get classrooms
- `GET /api/subjects` - Get subjects
- `GET /api/faculties` - Get faculty members
- `GET /api/students` - Get students

## 👥 User Roles & Permissions

### Admin
- Full system access
- User management
- Timetable approval
- System configuration

### Coordinator
- Create and manage timetables
- Approve timetables
- Manage resources (classrooms, subjects, faculty)
- View reports

### Faculty
- View assigned timetables
- Update availability preferences
- View student information

### Viewer
- View timetables
- Basic system information

## 🎯 Key Features Explained

### Timetable Optimization Algorithm
The system uses a sophisticated algorithm that considers:
- **Faculty Constraints**: Availability, workload limits, preferences
- **Classroom Constraints**: Capacity, equipment, maintenance schedules
- **Student Constraints**: Batch conflicts, subject requirements
- **Time Constraints**: Maximum classes per day, preferred time slots
- **Resource Constraints**: Equipment availability, special requirements

### Multi-Department Support
- Separate timetables for different departments
- Cross-department resource sharing
- Department-specific constraints and preferences
- Centralized management with department isolation

### Approval Workflow
1. **Draft**: Initial timetable creation
2. **Pending Approval**: Submitted for review
3. **Approved**: Ready for implementation
4. **Active**: Currently in use
5. **Rejected**: Requires modifications

## 🚀 Deployment

### Production Build
```bash
# Build the client
cd client
npm run build

# Start production server
cd ../server
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db-url
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://your-frontend-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- Mobile application
- Advanced analytics and reporting
- Integration with external calendar systems
- Machine learning improvements for optimization
- Real-time notifications
- Bulk import/export functionality
- Advanced conflict resolution
- Multi-language support

---

**Smart Classroom & Timetable Scheduler** - Making education scheduling smarter, faster, and more efficient! 🎓✨
=======
# MVP-S
Smart Classroom &amp; Timetable Scheduler
>>>>>>> 8a3e691e868be6b74765340794141d21bc98a03a
