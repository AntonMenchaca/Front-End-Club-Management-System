'use client';

import React, { useState } from 'react';
import { Table, Button, Space, Tag, Input, Modal, Form, Select, message } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ActiveClubMember } from '@/lib/types';

export default function MembersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  // Sample data - Until we can get fetch from API
  const [members, setMembers] = useState<ActiveClubMember[]>([
    {
      Membership_ID: 1,
      Person_ID: 2001,
      First_Name: 'John',
      Last_Name: 'Doe',
      Email: 'john.doe@university.edu',
      Club_ID: 3001,
      Club_Name: 'Chess Club',
      Role: 'Club Leader',
      Date_Joined: '2020-09-01',
    },
    {
      Membership_ID: 2,
      Person_ID: 2002,
      First_Name: 'Jane',
      Last_Name: 'Smith',
      Email: 'jane.smith@university.edu',
      Club_ID: 3002,
      Club_Name: 'Robotics Club',
      Role: 'Club Leader',
      Date_Joined: '2019-08-15',
    },
    {
      Membership_ID: 4002,
      Person_ID: 2002,
      First_Name: 'Jane',
      Last_Name: 'Smith',
      Email: 'jane.smith@university.edu',
      Club_ID: 3001,
      Club_Name: 'Chess Club',
      Role: 'Club Member',
      Date_Joined: '2020-09-15',
    },
  ]);

  const columns: ColumnsType<ActiveClubMember> = [
    {
      title: 'Member ID',
      dataIndex: 'Person_ID',
      key: 'Person_ID',
      width: 100,
    },
    {
      title: 'Name',
      key: 'name',
      filteredValue: [searchText],
      onFilter: (value, record) =>
        `${record.First_Name} ${record.Last_Name}`.toLowerCase().includes(value.toString().toLowerCase()) ||
        record.Email.toLowerCase().includes(value.toString().toLowerCase()) ||
        record.Club_Name.toLowerCase().includes(value.toString().toLowerCase()),
      render: (_, record) => `${record.First_Name} ${record.Last_Name}`,
    },
    {
      title: 'Email',
      dataIndex: 'Email',
      key: 'Email',
    },
    {
      title: 'Club',
      dataIndex: 'Club_Name',
      key: 'Club_Name',
    },
    {
      title: 'Role',
      dataIndex: 'Role',
      key: 'Role',
      render: (role: string) => (
        <Tag color={role === 'Club Leader' ? 'gold' : 'blue'}>
          {role}
        </Tag>
      ),
    },
    {
      title: 'Date Joined',
      dataIndex: 'Date_Joined',
      key: 'Date_Joined',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.Membership_ID)}
          >
            Remove
          </Button>
        </Space>
      ),
    },
  ];

  const handleAddMember = () => {
    setIsModalOpen(true);
  };

  const handleEdit = (record: ActiveClubMember) => {
    message.info(`Edit membership: ${record.First_Name} ${record.Last_Name} in ${record.Club_Name}`);
  };

  const handleDelete = (membershipId: number) => {
    Modal.confirm({
      title: 'Are you sure you want to remove this member?',
      content: 'This action cannot be undone.',
      onOk: () => {
        setMembers(members.filter((m) => m.Membership_ID !== membershipId));
        message.success('Member removed successfully');
      },
    });
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      // In real app, make API call to add member
      message.success('Member added successfully');
      form.resetFields();
      setIsModalOpen(false);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>Club Members</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddMember}>
          Add Member
        </Button>
      </div>

      <Input
        placeholder="Search by name, email, or club..."
        prefix={<SearchOutlined />}
        style={{ marginBottom: 16, maxWidth: 400 }}
        onChange={(e) => setSearchText(e.target.value)}
        allowClear
      />

      <Table columns={columns} dataSource={members} rowKey="Membership_ID" />

      <Modal
        title="Add New Member to Club"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Add"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="Person_ID"
            label="Select User"
            rules={[{ required: true, message: 'Please select a user' }]}
          >
            <Select placeholder="Select a user">
              <Select.Option value={2001}>John Doe</Select.Option>
              <Select.Option value={2002}>Jane Smith</Select.Option>
              <Select.Option value={2003}>Michael Johnson</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="Club_ID"
            label="Select Club"
            rules={[{ required: true, message: 'Please select a club' }]}
          >
            <Select placeholder="Select a club">
              <Select.Option value={3001}>Chess Club</Select.Option>
              <Select.Option value={3002}>Robotics Club</Select.Option>
              <Select.Option value={3003}>Drama Society</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="Role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
            initialValue="Club Member"
          >
            <Select>
              <Select.Option value="Club Member">Club Member</Select.Option>
              <Select.Option value="Club Leader">Club Leader</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
