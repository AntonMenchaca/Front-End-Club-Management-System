'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Row, Col, Table, Tag, Button, Tabs, message, Space, Input, Popconfirm } from 'antd';
import { 
  TeamOutlined, 
  CalendarOutlined, 
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  DollarOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Club, ClubMembership, Event } from '@/lib/types';
import api from '@/lib/api';

export default function ClubsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [userClubs, setUserClubs] = useState<Club[]>([]);
  const [userMemberships, setUserMemberships] = useState<ClubMembership[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [selectedClubForView, setSelectedClubForView] = useState<Club | null>(null);
  const [clubMembers, setClubMembers] = useState<any[]>([]);
  const [clubEvents, setClubEvents] = useState<Event[]>([]);
  const [clubBudgetSummary, setClubBudgetSummary] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all-clubs');

  const fetchAllClubs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/clubs');
      if (response.data?.status === 'success') {
        const clubs = response.data.data || [];
        setAllClubs(clubs);
      }
    } catch (error: any) {
      console.error('Error fetching clubs:', error);
      message.error('Failed to fetch clubs');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserClubs = useCallback(async (userId: number) => {
    try {
      const response = await api.get(`/clubs/user/${userId}`);
      if (response.data?.status === 'success') {
        const clubs = response.data.data || [];
        setUserClubs(clubs);
        // Set first club as selected if available
        setSelectedClubId(prev => prev || (clubs.length > 0 ? clubs[0].Club_ID : null));
      }
    } catch (error: any) {
      console.error('Error fetching user clubs:', error);
    }
  }, []);

  const fetchUserMemberships = useCallback(async (userId: number) => {
    try {
      const response = await api.get(`/memberships?personId=${userId}&status=Active`);
      if (response.data?.status === 'success') {
        setUserMemberships(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching user memberships:', error);
    }
  }, []);

  // Check if user can view budget (Admin or Club Leader)
  const canViewBudget = useCallback((clubId: number) => {
    if (isAdmin) return true;
    // Check if user is a club leader for this club
    const membership = userMemberships.find(
      m => m.Club_ID === clubId && m.Role === 'Club Leader' && m.Status === 'Active'
    );
    return !!membership;
  }, [isAdmin, userMemberships]);

  useEffect(() => {
    const userData = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('user') || '{}')
      : {};
    setUser(userData);
    const userRole = userData.Role_Name || userData.role;
    const adminStatus = userRole === 'Admin';
    setIsAdmin(adminStatus);
    
    if (userData.Person_ID) {
      fetchUserClubs(userData.Person_ID);
      fetchUserMemberships(userData.Person_ID);
    }
    
    // Fetch clubs after setting admin status
    fetchAllClubs();
  }, [fetchUserClubs, fetchUserMemberships, fetchAllClubs]);

  useEffect(() => {
    if (selectedClubId && userClubs.some(c => c.Club_ID === selectedClubId)) {
      fetchClubMembers(selectedClubId);
      fetchClubEvents(selectedClubId);
      // Only fetch budget if user has permission
      if (canViewBudget(selectedClubId)) {
        fetchClubBudgetSummary(selectedClubId);
      }
    }
  }, [selectedClubId, userClubs, canViewBudget]);

  // Fetch members and events when admin selects a club for viewing
  useEffect(() => {
    if (selectedClubForView && isAdmin) {
      fetchClubMembers(selectedClubForView.Club_ID);
      fetchClubEvents(selectedClubForView.Club_ID);
      // Admin can always view budget
      fetchClubBudgetSummary(selectedClubForView.Club_ID);
    }
  }, [selectedClubForView, isAdmin]);

  const fetchClubMembers = async (clubId: number) => {
    try {
      const response = await api.get(`/clubs/${clubId}/members`);
      if (response.data?.status === 'success') {
        // Filter to show only active members
        const activeMembers = (response.data.data || []).filter(
          (member: any) => member.Status === 'Active'
        );
        setClubMembers(activeMembers);
      }
    } catch (error: any) {
      console.error('Error fetching club members:', error);
      message.error('Failed to fetch club members');
    }
  };

  const fetchClubEvents = async (clubId: number) => {
    try {
      const response = await api.get(`/clubs/${clubId}/events`);
      if (response.data?.status === 'success') {
        const allEvents = response.data.data || [];
        // Filter for upcoming events (Event_Date >= today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcomingEvents = allEvents.filter((event: Event) => {
          if (!event.Event_Date) return false;
          const eventDate = new Date(event.Event_Date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= today;
        });
        // Sort by date ascending
        upcomingEvents.sort((a: Event, b: Event) => {
          const dateA = a.Event_Date ? new Date(a.Event_Date).getTime() : 0;
          const dateB = b.Event_Date ? new Date(b.Event_Date).getTime() : 0;
          return dateA - dateB;
        });
        setClubEvents(upcomingEvents);
      }
    } catch (error: any) {
      console.error('Error fetching club events:', error);
      message.error('Failed to fetch club events');
    }
  };

  const fetchClubBudgetSummary = async (clubId: number) => {
    try {
      const response = await api.get(`/clubs/${clubId}/budget/summary`);
      if (response.data?.status === 'success') {
        setClubBudgetSummary(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching club budget summary:', error);
      // Don't show error message if budget doesn't exist yet
      if (error.response?.status !== 404) {
        message.error('Failed to fetch club budget summary');
      }
      setClubBudgetSummary([]);
    }
  };

  const handleRequestToJoin = async (clubId: number) => {
    if (!user?.Person_ID) {
      message.error('User information not found');
      return;
    }

    try {
      const response = await api.post('/memberships', {
        personId: user.Person_ID,
        clubId: clubId,
        role: 'Club Member',
        status: 'Pending'
      });

      if (response.data?.status === 'success') {
        message.success('Membership request submitted successfully!');
        // Refresh user memberships to show pending request
        fetchUserMemberships(user.Person_ID);
        // Refresh all clubs to update button state
        fetchAllClubs();
      }
    } catch (error: any) {
      console.error('Error requesting to join club:', error);
      message.error(
        error.response?.data?.message || 
        'Failed to submit membership request. You may already have a pending or active membership.'
      );
    }
  };

  // Filter clubs that user is not already a member of (or is admin)
  const getAvailableClubs = () => {
    if (isAdmin) {
      return allClubs;
    }
    
    const userClubIds = new Set([
      ...userClubs.map(c => c.Club_ID),
      ...userMemberships.map(m => m.Club_ID)
    ]);
    
    return allClubs.filter(club => {
      // Show only Active clubs
      if (club.STATUS !== 'Active') return false;
      // Exclude clubs user is already a member of
      return !userClubIds.has(club.Club_ID);
    });
  };

  const availableClubs = getAvailableClubs().filter(club => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      club.Club_Name?.toLowerCase().includes(searchLower) ||
      club.Description?.toLowerCase().includes(searchLower)
    );
  });

  const handleClubRowClick = (club: Club) => {
    if (isAdmin) {
      setSelectedClubForView(club);
      // Switch to the club's tab
      setActiveTab(`club-${club.Club_ID}`);
      // Fetch data for the selected club
      fetchClubMembers(club.Club_ID);
      fetchClubEvents(club.Club_ID);
      // Admin can always view budget
      fetchClubBudgetSummary(club.Club_ID);
    }
  };

  const handleStatusChange = async (clubId: number, newStatus: 'Active' | 'Inactive') => {
    try {
      const response = await api.put(`/clubs/${clubId}`, {
        status: newStatus
      });

      if (response.data?.status === 'success') {
        const statusMessages = {
          'Active': 'Club activated successfully!',
          'Inactive': 'Club deactivated successfully!'
        };
        message.success(statusMessages[newStatus]);
        
        // Refresh all clubs to update the list
        await fetchAllClubs();
        
        // Refresh the selected club if it's the one we just updated
        if (selectedClubForView?.Club_ID === clubId) {
          const updatedClubResponse = await api.get(`/clubs/${clubId}`);
          if (updatedClubResponse.data?.status === 'success') {
            setSelectedClubForView(updatedClubResponse.data.data);
            // If club became inactive, switch to all clubs tab
            if (newStatus === 'Inactive') {
              setActiveTab('all-clubs');
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error changing club status:', error);
      message.error(error.response?.data?.message || 'Failed to change club status');
    }
  };

  const getStatusChangeOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'Pending':
        return [
          { label: 'Approve (Active)', status: 'Active' as const },
          { label: 'Reject (Inactive)', status: 'Inactive' as const }
        ];
      case 'Inactive':
        return [
          { label: 'Activate', status: 'Active' as const }
        ];
      case 'Active':
        return [
          { label: 'Deactivate', status: 'Inactive' as const }
        ];
      default:
        return [];
    }
  };

  const clubListColumns: ColumnsType<Club> = [
    {
      title: 'Club Name',
      dataIndex: 'Club_Name',
      key: 'Club_Name',
      render: (name: string, record: Club) => (
        <strong 
          style={{ 
            cursor: isAdmin ? 'pointer' : 'default',
            color: isAdmin ? '#1890ff' : 'inherit'
          }}
          onClick={() => isAdmin && handleClubRowClick(record)}
        >
          {name}
        </strong>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'Description',
      key: 'Description',
      ellipsis: true,
    },
    {
      title: 'Members',
      dataIndex: 'Member_Count',
      key: 'Member_Count',
      render: (count: number) => (
        <Tag icon={<TeamOutlined />}>{count || 0}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'STATUS',
      key: 'STATUS',
      render: (status: string) => {
        const statusColors: Record<string, string> = {
          'Active': 'green',
          'Pending': 'orange',
          'Inactive': 'red'
        };
        return (
          <Tag color={statusColors[status] || 'default'}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: isAdmin ? 250 : 150,
      render: (_, record) => {
        // Admin actions
        if (isAdmin) {
          const statusOptions = getStatusChangeOptions(record.STATUS);
          return (
            <Space>
              {statusOptions.map((option) => (
                <Popconfirm
                  key={option.status}
                  title={`Are you sure you want to ${option.label.toLowerCase()} this club?`}
                  description={`This will change the club status to ${option.status}.`}
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    handleStatusChange(record.Club_ID, option.status);
                  }}
                  onCancel={(e) => {
                    e?.stopPropagation();
                  }}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type={option.status === 'Active' ? 'primary' : 'default'}
                    danger={option.status === 'Inactive' && record.STATUS === 'Active'}
                    icon={option.status === 'Active' ? <CheckOutlined /> : <CloseOutlined />}
                    size="small"
                    style={
                      option.status === 'Active' && record.STATUS === 'Pending'
                        ? { backgroundColor: '#52c41a', borderColor: '#52c41a' }
                        : undefined
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    {option.label}
                  </Button>
                </Popconfirm>
              ))}
              <Button
                type="link"
                onClick={() => handleClubRowClick(record)}
              >
                View Details
              </Button>
            </Space>
          );
        }

        // Regular user actions
        const hasMembership = userMemberships.some(m => m.Club_ID === record.Club_ID);
        const isPending = userMemberships.some(
          m => m.Club_ID === record.Club_ID && m.Status === 'Pending'
        );
        
        if (isPending) {
          return <Tag color="orange">Request Pending</Tag>;
        }
        
        if (hasMembership) {
          return <Tag color="green">Already a Member</Tag>;
        }
        
        return (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleRequestToJoin(record.Club_ID)}
          >
            Request to Join
          </Button>
        );
      },
    },
  ];

  const memberColumns: ColumnsType<any> = [
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
      title: 'Date Joined',
      dataIndex: 'Date_Joined',
      key: 'Date_Joined',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  const eventColumns: ColumnsType<Event> = [
    {
      title: 'Event Name',
      dataIndex: 'Event_Name',
      key: 'Event_Name',
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: 'Description',
      dataIndex: 'Description',
      key: 'Description',
      ellipsis: true,
    },
    {
      title: 'Date',
      dataIndex: 'Event_Date',
      key: 'Event_Date',
      render: (date: string) => (
        <Tag color="blue">{date ? new Date(date).toLocaleDateString() : 'TBD'}</Tag>
      ),
      sorter: (a, b) => {
        const dateA = a.Event_Date ? new Date(a.Event_Date).getTime() : 0;
        const dateB = b.Event_Date ? new Date(b.Event_Date).getTime() : 0;
        return dateA - dateB;
      },
    },
    {
      title: 'Venue',
      dataIndex: 'Venue',
      key: 'Venue',
    },
  ];

  const userClubTabs = userClubs.map(club => ({
    key: club.Club_ID.toString(),
    label: club.Club_Name,
    children: (
      <div>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={24}>
                <Card>
                  <h3>Club Information</h3>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <p><strong>Description:</strong> {club.Description || 'No description available'}</p>
                      <p><strong>Established:</strong> {new Date(club.Date_Established).toLocaleDateString()}</p>
                      <p><strong>Members:</strong> {club.Member_Count || 0}</p>
                    </Col>
                    {canViewBudget(club.Club_ID) && (
                      <Col xs={24} md={12}>
                        <div>
                          <h4><DollarOutlined /> Budget Summary</h4>
                          {clubBudgetSummary.length === 0 ? (
                            <p style={{ color: '#999' }}>No budget information available</p>
                          ) : (
                            <div>
                              {clubBudgetSummary.map((budget: any, index: number) => (
                                <div key={index} style={{ marginBottom: index < clubBudgetSummary.length - 1 ? 12 : 0 }}>
                                  <p><strong>Academic Year:</strong> {budget.Academic_Year}</p>
                                  <p><strong>Total Allocated:</strong> ${Number(budget.Total_Allocated || 0).toFixed(2)}</p>
                                  <p><strong>Total Spent:</strong> ${Number(budget.Total_Spent || 0).toFixed(2)}</p>
                                  <p>
                                    <strong>Remaining Budget:</strong>{' '}
                                    <Tag color={Number(budget.Remaining_Budget || 0) >= 0 ? 'green' : 'red'}>
                                      ${Number(budget.Remaining_Budget || 0).toFixed(2)}
                                    </Tag>
                                  </p>
                                  {index < clubBudgetSummary.length - 1 && <hr style={{ margin: '12px 0' }} />}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Col>
                    )}
                  </Row>
                </Card>
              </Col>
            </Row>
        
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card title={<><CalendarOutlined /> Upcoming Events</>}>
              {clubEvents.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                  No upcoming events scheduled
                </p>
              ) : (
                <Table
                  columns={eventColumns}
                  dataSource={clubEvents}
                  rowKey="Event_ID"
                  pagination={{ pageSize: 5 }}
                  size="small"
                />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={<><UserOutlined /> Active Members</>}>
              <Table
                columns={memberColumns}
                dataSource={clubMembers}
                rowKey="Membership_ID"
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </div>
    ),
  }));

  // Create tabs for all clubs (for admin) or user's clubs
  const allTabs = [];
  
  // Add "All Clubs" tab for viewing the list
  allTabs.push({
    key: 'all-clubs',
    label: isAdmin ? 'All Clubs' : 'Available Clubs',
    children: (
      <Card 
        extra={
          <Input
            placeholder="Search clubs..."
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        }
      >
        <Table
          columns={clubListColumns}
          dataSource={availableClubs}
          rowKey="Club_ID"
          loading={loading}
          pagination={{ pageSize: 10 }}
          onRow={(record) => ({
            onClick: () => isAdmin && handleClubRowClick(record),
            style: { cursor: isAdmin ? 'pointer' : 'default' }
          })}
        />
      </Card>
    ),
  });

  // Add tabs for all Active, Pending, and Inactive clubs (for admin)
  if (isAdmin) {
    const allStatusClubs = allClubs.filter(
      (club: Club) => club.STATUS === 'Active' || club.STATUS === 'Pending' || club.STATUS === 'Inactive'
    );
    allStatusClubs.forEach((club: Club) => {
      const isSelected = selectedClubForView?.Club_ID === club.Club_ID;
      allTabs.push({
        key: `club-${club.Club_ID}`,
        label: club.Club_Name,
        children: (
          <div>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={24}>
                <Card
                  extra={
                    (() => {
                      const statusOptions = getStatusChangeOptions(club.STATUS);
                      if (statusOptions.length === 0) return null;
                      
                      return (
                        <Space>
                          {statusOptions.map((option) => (
                            <Popconfirm
                              key={option.status}
                              title={`Are you sure you want to ${option.label.toLowerCase()} this club?`}
                              description={`This will change the club status to ${option.status}.`}
                              onConfirm={() => handleStatusChange(club.Club_ID, option.status)}
                              okText="Yes"
                              cancelText="No"
                            >
                              <Button
                                type={option.status === 'Active' ? 'primary' : 'default'}
                                danger={option.status === 'Inactive' && club.STATUS === 'Active'}
                                icon={option.status === 'Active' ? <CheckOutlined /> : <CloseOutlined />}
                                style={
                                  option.status === 'Active' && club.STATUS === 'Pending'
                                    ? { backgroundColor: '#52c41a', borderColor: '#52c41a' }
                                    : undefined
                                }
                              >
                                {option.label}
                              </Button>
                            </Popconfirm>
                          ))}
                        </Space>
                      );
                    })()
                  }
                >
                  <h3>Club Information</h3>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <p><strong>Description:</strong> {club.Description || 'No description available'}</p>
                      <p><strong>Established:</strong> {new Date(club.Date_Established).toLocaleDateString()}</p>
                      <p><strong>Status:</strong> 
                        <Tag 
                          color={
                            club.STATUS === 'Active' ? 'green' : 
                            club.STATUS === 'Pending' ? 'orange' : 
                            club.STATUS === 'Inactive' ? 'red' : 
                            'default'
                          } 
                          style={{ marginLeft: 8 }}
                        >
                          {club.STATUS}
                        </Tag>
                      </p>
                      <p><strong>Total Members:</strong> {club.Member_Count || 0}</p>
                    </Col>
                    {canViewBudget(club.Club_ID) && (
                      <Col xs={24} md={12}>
                        <div>
                          <h4><DollarOutlined /> Budget Summary</h4>
                          {isSelected ? (
                            clubBudgetSummary.length === 0 ? (
                              <p style={{ color: '#999' }}>No budget information available</p>
                            ) : (
                              <div>
                                {clubBudgetSummary.map((budget: any, index: number) => (
                                  <div key={index} style={{ marginBottom: index < clubBudgetSummary.length - 1 ? 12 : 0 }}>
                                    <p><strong>Academic Year:</strong> {budget.Academic_Year}</p>
                                    <p><strong>Total Allocated:</strong> ${Number(budget.Total_Allocated || 0).toFixed(2)}</p>
                                    <p><strong>Total Spent:</strong> ${Number(budget.Total_Spent || 0).toFixed(2)}</p>
                                    <p>
                                      <strong>Remaining Budget:</strong>{' '}
                                      <Tag color={Number(budget.Remaining_Budget || 0) >= 0 ? 'green' : 'red'}>
                                        ${Number(budget.Remaining_Budget || 0).toFixed(2)}
                                      </Tag>
                                    </p>
                                    {index < clubBudgetSummary.length - 1 && <hr style={{ margin: '12px 0' }} />}
                                  </div>
                                ))}
                              </div>
                            )
                          ) : (
                            <p style={{ color: '#999' }}>Click on this tab to view budget</p>
                          )}
                        </div>
                      </Col>
                    )}
                  </Row>
                </Card>
              </Col>
            </Row>
            
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} lg={12}>
                <Card title={<><CalendarOutlined /> Upcoming Events</>}>
                  {isSelected ? (
                    clubEvents.length === 0 ? (
                      <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                        No upcoming events scheduled
                      </p>
                    ) : (
                      <Table
                        columns={eventColumns}
                        dataSource={clubEvents}
                        rowKey="Event_ID"
                        pagination={{ pageSize: 5 }}
                        size="small"
                      />
                    )
                  ) : (
                    <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                      Click on this tab to view events
                    </p>
                  )}
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title={<><UserOutlined /> Active Members</>}>
                  {isSelected ? (
                    <Table
                      columns={memberColumns}
                      dataSource={clubMembers}
                      rowKey="Membership_ID"
                      pagination={{ pageSize: 5 }}
                      size="small"
                    />
                  ) : (
                    <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                      Click on this tab to view members
                    </p>
                  )}
                </Card>
              </Col>
            </Row>
          </div>
        ),
      });
    });
  }

  // Add tabs for user's clubs
  userClubTabs.forEach(tab => {
    allTabs.push(tab);
  });

  // Load data for first Active, Pending, or Inactive club when page loads (but keep "All Clubs" tab active)
  useEffect(() => {
    if (isAdmin && allClubs.length > 0 && !selectedClubForView) {
      const firstClub = allClubs.find(
        (club: Club) => club.STATUS === 'Active' || club.STATUS === 'Pending' || club.STATUS === 'Inactive'
      );
      if (firstClub) {
        // Pre-load data for the first club, but don't change the active tab
        setSelectedClubForView(firstClub);
        fetchClubMembers(firstClub.Club_ID);
        fetchClubEvents(firstClub.Club_ID);
        // Admin can always view budget
        if (isAdmin) {
          fetchClubBudgetSummary(firstClub.Club_ID);
        }
      }
    }
  }, [isAdmin, allClubs, selectedClubForView]);

  // Note: Tab switching is now handled directly in handleClubRowClick
  // This useEffect is removed to prevent auto-switching when pre-loading data

  // Update active tab when user selects their own club
  useEffect(() => {
    if (!isAdmin && selectedClubId && userClubs.length > 0) {
      setActiveTab(selectedClubId.toString());
    } else if (!isAdmin && userClubs.length > 0 && activeTab === 'all-clubs') {
      // Set first user club as active if no club is selected
      const firstClubId = userClubs[0]?.Club_ID;
      if (firstClubId) {
        setSelectedClubId(firstClubId);
        setActiveTab(firstClubId.toString());
      }
    }
  }, [selectedClubId, isAdmin, userClubs, activeTab]);

  return (
    <div>
      <h1>Clubs</h1>
      
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            // If switching to "all-clubs" tab, clear selected club
            if (key === 'all-clubs') {
              setSelectedClubForView(null);
              // Don't return early - let the tab switch happen
            } else if (!key.startsWith('club-')) {
              // If switching to a user club tab, update selectedClubId
              const clubId = Number(key);
              if (!isNaN(clubId)) {
                setSelectedClubId(clubId);
                fetchClubMembers(clubId);
                fetchClubEvents(clubId);
                // Only fetch budget if user has permission
                if (canViewBudget(clubId)) {
                  fetchClubBudgetSummary(clubId);
                }
              }
            } else if (key.startsWith('club-')) {
              // If switching to an admin club detail tab, fetch that club's data
              const clubId = Number(key.replace('club-', ''));
              const club = allClubs.find(c => c.Club_ID === clubId);
              if (club) {
                setSelectedClubForView(club);
                fetchClubMembers(clubId);
                fetchClubEvents(clubId);
                // Only fetch budget if user has permission
                if (canViewBudget(clubId)) {
                  fetchClubBudgetSummary(clubId);
                }
              }
            }
          }}
          items={allTabs}
        />
      </Card>

      {!isAdmin && userClubs.length === 0 && !loading && (
        <Card style={{ marginTop: 24 }}>
          <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
            You are not a member of any clubs yet. Request to join a club above!
          </p>
        </Card>
      )}
    </div>
  );
}
