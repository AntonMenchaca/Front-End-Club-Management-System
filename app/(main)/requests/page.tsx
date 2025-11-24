'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, Table, Button, Space, Tag, message, Popconfirm } from 'antd';
import { CheckOutlined, CloseOutlined, DollarOutlined, TeamOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Expenditure, ClubMembership } from '@/lib/types';
import api from '@/lib/api';

export default function RequestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [memberships, setMemberships] = useState<ClubMembership[]>([]);
  const [activeTab, setActiveTab] = useState('expenditures');

  useEffect(() => {
    // Check if user is admin
    const user = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('user') || '{}')
      : {};
    
    const userRole = user.Role_Name || user.role;
    
    if (userRole !== 'Admin') {
      router.push('/events');
      return;
    }

    // Fetch requests
    fetchExpenditures();
    fetchMemberships();
  }, [router]);

  const fetchExpenditures = async () => {
    try {
      setLoading(true);
      const response = await api.get('/requests/expenditures');
      if (response.data?.status === 'success') {
        setExpenditures(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching expenditure requests:', error);
      message.error(error.response?.data?.message || 'Failed to fetch expenditure requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberships = async () => {
    try {
      const response = await api.get('/requests/memberships');
      if (response.data?.status === 'success') {
        setMemberships(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching membership requests:', error);
      message.error(error.response?.data?.message || 'Failed to fetch membership requests');
    }
  };

  const handleApproveExpenditure = async (id: number) => {
    try {
      const response = await api.put(`/requests/expenditures/${id}`, { status: 'Approved' });
      if (response.data?.status === 'success') {
        message.success('Expenditure request approved');
        fetchExpenditures();
      }
    } catch (error: any) {
      console.error('Error approving expenditure:', error);
      message.error(error.response?.data?.message || 'Failed to approve expenditure request');
    }
  };

  const handleRejectExpenditure = async (id: number) => {
    try {
      const response = await api.put(`/requests/expenditures/${id}`, { status: 'Rejected' });
      if (response.data?.status === 'success') {
        message.success('Expenditure request rejected');
        fetchExpenditures();
      }
    } catch (error: any) {
      console.error('Error rejecting expenditure:', error);
      message.error(error.response?.data?.message || 'Failed to reject expenditure request');
    }
  };

  const handleApproveMembership = async (id: number) => {
    try {
      const response = await api.put(`/requests/memberships/${id}`, { status: 'Active' });
      if (response.data?.status === 'success') {
        message.success('Membership request approved');
        fetchMemberships();
      }
    } catch (error: any) {
      console.error('Error approving membership:', error);
      message.error(error.response?.data?.message || 'Failed to approve membership request');
    }
  };

  const handleRejectMembership = async (id: number) => {
    try {
      const response = await api.put(`/requests/memberships/${id}`, { status: 'Rejected' });
      if (response.data?.status === 'success') {
        message.success('Membership request rejected');
        fetchMemberships();
      }
    } catch (error: any) {
      console.error('Error rejecting membership:', error);
      message.error(error.response?.data?.message || 'Failed to reject membership request');
    }
  };

  const expenditureColumns: ColumnsType<Expenditure> = [
    {
      title: 'ID',
      dataIndex: 'Expenditure_ID',
      key: 'Expenditure_ID',
      width: 80,
    },
    {
      title: 'Club',
      dataIndex: 'Club_Name',
      key: 'Club_Name',
      render: (club: string) => <Tag color="blue">{club}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'Expense_Description',
      key: 'Expense_Description',
      ellipsis: true,
    },
    {
      title: 'Amount',
      dataIndex: 'Amount',
      key: 'Amount',
      render: (amount: number) => `$${Number(amount).toFixed(2)}`,
      sorter: (a, b) => Number(a.Amount) - Number(b.Amount),
    },
    {
      title: 'Academic Year',
      dataIndex: 'Academic_Year',
      key: 'Academic_Year',
    },
    {
      title: 'Request Date',
      dataIndex: 'Request_Expense_Date',
      key: 'Request_Expense_Date',
      render: (date: string) => <Tag color="blue">{new Date(date).toLocaleDateString()}</Tag>,
      sorter: (a, b) => new Date(a.Request_Expense_Date).getTime() - new Date(b.Request_Expense_Date).getTime(),
    },
    {
      title: 'Status',
      dataIndex: 'Status',
      key: 'Status',
      render: (status: string) => (
        <Tag color={status === 'Pending' ? 'orange' : status === 'Approved' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical">
          <Popconfirm
            title="Approve this expenditure request?"
            onConfirm={() => handleApproveExpenditure(record.Expenditure_ID)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              icon={<CheckOutlined />}
              size="small"
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', width: '100px' }}
            >
              Approve
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Reject this expenditure request?"
            onConfirm={() => handleRejectExpenditure(record.Expenditure_ID)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              icon={<CloseOutlined />}
              size="small"
              style={{ width: '100px' }}
            >
              Deny
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const membershipColumns: ColumnsType<ClubMembership> = [
    {
      title: 'ID',
      dataIndex: 'Membership_ID',
      key: 'Membership_ID',
      width: 80,
    },
    {
      title: 'Name',
      key: 'name',
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
      render: (club: string) => <Tag color="blue">{club}</Tag>,
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
      title: 'Department',
      dataIndex: 'Department',
      key: 'Department',
    },
    {
      title: 'Year',
      dataIndex: 'Year',
      key: 'Year',
    },
    {
      title: 'Request Date',
      dataIndex: 'Date_Joined',
      key: 'Date_Joined',
      sorter: (a, b) => new Date(a.Date_Joined).getTime() - new Date(b.Date_Joined).getTime(),
    },
    {
      title: 'Status',
      dataIndex: 'Status',
      key: 'Status',
      render: (status: string) => (
        <Tag color={status === 'Pending' ? 'orange' : status === 'Active' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Approve this membership request?"
            onConfirm={() => handleApproveMembership(record.Membership_ID)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              icon={<CheckOutlined />}
              size="small"
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Approve
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Reject this membership request?"
            onConfirm={() => handleRejectMembership(record.Membership_ID)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              icon={<CloseOutlined />}
              size="small"
            >
              Deny
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1>Requests Dashboard</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Review and manage expenditure and membership requests
      </p>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'expenditures',
            label: (
              <span>
                <DollarOutlined /> Expenditure Requests ({expenditures.length})
              </span>
            ),
            children: (
              <Table
                style={{ width: '100%' }}
                columns={expenditureColumns}
                dataSource={expenditures}
                rowKey="Expenditure_ID"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            ),
          },
          {
            key: 'memberships',
            label: (
              <span>
                <TeamOutlined /> Membership Requests ({memberships.length})
              </span>
            ),
            children: (
              <Table
                style={{ width: '100%' }}
                columns={membershipColumns}
                dataSource={memberships}
                rowKey="Membership_ID"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

