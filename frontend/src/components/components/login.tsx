import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Auth/AuthContext';
import axios from 'axios';
import './login.css';

const MAX_ATTEMPTS = 5; // Should match backend
const ATTEMPT_COUNT_KEY = 'login_attempt_count';
const LAST_ATTEMPT_TIME_KEY = 'last_login_attempt';
const ATTEMPT_RESET_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

const LoginPage: React.FC = () => {
    // State for form inputs - matching expected API fields
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [forgotMsg, setForgotMsg] = useState<string | null>(null);
    const [attemptCount, setAttemptCount] = useState(0);
    const [lockMessage, setLockMessage] = useState<string | null>(null);
    const [isAccountLocked, setIsAccountLocked] = useState(false);
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotStep, setForgotStep] = useState<'email' | 'otp'>('email');
    const [showPassword, setShowPassword] = useState(false);

    // Get login function and loading state from AuthContext
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine where to redirect after login
    const from = location.state?.from?.pathname || "/";

    // Initialize attempt count from localStorage on component mount
    useEffect(() => {
        const storedAttemptCount = localStorage.getItem(ATTEMPT_COUNT_KEY);
        const lastAttemptTime = localStorage.getItem(LAST_ATTEMPT_TIME_KEY);
        
        if (storedAttemptCount && lastAttemptTime) {
            const timeSinceLastAttempt = Date.now() - parseInt(lastAttemptTime);
            
            // Reset attempts if enough time has passed
            if (timeSinceLastAttempt > ATTEMPT_RESET_TIME) {
                localStorage.removeItem(ATTEMPT_COUNT_KEY);
                localStorage.removeItem(LAST_ATTEMPT_TIME_KEY);
                setAttemptCount(0);
            } else {
                const count = parseInt(storedAttemptCount);
                setAttemptCount(count);
                
                // Check if account should be locked
                if (count >= MAX_ATTEMPTS) {
                    setIsAccountLocked(true);
                    setLockMessage(`Account temporarily locked. Too many failed attempts. Try again later.`);
                } else {
                    const remainingAttempts = MAX_ATTEMPTS - count;
                    setLockMessage(`Previous login attempts: ${count} of ${MAX_ATTEMPTS}. ${remainingAttempts} attempt(s) remaining.`);
                }
            }
        }
    }, []);

    // Handle form submission
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Prevent submission if account is locked
        if (isAccountLocked) {
            setError("Account is temporarily locked due to too many failed attempts.");
            return;
        }

        // Always clear previous error before new attempt
        setError(null);

        console.log('Attempting login with:', { user_name: userName, pass: password });

        try {
            // Call the login function from AuthContext
            const result = await login({
                user_name: userName,
                pass: password
            });

            if (result.success) {
                // Reset all error states and clear localStorage on successful login
                setAttemptCount(0);
                setLockMessage(null);
                setError(null);
                setIsAccountLocked(false);
                localStorage.removeItem(ATTEMPT_COUNT_KEY);
                localStorage.removeItem(LAST_ATTEMPT_TIME_KEY);
                navigate(from, { replace: true });
            } else {
                // Handle failed login
                const errorMessage = result.message || "Invalid username or password.";
                setError(errorMessage);

                // Check if the error message indicates account is locked from backend
                if (errorMessage.toLowerCase().includes("locked") || errorMessage.toLowerCase().includes("suspended")) {
                    setIsAccountLocked(true);
                    setLockMessage(errorMessage);
                    // Don't increment attempt count if already locked by backend
                } else {
                    // Increment attempt count and persist to localStorage
                    const newAttemptCount = attemptCount + 1;
                    setAttemptCount(newAttemptCount);
                    
                    // Store in localStorage
                    localStorage.setItem(ATTEMPT_COUNT_KEY, newAttemptCount.toString());
                    localStorage.setItem(LAST_ATTEMPT_TIME_KEY, Date.now().toString());

                    // Set appropriate lock message based on attempt count
                    if (newAttemptCount >= MAX_ATTEMPTS) {
                        setIsAccountLocked(true);
                        setLockMessage(`Maximum login attempts reached (${MAX_ATTEMPTS}). Account temporarily locked. Please try again later.`);
                    } else {
                        const remainingAttempts = MAX_ATTEMPTS - newAttemptCount;
                        setLockMessage(`Login attempt ${newAttemptCount} of ${MAX_ATTEMPTS}. ${remainingAttempts} attempt(s) remaining before account lock.`);
                    }
                }
            }
        } catch (loginError) {
            console.error('Login error:', loginError);
            setError("An unexpected error occurred. Please try again.");
        }
    };

    // Forgot password step 1: Request OTP
    const handleForgotRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotMsg(null);
        setForgotLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/requestPasswordReset', { user_name: forgotEmail });
            if (res.data.success) {
                setForgotMsg('OTP sent to your email. Please check your inbox.');
                setForgotStep('otp');
            } else {
                setForgotMsg(res.data.message || 'Failed to send OTP.');
            }
        } catch (err: any) {
            setForgotMsg(err?.response?.data?.message || 'Failed to send OTP.');
        }
        setForgotLoading(false);
    };

    // Forgot password step 2: Reset password with OTP
    const handleForgotReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotMsg(null);
        setForgotLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/reset-resetPassword', {
                user_name: forgotEmail,
                otp,
                new_password: newPassword
            });
            if (res.data.success) {
                setForgotMsg('Password reset successful. You can now log in with your new password.');
                setTimeout(() => {
                    setShowForgotModal(false);
                    setForgotStep('email');
                    setForgotEmail('');
                    setOtp('');
                    setNewPassword('');
                    setForgotMsg(null);
                }, 2000);
            } else {
                setForgotMsg(res.data.message || 'Failed to reset password.');
            }
        } catch (err: any) {
            setForgotMsg(err?.response?.data?.message || 'Failed to reset password.');
        }
        setForgotLoading(false);
    };

    // Clear error messages when user starts typing
    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserName(e.target.value);
        if (error) setError(null);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (error) setError(null);
    };

    return (
        <div className="login-container">
            {/* Background with gradient overlay */}
            <div className="login-background">
                <div className="background-overlay"></div>
                <div className="background-pattern"></div>
            </div>

            {/* Main login content */}
            <div className="login-content">
                <div className="login-card">
                    {/* Header Section */}
                    <div className="login-header">
                        <div className="logo-container">
                            <div className="logo-icon">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h1 className="company-name">HR Management System</h1>
                            <p className="company-tagline">Enterprise Human Resource Management</p>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="login-form-container">
                        <div className="form-header">
                            <h2 className="welcome-text">Welcome Back</h2>
                            <p className="login-subtitle">Sign in to access your HR dashboard</p>
                        </div>

                        <form onSubmit={handleSubmit} className="login-form">
                            {/* Error Messages */}
                            {error && (
                                <div className="alert alert-error">
                                    <div className="alert-icon">
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                                            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                    </div>
                                    <div className="alert-content">
                                        <strong>Login Failed:</strong> {error}
                                    </div>
                                </div>
                            )}
                            
                            {/* Lock Warning */}
                            {lockMessage && (
                                <div className={`alert ${isAccountLocked ? 'alert-error' : 'alert-warning'}`}>
                                    <div className="alert-icon">
                                        {isAccountLocked ? (
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                                                <circle cx="12" cy="16" r="1" stroke="currentColor" strokeWidth="2"/>
                                                <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2"/>
                                            </svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" />
                                                <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="alert-content">
                                        <strong>{isAccountLocked ? "Account Locked:" : "Warning:"}</strong> {lockMessage}
                                    </div>
                                </div>
                            )}

                            {/* Username Field */}
                            <div className="form-group">
                                <label htmlFor="login-page-username" className="form-label">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="input-icon">
                                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                    Username
                                </label>
                                <input
                                    type="text"
                                    autoComplete="username"
                                    id="login-page-username"
                                    value={userName}
                                    onChange={handleUsernameChange}
                                    required
                                    disabled={isLoading || isAccountLocked}
                                    className="form-input"
                                    placeholder="Enter your username"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="form-group">
                                <label htmlFor="login-page-password" className="form-label">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="input-icon">
                                        <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                    Password
                                </label>
                                <div className="password-input-container">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        id="login-page-password"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        required
                                        disabled={isLoading || isAccountLocked}
                                        className="form-input"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading || isAccountLocked}
                                    >
                                        {showPassword ? (
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 12S5 4 12 4S23 12 23 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M12 9C13.1046 9 14 9.89543 14 11C14 12.1046 13.1046 13 12 13C10.8954 13 10 12.1046 10 11C10 9.89543 10.8954 9 12 9Z" stroke="currentColor" strokeWidth="2"/>
                                            </svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65661 6.06 6.06M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1747 15.0074 10.8019 14.8565C10.4291 14.7056 10.0927 14.4811 9.81215 14.1962C9.53157 13.9113 9.31269 13.5722 9.16956 13.1968C9.02643 12.8214 8.9619 12.4183 8.98026 12.0136C8.99862 11.6089 9.09977 11.2122 9.27784 10.8419C9.45591 10.4716 9.70745 10.1352 10.0195 9.85309C10.3315 9.57096 10.6982 9.34911 11.0968 9.20033C11.4954 9.05155 11.9198 8.97889 12.3491 8.98567C12.7784 8.99245 13.2007 9.0787 13.5921 9.23969C13.9835 9.40068 14.3374 9.63356 14.6337 9.92647C14.93 10.2194 15.1634 10.5669 15.3199 10.9486C15.4764 11.3303 15.5535 11.7387 15.5466 12.1497C15.5397 12.5607 15.4489 12.9656 15.2788 13.3408C15.1088 13.716 14.8626 14.054 14.5537 14.3346" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2"/>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Login Button */}
                            <button 
                                type="submit" 
                                disabled={isLoading || isAccountLocked} 
                                className={`login-button ${isAccountLocked ? 'locked' : ''}`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="spinner"></div>
                                        <span>Signing In...</span>
                                    </>
                                ) : isAccountLocked ? (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                                            <circle cx="12" cy="16" r="1" stroke="currentColor" strokeWidth="2"/>
                                            <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                        <span>Account Locked</span>
                                    </>
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M10 17L15 12L10 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <span>Sign In</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Forgot Password Link */}
                        <div className="forgot-password">
                            <button
                                type="button"
                                className="forgot-link"
                                onClick={() => setShowForgotModal(true)}
                                disabled={isLoading}
                            >
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                Forgot Password?
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="login-footer">
                            <p className="footer-text">
                                Secure access to your HR management portal
                            </p>
                            <div className="security-badges">
                                <span className="security-badge">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    SSL Secured
                                </span>
                                <span className="security-badge">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                    Enterprise Ready
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="modal-overlay" onClick={() => {
                    setShowForgotModal(false);
                    setForgotMsg(null);
                    setForgotEmail('');
                    setOtp('');
                    setNewPassword('');
                    setForgotStep('email');
                }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Reset Password</h3>
                            <button 
                                type="button" 
                                className="modal-close"
                                onClick={() => {
                                    setShowForgotModal(false);
                                    setForgotMsg(null);
                                    setForgotEmail('');
                                    setOtp('');
                                    setNewPassword('');
                                    setForgotStep('email');
                                }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            {forgotMsg && (
                                <div className={`alert ${forgotMsg.toLowerCase().includes('successful') ? 'alert-success' : 'alert-info'}`}>
                                    <div className="alert-icon">
                                        {forgotMsg.toLowerCase().includes('successful') ? (
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22 11.08V12A10 10 0 1 1 5.68 3.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2"/>
                                            </svg>
                                        )}
                                    </div>
                                    <div className="alert-content">{forgotMsg}</div>
                                </div>
                            )}
                            
                            {forgotStep === 'email' && (
                                <form onSubmit={handleForgotRequest} className="modal-form">
                                    <div className="form-group">
                                        <label htmlFor="forgot-email" className="form-label">Email Address</label>
                                        <input
                                            type="email"
                                            className="form-input"
                                            id="forgot-email"
                                            value={forgotEmail}
                                            onChange={e => setForgotEmail(e.target.value)}
                                            required
                                            disabled={forgotLoading}
                                            placeholder="Enter your email address"
                                        />
                                    </div>
                                    <button type="submit" className="modal-button primary" disabled={forgotLoading}>
                                        {forgotLoading ? (
                                            <>
                                                <div className="spinner"></div>
                                                <span>Sending...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                <span>Send Reset Code</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                            
                            {forgotStep === 'otp' && (
                                <form onSubmit={handleForgotReset} className="modal-form">
                                    <div className="form-group">
                                        <label htmlFor="otp" className="form-label">Verification Code</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            id="otp"
                                            value={otp}
                                            onChange={e => setOtp(e.target.value)}
                                            required
                                            disabled={forgotLoading}
                                            placeholder="Enter the 6-digit code"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="new-password" className="form-label">New Password</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            id="new-password"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            required
                                            disabled={forgotLoading}
                                            placeholder="Enter your new password"
                                        />
                                    </div>
                                    <button type="submit" className="modal-button success" disabled={forgotLoading}>
                                        {forgotLoading ? (
                                            <>
                                                <div className="spinner"></div>
                                                <span>Resetting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                                                </svg>
                                                <span>Reset Password</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginPage;
