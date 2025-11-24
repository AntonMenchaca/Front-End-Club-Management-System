'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Row, Col, Statistic, Table, Tag, Spin, message } from 'antd';
import { UserOutlined, CalendarOutlined, TeamOutlined, RiseOutlined, DollarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import api from '@/lib/api';
import { DashboardStats } from '@/lib/types';

interface RecentActivity {
  key: string;
  activity: string;
  user: string;
  club: string;
  date: string;
}

interface DashboardData extends DashboardStats {
  recentActivities: RecentActivity[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardData | null>(null);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/stats');
      if (response.data?.status === 'success' && response.data?.data) {
        setStats(response.data.data);
      } else {
        message.error('Failed to load dashboard statistics');
      }
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load dashboard statistics';
      message.error(errorMessage);
      
      // If unauthorized, redirect
      if (error.response?.status === 401 || error.response?.status === 403) {
        router.push('/events');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Check if user is admin
    const user = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('user') || '{}')
      : {};
    
    const userRole = user.Role_Name || user.role;
    
    if (userRole !== 'Admin') {
      // Redirect non-admin users to a page they can access
      router.push('/events');
      return;
    }

    // Fetch dashboard statistics
    fetchDashboardStats();
  }, [router, fetchDashboardStats]);

  const columns: ColumnsType<RecentActivity> = [
    {
      title: 'Activity',
      dataIndex: 'activity',
      key: 'activity',
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'Club',
      dataIndex: 'club',
      key: 'club',
      render: (club: string) => club ? <Tag color="blue">{club}</Tag> : '-',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div>
        <h1>Dashboard</h1>
        <Card>
          <p>No data available</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboard</h1>
      
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Clubs"
              value={stats.activeClubs}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Events"
              value={stats.totalEvents}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Members"
              value={stats.totalMembers}
              prefix={<RiseOutlined />}
              suffix="memberships"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Clubs"
              value={stats.pendingClubs}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Upcoming Events"
              value={stats.upcomingEvents}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Budget Allocated"
              value={stats.totalBudgetAllocated}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Budget Spent"
              value={stats.totalBudgetSpent}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Recent Activities" style={{ marginTop: 24 }}>
        <Table 
          columns={columns} 
          dataSource={stats.recentActivities || []} 
          pagination={false}
          loading={loading}
        />
      </Card>
    </div>
  );
}
