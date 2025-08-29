import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Select, message, Card, Modal, Tabs } from 'antd';
import axios from 'axios';
import { useAuth } from '../Auth/AuthContext';
import './login.css';

const { Option } = Select;
const { TabPane } = Tabs;

const MAX_ATTEMPTS = 5;
const ATTEMPT_COUNT_KEY = 'login_attempt_count';
const LAST_ATTEMPT_TIME_KEY = 'last_login_attempt';
const ATTEMPT_RESET_TIME = 15
const Applicant_login: React.FC = () => {
    // Login state
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [attemptCount, setAttemptCount] = useState(0);
    const [lockMessage, setLockMessage] = useState<string | null>(null);
    const [isAccountLocked, setIsAccountLocked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    // Sign up modal state
    const [signUpVisible, setSignUpVisible] = useState(false);
    const { login } = useAuth();

    useEffect(() => {
        const storedAttemptCount = localStorage.getItem(ATTEMPT_COUNT_KEY);
        const lastAttemptTime = localStorage.getItem(LAST_ATTEMPT_TIME_KEY);
        if (storedAttemptCount && lastAttemptTime) {
            const timeSinceLastAttempt = Date.now() - parseInt(lastAttemptTime);
            if (timeSinceLastAttempt > ATTEMPT_RESET_TIME) {
                localStorage.removeItem(ATTEMPT_COUNT_KEY);
                localStorage.removeItem(LAST_ATTEMPT_TIME_KEY);
                setAttemptCount(0);
            } else {
                const count = parseInt(storedAttemptCount);
                setAttemptCount(count);
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

    // Login handler
    const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isAccountLocked) {
            setError("Account is temporarily locked due to too many failed attempts.");
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            const res = await login({ user_name: userName, pass: password });
            if (res.success) {
                setAttemptCount(0);
                setLockMessage(null);
                setError(null);
                setIsAccountLocked(false);
                localStorage.removeItem(ATTEMPT_COUNT_KEY);
                localStorage.removeItem(LAST_ATTEMPT_TIME_KEY);
                message.success('Login successful!');
                // Get user from localStorage (set by AuthContext)
                const userString = localStorage.getItem('user');
                const user = userString ? JSON.parse(userString) : null;
                if (user && user.role_id === 6) {
                    navigate('/applicant/dashboard', { replace: true });
                } else {
                    navigate(from, { replace: true });
                }
            } else {
                const errorMessage = res.message || "Invalid username or password.";
                setError(errorMessage);
                const newAttemptCount = attemptCount + 1;
                setAttemptCount(newAttemptCount);
                localStorage.setItem(ATTEMPT_COUNT_KEY, newAttemptCount.toString());
                localStorage.setItem(LAST_ATTEMPT_TIME_KEY, Date.now().toString());
                if (newAttemptCount >= MAX_ATTEMPTS) {
                    setIsAccountLocked(true);
                    setLockMessage(`Maximum login attempts reached (${MAX_ATTEMPTS}). Account temporarily locked. Please try again later.`);
                } else {
                    const remainingAttempts = MAX_ATTEMPTS - newAttemptCount;
                    setLockMessage(`Login attempt ${newAttemptCount} of ${MAX_ATTEMPTS}. ${remainingAttempts} attempt(s) remaining before account lock.`);
                }
            }
        } catch (loginError) {
            setError("An unexpected error occurred. Please try again.");
        }
        setIsLoading(false);
    };

    // Sign up handler
    const handleSignUpSuccess = () => {
        setSignUpVisible(false);
        message.success('Sign up successful! You can now log in.');
    };

    return (
        <div className="career-applicant-container">
            <Card style={{ maxWidth: 500, margin: '40px auto' }}>
                <Tabs defaultActiveKey="login">
                    <TabPane tab="Login" key="login">
                        <form onSubmit={handleLogin} className="login-form">
                            {error && <div className="alert alert-error">{error}</div>}
                            {lockMessage && <div className={`alert ${isAccountLocked ? 'alert-error' : 'alert-warning'}`}>{lockMessage}</div>}
                            <Form.Item label="Username" required>
                                <Input value={userName} onChange={e => setUserName(e.target.value)} disabled={isLoading || isAccountLocked} />
                            </Form.Item>
                            <Form.Item label="Password" required>
                                <Input.Password value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading || isAccountLocked} />
                            </Form.Item>
                            <Button type="primary" htmlType="submit" loading={isLoading} block disabled={isAccountLocked}>Login</Button>
                            <div style={{ marginTop: 16, textAlign: 'center' }}>
                                <Button type="link" onClick={() => setSignUpVisible(true)}>Sign Up</Button>
                            </div>
                        </form>
                    </TabPane>
                    <TabPane tab="Sign Up" key="signup">
                        <SignUpPage onSuccess={handleSignUpSuccess} />
                    </TabPane>
                </Tabs>
            </Card>
            <Modal
                title="Job Seeker Sign Up"
                open={signUpVisible}
                onCancel={() => setSignUpVisible(false)}
                footer={null}
                width={450}
            >
                <SignUpPage onSuccess={handleSignUpSuccess} />
            </Modal>
        </div>
    );
};

const SignUpPage: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5001/api/signup', values);
            message.success(res.data.message || 'Sign up successful!');
            if (onSuccess) onSuccess();
        } catch (err: any) {
            message.error(err.response?.data?.message || 'Sign up failed.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <Card title="Job Seeker Sign Up" style={{ maxWidth: 400, margin: '40px auto' }}>
            <Form layout="vertical" onFinish={onFinish}>
                <Form.Item name="fname" label="First Name" rules={[{ required: true, message: 'Please enter your first name' }]}> <Input /> </Form.Item>
                <Form.Item name="lname" label="Last Name" rules={[{ required: true, message: 'Please enter your last name' }]}> <Input /> </Form.Item>
                <Form.Item name="email" label="Gmail Address" rules={[{ required: true, message: 'Please enter your Gmail address' }, { type: 'email', message: 'Enter a valid email' }]}> <Input /> </Form.Item>
                <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please enter a password' }, { min: 6, message: 'Password must be at least 6 characters' }]}> <Input.Password /> </Form.Item>
                <Form.Item name="phone" label="Phone"> <Input /> </Form.Item>
                <Form.Item name="sex" label="Gender"> <Select allowClear> <Option value="male">Male</Option> <Option value="female">Female</Option> <Option value="other">Other</Option> </Select> </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>Sign Up</Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default Applicant_login;
