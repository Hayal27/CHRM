# HR Recruitment Module Frontend

A comprehensive React TypeScript frontend for the HR Recruitment Module, built with Ant Design and modern React practices.

## 🚀 Features

### 🟩 1. Job Vacancy Management
- Create and manage job openings
- Set requirements, responsibilities, and salary ranges
- Track application deadlines and status
- Filter and search vacancies

### 🟩 2. Application Management
- Submit job applications with CV upload
- Track application status throughout the process
- Manage applicant information and documents
- View application details and history

### 🟩 3. Interview Scheduling
- Schedule interviews with candidates
- Set interview types (phone, video, in-person, technical, panel)
- Assign interviewers and locations
- Manage interview calendar

### 🟩 4. Interview Evaluation
- Submit detailed interview evaluations
- Rate candidates on multiple criteria
- Provide recommendations and feedback
- Track evaluation history

### 🟩 5. Analytics Dashboard
- Comprehensive recruitment analytics
- Visual charts and graphs
- Department performance metrics
- Hiring trends and insights

## 🛠️ Technology Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type safety and better development experience
- **Ant Design** - UI component library
- **Recharts** - Chart library for analytics
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing
- **Day.js** - Date manipulation library

## 📦 Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## 🏗️ Project Structure

```
src/
├── components/
│   └── recruitment/
│       ├── RecruitmentDashboard.tsx    # Main dashboard
│       ├── JobVacancyForm.tsx         # Job vacancy management
│       ├── ApplicationList.tsx         # Application management
│       ├── InterviewScheduler.tsx      # Interview scheduling
│       └── RecruitmentAnalytics.tsx    # Analytics dashboard
├── services/
│   └── recruitmentService.ts           # API service layer
├── App.tsx                            # Main app component
└── index.tsx                          # Entry point
```

## 🎯 Key Components

### RecruitmentDashboard
The main dashboard that provides an overview of all recruitment activities with:
- Key metrics and statistics
- Quick access to all recruitment features
- Tabbed interface for different sections

### JobVacancyForm
Comprehensive job vacancy management with:
- Create and edit job vacancies
- Form validation and error handling
- File upload for job descriptions
- Status management

### ApplicationList
Application management system featuring:
- View all job applications
- Filter by status and department
- Application status updates
- CV download functionality
- Detailed application view

### InterviewScheduler
Interview management system with:
- Schedule interviews with candidates
- Multiple interview types
- Interviewer assignment
- Calendar integration
- Interview evaluation forms

### RecruitmentAnalytics
Advanced analytics dashboard including:
- Pie charts for application status
- Bar charts for department performance
- Line charts for trends
- Progress indicators
- Detailed statistics

## 🔧 API Integration

The frontend integrates with the backend through the `recruitmentService.ts` file, which provides:

- **Job Vacancy Management**
  - `createVacancy()` - Create new job vacancies
  - `getVacancies()` - Fetch job vacancies with filters
  - `updateVacancy()` - Update existing vacancies

- **Application Management**
  - `submitApplication()` - Submit job applications
  - `uploadCV()` - Upload CV files
  - `getApplications()` - Fetch applications
  - `updateApplicationStatus()` - Update application status

- **Interview Management**
  - `scheduleInterview()` - Schedule interviews
  - `getInterviews()` - Fetch interview data
  - `submitEvaluation()` - Submit interview evaluations

- **Analytics**
  - `getAnalytics()` - Fetch recruitment analytics

## 🎨 UI/UX Features

### Modern Design
- Clean and professional interface
- Responsive design for all devices
- Consistent color scheme and typography
- Intuitive navigation

### Interactive Elements
- Real-time data updates
- Smooth animations and transitions
- Loading states and error handling
- Toast notifications for user feedback

### Data Visualization
- Pie charts for status distributions
- Bar charts for department comparisons
- Line charts for trend analysis
- Progress bars for completion rates

## 🔐 Authentication

The application includes:
- JWT token-based authentication
- Automatic token refresh
- Protected routes
- User role management
- Session management

## 📊 Analytics Features

### Dashboard Metrics
- Total applications
- Interviews scheduled
- Hired candidates
- Active vacancies

### Detailed Analytics
- Application status breakdown
- Hiring decision analysis
- Department performance
- Time-series trends

### Filtering Options
- Date range selection
- Department filtering
- Status filtering
- Search functionality

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## 📝 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🔧 Configuration

### Environment Variables
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_ENV` - Environment (development/production)

### API Configuration
The service layer automatically handles:
- Authentication headers
- Error handling
- Request/response interceptors
- File uploads

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 📦 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The build folder can be deployed to:
- Netlify
- Vercel
- AWS S3
- GitHub Pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates and Maintenance

- Regular dependency updates
- Security patches
- Feature enhancements
- Performance optimizations

---

**Built with ❤️ using React, TypeScript, and Ant Design**
