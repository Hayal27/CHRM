import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ConfigProvider, theme, App as AntdApp } from 'antd';
import { AuthProvider, useAuth } from './components/Auth/AuthContext';

// Import layout components
import MainLayout from './components/layout/MainLayout';
import Footer from './components/layout/Footer';
import HeaderApplicant from './components/layout/HeaderApplicant';
import SignUpPage from './pages/SignUpPage.tsx';
//user management components
import UserTable from './components/admin/UserTable.tsx';
import EmployeeRegistration from './components/admin/EmployeeRegistration.tsx';
import MenuAccessControlPage from './components/admin/MenuAccessControlPage';
// Import recruitment components
import RecruitmentDashboard from './components/recruitment/RecruitmentDashboard';
import JobVacancyForm from './components/recruitment/JobVacancyForm';
import ApplicationList from './components/recruitment/ApplicationList';
import InterviewScheduler from './components/recruitment/InterviewScheduler';
import RecruitmentAnalytics from './components/recruitment/RecruitmentAnalytics';
import CareerPage from './components/recruitment/CareerPage';

// Import employee management components
import EnhancedEmployeeProfile from './components/employee/EnhancedEmployeeProfile';
import DepartmentManagement from './components/employee/DepartmentManagement';
import RoleManagement from './components/employee/RoleManagement';



// Import authentication components
import LoginPage from './components/components/login';
import Applicant_login from './components/components/applicant_login';
// Import theme context
import { ThemeProvider } from './contexts/ThemeContext';

// Import other components
import './App.css';

// Import HRMS dashboards
import HRDashboard from './components/HRDashboard';
import OnboardingDashboard from './components/recruitment/OnboardingDashboard';
import EmployeeProfileDashboard from './components/employee/EmployeeProfileDashboard';
import AttendanceDashboard from './components/attendance/AttendanceDashboard';
import LeaveDashboard from './components/leave/LeaveDashboard';
import PayrollDashboard from './components/payroll/PayrollDashboard'; // Not accepted yet
import PerformanceDashboard from './components/performance/PerformanceDashboard';
import TrainingDashboard from './components/training/TrainingDashboard';
import PromotionDashboard from './components/promotion/PromotionDashboard';
import DisciplinaryDashboard from './components/disciplinary/DisciplinaryDashboard';
import ResignationDashboard from './components/resignation/ResignationDashboard';
import ArchivalDashboard from './components/archival/ArchivalDashboard';
import ApplicantDashboard from './components/applicant/ApplicantDashboard';

// New imports for role 3 pages
import EmployeeProfilePage from './pages/EmployeeProfilePage';
import AttendancePage from './pages/AttendancePage';
import LeavePage from './pages/LeavePage';
import TrainingPage from './pages/TrainingPage';
import DisciplinaryPage from './pages/DisciplinaryPage';
import ResignationPage from './pages/ResignationPage';

// Define a type for roles
type Role = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// Component to handle post-login redirection based on role
const PostLoginRedirect: React.FC = () => {
    const { user } = useAuth();
    const userRoleId = user?.role_id ? Number(user.role_id) : null;

    if (userRoleId === 6) {
        return <Navigate to="/applicant/dashboard" replace />;
    }

       return <Navigate to="/dashboard/overview" replace />;
};

// Define a higher-order component for protected routes
const ProtectedRoute: React.FC<{ role: Role | Role[], children: React.ReactNode }> = ({ role, children }) => {
    const { user, isAuthenticated } = useAuth();
    const userRoleId = user?.role_id ? Number(user.role_id) : null;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (userRoleId === null) {
        return <Navigate to="/login" replace />;
    }

    const hasRequiredRole = Array.isArray(role) ? role.includes(userRoleId as Role) : userRoleId === role;

    if (!hasRequiredRole) {
        if (userRoleId === 6) {
            return <Navigate to="/applicant/dashboard" replace />;
        }
        return <Navigate to="/dashboard/overview" replace />;
    }

    return <>{children}</>;
};

// --- Loading Component ---
const LoadingIndicator: React.FC = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>
);

