'use client';

import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Space, Divider } from 'antd';
import { LockOutlined, UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import api from '@/lib/api';

const { Title, Text } = Typography;

interface PasswordChangeFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    // Get user from localStorage
    const userData = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('user') || '{}')
      : {};
    setUser(userData);
  }, []);

  const onPasswordChange = async (values: PasswordChangeFormValues) => {
    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      
      message.success('Password changed successfully!');
      form.resetFields();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        Profile Settings
      </Title>

      <Card title="User Information" style={{ marginBottom: '24px' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>Name:</Text>
            <Text style={{ marginLeft: '8px' }}>
              {user?.First_Name || user?.firstName} {user?.Last_Name || user?.lastName}
            </Text>
          </div>
          <div>
            <Text strong>Email:</Text>
            <Text style={{ marginLeft: '8px' }}>{user?.Email || user?.email}</Text>
          </div>
          {user?.Phone || user?.phone ? (
            <div>
              <Text strong>Phone:</Text>
              <Text style={{ marginLeft: '8px' }}>{user?.Phone || user?.phone}</Text>
            </div>
          ) : null}
          {user?.Department || user?.department ? (
            <div>
              <Text strong>Department:</Text>
              <Text style={{ marginLeft: '8px' }}>{user?.Department || user?.department}</Text>
            </div>
          ) : null}
          {user?.Year || user?.year ? (
            <div>
              <Text strong>Year:</Text>
              <Text style={{ marginLeft: '8px' }}>{user?.Year || user?.year}</Text>
            </div>
          ) : null}
          <div>
            <Text strong>Role:</Text>
            <Text style={{ marginLeft: '8px' }}>{user?.Role_Name || user?.role}</Text>
          </div>
        </Space>
      </Card>

      <Card title="Change Password">
        <Form
          form={form}
          name="changePassword"
          onFinish={onPasswordChange}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true, message: 'Please input your current password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Current Password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please input your new password!' },
              { min: 6, message: 'Password must be at least 6 characters!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="New Password"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm New Password"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%' }}
            >
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

