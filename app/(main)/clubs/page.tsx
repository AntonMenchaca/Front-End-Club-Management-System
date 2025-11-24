'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import { UserOutlined, CalendarOutlined, TeamOutlined, RiseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import api from '@/lib/api';
import { error } from 'console';

interface RecentActivity {
  key: string;
  activity: string;
  user: string;
  club: string;
  date: string;
}

export default function DashboardPage() {
  const router = useRouter();

  useEffect(  () => {
    try {
      const response = grabClubs( );
      console.log('the clubs from the response are', response);

    } catch (err) {
      console.error('Error fetching clubs on dashboard load:', err);
    }

  }, []);

  useEffect(() => {
    // Check if user is admin
    const user = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('user') || '{}')
      : {};
    
    const userRole = user.Role_Name || user.role;
    
    if (userRole !== 'Admin') {
      // Redirect non-admin users to a page they can access
      router.push('/events');
    }
  }, [router]);

  const grabClubs = async () => {
    try {
      let userId = null;
      const USER = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (USER) {
      userId = JSON.parse(USER).Person_ID;

      }
      if (userId){
      const response = await api.get(`/clubs/user/${userId}`);
      return response.data;
      }
      throw new Error('User ID not found');
    }
    catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };
  // Sample data - Until we can get fetch from API
  const recentActivities: RecentActivity[] = [
    {
      key: '1',
      activity: 'New member joined',
      user: 'John Doe',
      club: 'Chess Club',
      date: '2025-11-14',
    },
    {
      key: '2',
      activity: 'Event created',
      user: 'Jane Smith',
      club: 'Robotics Club',
      date: '2025-11-13',
    },
    {
      key: '3',
      activity: 'Event attendance recorded',
      user: 'Michael Johnson',
      club: 'Drama Society',
      date: '2025-11-12',
    },
  ];

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
      render: (club: string) => <Tag color="blue">{club}</Tag>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={15}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Clubs"
              value={10}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Events"
              value={12}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Members"
              value={20}
              prefix={<RiseOutlined />}
              suffix="memberships"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Recent Activities" style={{ marginTop: 24 }}>
        <Table columns={columns} dataSource={recentActivities} pagination={false} />
      </Card>
    </div>
  );
}
