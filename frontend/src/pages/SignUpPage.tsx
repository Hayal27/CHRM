import React, { useState } from 'react';
import { Form, Input, Button, Select, message, Card } from 'antd';
import axios from 'axios';

const { Option } = Select;

const SignUpPage: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Map sex to backend expected values ('M', 'F', or null)
      let sex = null;
      if (values.sex) {
        if (values.sex.toLowerCase() === 'male' || values.sex === 'M') sex = 'M';
        else if (values.sex.toLowerCase() === 'female' || values.sex === 'F') sex = 'F';
        else sex = null;
      }
      const payload = { ...values, sex };

      // Use the correct endpoint and headers
      const res = await axios.post('http://localhost:5000/api/signup', payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.data.success) {
        message.success(res.data.message || 'Sign up successful!');
        if (onSuccess) onSuccess();
      } else {
        message.error(res.data.message || 'Sign up failed.');
      }
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
        <Form.Item name="email" label="Gmail Address" rules={[
          { required: true, message: 'Please enter your Gmail address' },
          { type: 'email', message: 'Enter a valid email' },
          { pattern: /^[a-zA-Z0-9._%+-]+@gmail\.com$/, message: 'Please use a valid Gmail address' }
        ]}> <Input /> </Form.Item>
        <Form.Item name="password" label="Password" rules={[
          { required: true, message: 'Please enter a password' },
          { min: 6, message: 'Password must be at least 6 characters' }
        ]}> <Input.Password /> </Form.Item>
        <Form.Item name="phone" label="Phone"> <Input /> </Form.Item>
        <Form.Item name="sex" label="Gender">
          <Select allowClear>
            <Option value="male">Male</Option>
            <Option value="female">Female</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>Sign Up</Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SignUpPage;
