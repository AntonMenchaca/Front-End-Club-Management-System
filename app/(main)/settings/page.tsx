'use client';

import React from 'react';
import { Card, Form, Input, Button, Divider, message, DatePicker, Select } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

export default function SettingsPage() {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    message.success('Settings saved successfully');
  };

  return (
    <div>
      <h1>System Settings</h1>

      <Card style={{ marginTop: 24, maxWidth: 800 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            systemName: 'Club Management System',
            academicYear: '2024-2025',
            defaultBudget: 500,
            semester: 'Fall',
          }}
        >
          <h3>General Settings</h3>
          <Form.Item
            name="systemName"
            label="System Name"
            rules={[{ required: true, message: 'Please enter system name' }]}
          >
            <Input placeholder="Enter system name" />
          </Form.Item>

          <Form.Item
            name="academicYear"
            label="Academic Year"
            rules={[{ required: true, message: 'Please enter academic year' }]}
          >
            <Input placeholder="e.g., 2024-2025" />
          </Form.Item>

        

          <Divider />
          {/* TODO: Add budget settings for ADMIN Role only */}
          <h3>Budget Settings</h3>
          <Form.Item
            name="defaultBudget"
            label="Default Club Budget Allocation"
            rules={[{ required: true, message: 'Please enter default budget' }]}
          >
            <Input type="number" prefix="$" placeholder="500" />
          </Form.Item>

          <Divider />

        

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Save Settings
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