// --- Layout for Authenticated Routes (includes MainLayout and Footer) ---
const AuthenticatedLayout: React.FC = () => {
    const { user } = useAuth();
    const [collapsed, setCollapsed] = React.useState(false);
    // If applicant (role 6) and on /applicant/dashboard, do not render MainLayout (no sidebar)
    const isApplicantDashboard = user?.role_id === 6 && window.location.pathname === '/applicant/dashboard';
    if (isApplicantDashboard) {
        return (
            <div style={{ minHeight: '100vh', background: '#f5f6fa' }}>
                {/* You can add a header here if you have a Header component */}
                <Outlet />
                <HeaderApplicant collapsed={collapsed} onCollapse={setCollapsed} />
                <Footer />
            </div>
        );
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <MainLayout>
                <Outlet /> {/* Child authenticated routes will render here */}
            </MainLayout>
            <Footer />
        </div>
    );
};

// --- AppContent Component (Handles auth state and renders routes/layout) ---
const AppContent: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingIndicator />;
    }

    return (
        <Routes>
            {/* Root path redirects to HR dashboard */}
            <Route path="/" element={<Navigate to="/hrms/dashboard" replace />} />

            {/* Public Career Portal - accessible without authentication */}
            <Route path="/careers" element={<CareerPage />} />
           
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/applicant_login" element={<Applicant_login/>} />
            {!isAuthenticated ? (
                <>
                    {/* Public Routes for unauthenticated users */}
                    <Route path="/login" element={<LoginPage />} />
                    {/* For any other unauthenticated access, redirect to login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </>



            ) : (
                <>
                    {/* Authenticated Routes wrapped with AuthenticatedLayout */}
                    <Route element={<AuthenticatedLayout />}>
                        {/* General Dashboard Routes */}
                        <Route path="/dashboard/overview" element={<ProtectedRoute role={[1, 2, 3, 4, 5, 7, 8]}><div>Dashboard Overview</div></ProtectedRoute>} />

                        {/* Recruitment Routes - Admin and Manager can access all */}
                        <Route path="/recruitment" element={<ProtectedRoute role={[1, 2, 3]}><RecruitmentDashboard /></ProtectedRoute>} />
                        <Route path="/vacancies" element={<ProtectedRoute role={[1, 2]}><JobVacancyForm /></ProtectedRoute>} />
                        <Route path="/applications" element={<ProtectedRoute role={[1, 2, 3]}><ApplicationList /></ProtectedRoute>} />
                        <Route path="/interviews" element={<ProtectedRoute role={[1, 2, 3]}><InterviewScheduler /></ProtectedRoute>} />
                        <Route path="/analytics" element={<ProtectedRoute role={[1, 2]}><RecruitmentAnalytics /></ProtectedRoute>} />

                        {/* Admin Routes (Role 1) */}
                        <Route path="/employees" element={<ProtectedRoute role={1}><div>Employees Component</div></ProtectedRoute>} />
                        <Route path="/settings" element={<ProtectedRoute role={1}><div>Settings Component</div></ProtectedRoute>} />
                        <Route path="/admin/menu-access" element={<ProtectedRoute role={1}><MenuAccessControlPage /></ProtectedRoute>} />

                        {/* Prevent authenticated users from navigating to /login */}
                        <Route path="/login" element={<PostLoginRedirect />} />
                        
                        {/* Fallback for authenticated users if no other route matches within AuthenticatedLayout */}
                        <Route path="*" element={<Navigate to="/recruitment" replace />} />

                        {/* HRMS Module Routes */}
                        <Route path="/hrms/dashboard" element={<ProtectedRoute role={[1,2,3]}><HRDashboard /></ProtectedRoute>} />
                        
                        {/* Recruitment Module Routes */}
                        <Route path="/hrms/recruitment" element={<ProtectedRoute role={[1,2,3]}><RecruitmentDashboard /></ProtectedRoute>} />
                        <Route path="/hrms/recruitment/jobs" element={<ProtectedRoute role={[1,2]}><JobVacancyForm /></ProtectedRoute>} />
                        <Route path="/hrms/recruitment/applications" element={<ProtectedRoute role={[1,2,3]}><ApplicationList /></ProtectedRoute>} />
                        <Route path="/hrms/recruitment/interviews" element={<ProtectedRoute role={[1,2,3]}><InterviewScheduler /></ProtectedRoute>} />
                        <Route path="/hrms/recruitment/analytics" element={<ProtectedRoute role={[1,2]}><RecruitmentAnalytics /></ProtectedRoute>} />
                        <Route path="/hrms/recruitment/career-portal" element={<ProtectedRoute role={[1,2]}><CareerPage /></ProtectedRoute>} />
                        
                        {/* Onboarding Module Routes */}
                        <Route path="/hrms/onboarding" element={<ProtectedRoute role={[1,2,3]}><OnboardingDashboard /></ProtectedRoute>} />
                        <Route path="/hrms/onboarding/tasks" element={<ProtectedRoute role={[1,2,3]}><div>Onboarding Tasks</div></ProtectedRoute>} />
                        <Route path="/hrms/onboarding/documents" element={<ProtectedRoute role={[1,2,3]}><div>Onboarding Documents</div></ProtectedRoute>} />
                        
                        {/* Employee Module Routes */}
                        <Route path="/hrms/employee" element={<ProtectedRoute role={[1,2,3]}><EmployeeProfileDashboard /></ProtectedRoute>} />
                        <Route path="/hrms/employee/enhanced" element={<ProtectedRoute role={[1,2]}><EnhancedEmployeeProfile /></ProtectedRoute>} />
                        <Route path="/hrms/employee/departments" element={<ProtectedRoute role={[1]}><DepartmentManagement /></ProtectedRoute>} />
                        <Route path="/hrms/employee/roles" element={<ProtectedRoute role={[1]}><RoleManagement /></ProtectedRoute>} />
                        
                        <Route path="/hrms/attendance" element={<ProtectedRoute role={[1,2,3]}><AttendanceDashboard /></ProtectedRoute>} />
                        <Route path="/hrms/leave" element={<ProtectedRoute role={[1,2,3]}><LeaveDashboard /></ProtectedRoute>} />
                        <Route path="/hrms/payroll" element={<ProtectedRoute role={[1,2,3]}><PayrollDashboard /></ProtectedRoute>} />
                        <Route path="/hrms/performance" element={<ProtectedRoute role={[1,2,3]}><PerformanceDashboard /></ProtectedRoute>} />
                        <Route path="/hrms/training" element={<ProtectedRoute role={[1,2,3]}><TrainingDashboard /></ProtectedRoute>} />
                        <Route path="/hrms/promotion" element={<ProtectedRoute role={[1,2,3]}><PromotionDashboard /></ProtectedRoute>} />
                        <Route path="/hrms/disciplinary" element={<ProtectedRoute role={[1,2,3]}><DisciplinaryDashboard /></ProtectedRoute>} />
                        <Route path="/hrms/resignation" element={<ProtectedRoute role={[1,2,3]}><ResignationDashboard /></ProtectedRoute>} />
                        <Route path="/hrms/archival" element={<ProtectedRoute role={[1,2,3]}><ArchivalDashboard /></ProtectedRoute>} />
                        
                        {/* User Management Routes */}
                        <Route path="/admin/users" element={<ProtectedRoute role={1}><UserTable /></ProtectedRoute>} />
                        <Route path="/admin/users/register" element={<ProtectedRoute role={1}><EmployeeRegistration /></ProtectedRoute>} />
                        {/* Applicant Dashboard for role 6 */}
                        <Route path="/applicant/dashboard" element={<ProtectedRoute role={6}><ApplicantDashboard /></ProtectedRoute>} />
                        {/* New routes for role 3 pages */}
                        <Route path="/hrms/employees" element={<ProtectedRoute role={3}><EmployeeProfilePage /></ProtectedRoute>} />
                        <Route path="/hrms/attendances" element={<ProtectedRoute role={3}><AttendancePage /></ProtectedRoute>} />
                        <Route path="/hrms/leaves" element={<ProtectedRoute role={3}><LeavePage /></ProtectedRoute>} />
                        <Route path="/hrms/trainings" element={<ProtectedRoute role={3}><TrainingPage /></ProtectedRoute>} />
                        <Route path="/hrms/disciplinarys" element={<ProtectedRoute role={3}><DisciplinaryPage /></ProtectedRoute>} />
                        <Route path="/hrms/resignations" element={<ProtectedRoute role={3}><ResignationPage /></ProtectedRoute>} />
                    </Route>
                </>
            )}
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <ConfigProvider
                    theme={{
                        algorithm: theme.defaultAlgorithm,
                        token: {
                            colorPrimary: '#1890ff',
                            borderRadius: 6,
                        },
                    }}
                >
                    <AntdApp>
                        <BrowserRouter>
                            <AppContent />
                        </BrowserRouter>
                    </AntdApp>
                </ConfigProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
