'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Button, Tag, Modal, Form, Input, DatePicker, Select, message, Tabs, Spin, Descriptions, Table, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, CalendarOutlined, EnvironmentOutlined, TeamOutlined, UserOutlined, EditOutlined, UserAddOutlined, DownloadOutlined } from '@ant-design/icons';
import type { Event } from '@/lib/types';
import api from '@/lib/api';
import dayjs from 'dayjs';
import { exportAttendanceToCSV } from '@/lib/csvExport';

const { TabPane } = Tabs;

interface Attendee {
  Attendance_ID: number;
  Person_ID: number;
  Check_In_Time: string;
  First_Name: string;
  Last_Name: string;
  Email: string;
  Person_Type: string;
}

export default function EventsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEventDetailModalOpen, setIsEventDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<number | undefined>(undefined);
  const [addingAttendee, setAddingAttendee] = useState(false);
  const [attendeeType, setAttendeeType] = useState<'user' | 'guest'>('user');
  const [guestForm] = Form.useForm();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [userMemberships, setUserMemberships] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [canCreateEvent, setCanCreateEvent] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      if (response.data?.status === 'success' && response.data?.data) {
        setEvents(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching events:', error);
      message.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserMemberships = useCallback(async () => {
    try {
      const userData = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem('user') || '{}')
        : {};
      const userId = userData.Person_ID || userData.personId;
      
      if (userId) {
        // Fetch memberships to check Club Leader status
        const membershipResponse = await api.get(`/memberships?personId=${userId}&status=Active`);
        if (membershipResponse.data?.status === 'success' && membershipResponse.data?.data) {
          const memberships = membershipResponse.data.data || [];
          setUserMemberships(memberships);
          
          // Filter to only show clubs where user is a Club Leader
          const leaderMemberships = memberships.filter((m: any) => 
            m.Role === 'Club Leader' && m.Status === 'Active'
          );
          
          if (leaderMemberships.length > 0) {
            // Fetch club details for clubs where user is a leader
            const clubIds = leaderMemberships.map((m: any) => m.Club_ID);
            const clubPromises = clubIds.map((clubId: number) => api.get(`/clubs/${clubId}`));
            const clubResponses = await Promise.all(clubPromises);
            
            const leaderClubs = clubResponses
              .map((response: any) => response.data?.data)
              .filter((club: any) => club != null && club.STATUS === 'Active'); // Only show Active clubs
            
            setClubs(leaderClubs);
            setCanCreateEvent(leaderClubs.length > 0);
          } else {
            setClubs([]);
            setCanCreateEvent(false);
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching user memberships:', error);
      setClubs([]);
      setCanCreateEvent(false);
    }
  }, []);

  useEffect(() => {
    // Get user from localStorage
    const userData = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('user') || '{}')
      : {};
    setUser(userData);
    
    // All users can view events, but only Club Leaders can create events
    fetchEvents();
    fetchUserMemberships(); // Always fetch user memberships to check if they're a Club Leader
  }, [fetchEvents, fetchUserMemberships]);

  const getEventStatus = (eventDate: string | null): 'upcoming' | 'past' => {
    if (!eventDate) return 'upcoming';
    const today = dayjs().startOf('day');
    const event = dayjs(eventDate).startOf('day');
    return event.isAfter(today) || event.isSame(today) ? 'upcoming' : 'past';
  };

  const getStatusColor = (eventDate: string | null) => {
    const status = getEventStatus(eventDate);
    return status === 'upcoming' ? 'blue' : 'default';
  };

  const upcomingEvents = events.filter(e => getEventStatus(e.Event_Date) === 'upcoming');
  const pastEvents = events.filter(e => getEventStatus(e.Event_Date) === 'past');

  // Check if user can edit an event (must be Club Leader of that club)
  const canEditEvent = (event: Event) => {
    const membership = userMemberships.find(
      (m: any) => m.Club_ID === event.Club_ID && m.Role === 'Club Leader' && m.Status === 'Active'
    );
    return !!membership;
  };

  // Check if user can add attendees (Admin or Club Leader of that club)
  const canAddAttendees = (event: Event) => {
    const userRole = user?.Role_Name || user?.role;
    if (userRole === 'Admin') {
      return true;
    }
    const membership = userMemberships.find(
      (m: any) => m.Club_ID === event.Club_ID && m.Role === 'Club Leader' && m.Status === 'Active'
    );
    return !!membership;
  };

  // Check if user is admin
  const isAdmin = () => {
    const userRole = user?.Role_Name || user?.role;
    return userRole === 'Admin';
  };

  // Handle CSV export
  const handleExportAttendance = () => {
    if (!selectedEvent || attendees.length === 0) {
      message.warning('No attendance data to export');
      return;
    }
    
    try {
      exportAttendanceToCSV(attendees, selectedEvent.Event_Name, selectedEvent.Event_Date);
      message.success('Attendance list exported successfully');
    } catch (error) {
      console.error('Error exporting attendance:', error);
      message.error('Failed to export attendance list');
    }
  };

  const handleAddEvent = () => {
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setEditingEvent(event);
    editForm.setFieldsValue({
      Event_Name: event.Event_Name,
      Description: event.Description,
      Event_Date: event.Event_Date ? dayjs(event.Event_Date) : null,
      Venue: event.Venue,
    });
    setIsEditModalOpen(true);
  };

  const handleEditOk = async () => {
    try {
      if (!editingEvent) return;
      
      const values = await editForm.validateFields();
      const eventData = {
        eventName: values.Event_Name,
        description: values.Description,
        eventDate: values.Event_Date.format('YYYY-MM-DD'),
        venue: values.Venue,
      };
      
      await api.put(`/events/${editingEvent.Event_ID}`, eventData);
      message.success('Event updated successfully');
      editForm.resetFields();
      setIsEditModalOpen(false);
      setEditingEvent(null);
      fetchEvents(); // Refresh events list
    } catch (error: any) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Failed to update event');
      }
    }
  };

  const handleEditCancel = () => {
    editForm.resetFields();
    setIsEditModalOpen(false);
    setEditingEvent(null);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Check if selected club is inactive
      const selectedClub = clubs.find((c: any) => c.Club_ID === values.Club_ID);
      if (selectedClub && selectedClub.STATUS === 'Inactive') {
        message.error('Cannot create events for inactive clubs');
        return;
      }
      
      const eventData = {
        clubId: values.Club_ID,
        eventName: values.Event_Name,
        description: values.Description,
        eventDate: values.Event_Date.format('YYYY-MM-DD'),
        venue: values.Venue,
      };
      
      await api.post('/events', eventData);
      message.success('Event created successfully');
      form.resetFields();
      setIsModalOpen(false);
      fetchEvents(); // Refresh events list
    } catch (error: any) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Failed to create event');
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const isEventToday = (eventDate: string | null): boolean => {
    if (!eventDate) return false;
    const today = dayjs().startOf('day');
    const event = dayjs(eventDate).startOf('day');
    return event.isSame(today);
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get('/members');
      if (response.data?.status === 'success' && response.data?.data) {
        setAllUsers(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const handleAddAttendee = async () => {
    if (!selectedEvent) {
      return;
    }

    if (attendeeType === 'user') {
      if (!selectedPersonId) {
        message.warning('Please select a person to add');
        return;
      }

      // Check if person is already an attendee
      const isAlreadyAttendee = attendees.some(a => a.Person_ID === selectedPersonId);
      if (isAlreadyAttendee) {
        message.warning('This person is already registered as an attendee');
        return;
      }

      try {
        setAddingAttendee(true);
        await api.post(`/events/${selectedEvent.Event_ID}/attendees`, {
          personId: selectedPersonId
        });
        message.success('Attendee added successfully');
        setSelectedPersonId(undefined);
        
        // Refresh attendees list
        const response = await api.get(`/events/${selectedEvent.Event_ID}/attendees`);
        if (response.data?.status === 'success' && response.data?.data) {
          setAttendees(response.data.data);
        }
      } catch (error: any) {
        if (error.response?.data?.message) {
          message.error(error.response.data.message);
        } else {
          message.error('Failed to add attendee');
        }
      } finally {
        setAddingAttendee(false);
      }
    } else {
      // Guest type - validate and create guest first
      try {
        const values = await guestForm.validateFields();
        setAddingAttendee(true);

        // Create guest
        const guestResponse = await api.post('/guests', {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          organization: values.organization
        });

        if (guestResponse.data?.status === 'success' && guestResponse.data?.data) {
          const guestPersonId = guestResponse.data.data.Person_ID;

          // Add guest as attendee
          await api.post(`/events/${selectedEvent.Event_ID}/attendees`, {
            personId: guestPersonId
          });

          message.success('Guest attendee added successfully');
          guestForm.resetFields();
          
          // Refresh attendees list
          const response = await api.get(`/events/${selectedEvent.Event_ID}/attendees`);
          if (response.data?.status === 'success' && response.data?.data) {
            setAttendees(response.data.data);
          }
        }
      } catch (error: any) {
        if (error.response?.data?.message) {
          message.error(error.response.data.message);
        } else {
          message.error('Failed to add guest attendee');
        }
      } finally {
        setAddingAttendee(false);
      }
    }
  };

  const handleEventClick = async (event: Event) => {
    setSelectedEvent(event);
    setIsEventDetailModalOpen(true);
    setSelectedPersonId(undefined);
    setAttendeeType('user');
    guestForm.resetFields();
    
    // Fetch attendees for this event
    try {
      setLoadingAttendees(true);
      const response = await api.get(`/events/${event.Event_ID}/attendees`);
      if (response.data?.status === 'success' && response.data?.data) {
        setAttendees(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching attendees:', error);
      setAttendees([]);
    } finally {
      setLoadingAttendees(false);
    }

    // Fetch users if it's the event day
    if (isEventToday(event.Event_Date)) {
      fetchUsers();
    }
  };

  const handleEventDetailModalClose = () => {
    setIsEventDetailModalOpen(false);
    setSelectedEvent(null);
    setAttendees([]);
  };

  if (loading && events.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>Events</h1>
        {canCreateEvent && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddEvent} size="large">
            Create Event
          </Button>
        )}
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={`Upcoming Events (${upcomingEvents.length})`} key="upcoming">
          <div style={{ flex: 1, overflow: 'auto', marginTop: 16 }}>
            {upcomingEvents.length === 0 ? (
              <Card>
                <p style={{ textAlign: 'center', color: '#999' }}>No upcoming events</p>
              </Card>
            ) : (
              <Row gutter={[16, 16]}>
                {upcomingEvents.map((event) => (
                  <Col key={event.Event_ID} xs={24} sm={12} lg={8}>
                    <Card
                      title={event.Event_Name}
                      extra={
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <Tag color={getStatusColor(event.Event_Date)}>
                            {getEventStatus(event.Event_Date).toUpperCase()}
                          </Tag>
                          {canEditEvent(event) && (
                            <Button
                              type="text"
                              icon={<EditOutlined />}
                              size="small"
                              onClick={(e) => handleEditEvent(event, e)}
                              title="Edit Event"
                            />
                          )}
                        </div>
                      }
                      hoverable
                      onClick={() => handleEventClick(event)}
                      style={{ cursor: 'pointer' }}
                    >
                      <p>{event.Description || 'No description available'}</p>
                      <div style={{ marginTop: 16 }}>
                        <div style={{ marginBottom: 8 }}>
                          <CalendarOutlined style={{ marginRight: 8 }} />
                          <span>{event.Event_Date ? dayjs(event.Event_Date).format('MMM DD, YYYY') : 'TBD'}</span>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <EnvironmentOutlined style={{ marginRight: 8 }} />
                          <span>{event.Venue || 'TBD'}</span>
                        </div>
                        <div>
                          <strong>Club:</strong> {event.Club_Name}
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </TabPane>
        <TabPane tab={`Past Events (${pastEvents.length})`} key="past">
          <div style={{ flex: 1, overflow: 'auto', marginTop: 16 }}>
            {pastEvents.length === 0 ? (
              <Card>
                <p style={{ textAlign: 'center', color: '#999' }}>No past events</p>
              </Card>
            ) : (
              <Row gutter={[16, 16]}>
                {pastEvents.map((event) => (
                  <Col key={event.Event_ID} xs={24} sm={12} lg={8}>
                    <Card
                      title={event.Event_Name}
                      extra={
                        <Tag color={getStatusColor(event.Event_Date)}>
                          {getEventStatus(event.Event_Date).toUpperCase()}
                        </Tag>
                      }
                      hoverable
                      onClick={() => handleEventClick(event)}
                      style={{ cursor: 'pointer' }}
                    >
                      <p>{event.Description || 'No description available'}</p>
                      <div style={{ marginTop: 16 }}>
                        <div style={{ marginBottom: 8 }}>
                          <CalendarOutlined style={{ marginRight: 8 }} />
                          <span>{event.Event_Date ? dayjs(event.Event_Date).format('MMM DD, YYYY') : 'TBD'}</span>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          <EnvironmentOutlined style={{ marginRight: 8 }} />
                          <span>{event.Venue || 'TBD'}</span>
                        </div>
                        <div>
                          <strong>Club:</strong> {event.Club_Name}
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </TabPane>
      </Tabs>

      <Modal
        title="Create New Event"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Create"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="Club_ID"
            label="Club"
            rules={[{ required: true, message: 'Please select a club' }]}
          >
            <Select placeholder="Select a club">
              {clubs.map((club) => (
                <Select.Option key={club.Club_ID} value={club.Club_ID}>
                  {club.Club_Name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="Event_Name"
            label="Event Name"
            rules={[{ required: true, message: 'Please enter event name' }]}
          >
            <Input placeholder="Enter event name" />
          </Form.Item>
          <Form.Item
            name="Description"
            label="Description"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Enter event description. Please include start date, end date, and time (e.g., Start: Nov 15, 2024 at 2:00 PM, End: Nov 15, 2024 at 5:00 PM)" 
            />
          </Form.Item>
          <Form.Item
            name="Event_Date"
            label="Date"
            rules={[{ required: true, message: 'Please select event date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="Venue"
            label="Venue"
            rules={[{ required: true, message: 'Please enter venue' }]}
          >
            <Input placeholder="Enter event venue" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Event"
        open={isEditModalOpen}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
        okText="Update"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="Event_Name"
            label="Event Name"
            rules={[{ required: true, message: 'Please enter event name' }]}
          >
            <Input placeholder="Enter event name" />
          </Form.Item>
          <Form.Item
            name="Description"
            label="Description"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Enter event description. Please include start date, end date, and time (e.g., Start: Nov 15, 2024 at 2:00 PM, End: Nov 15, 2024 at 5:00 PM)" 
            />
          </Form.Item>
          <Form.Item
            name="Event_Date"
            label="Date"
            rules={[{ required: true, message: 'Please select event date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="Venue"
            label="Venue"
            rules={[{ required: true, message: 'Please enter venue' }]}
          >
            <Input placeholder="Enter event venue" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={selectedEvent?.Event_Name || 'Event Details'}
        open={isEventDetailModalOpen}
        onCancel={handleEventDetailModalClose}
        footer={[
          <Button key="close" onClick={handleEventDetailModalClose}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedEvent && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Event Name">
                {selectedEvent.Event_Name}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedEvent.Description || 'No description available'}
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {selectedEvent.Event_Date ? dayjs(selectedEvent.Event_Date).format('MMMM DD, YYYY') : 'TBD'}
              </Descriptions.Item>
              <Descriptions.Item label="Venue">
                {selectedEvent.Venue || 'TBD'}
              </Descriptions.Item>
              <Descriptions.Item label="Club">
                {selectedEvent.Club_Name}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedEvent.Event_Date)}>
                  {getEventStatus(selectedEvent.Event_Date).toUpperCase()}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            
            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0 }}>
                  <TeamOutlined style={{ marginRight: 8 }} />
                  Attendees ({attendees.length})
                </h3>
                {isAdmin() && attendees.length > 0 && (
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleExportAttendance}
                  >
                    Export Attendance
                  </Button>
                )}
                {selectedEvent && isEventToday(selectedEvent.Event_Date) && canAddAttendees(selectedEvent) && (
                  <div>
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      <div>
                        <label style={{ marginRight: 8, fontWeight: 500 }}>Add as:</label>
                        <Select
                          value={attendeeType}
                          onChange={setAttendeeType}
                          style={{ width: 150 }}
                        >
                          <Select.Option value="user">User</Select.Option>
                          <Select.Option value="guest">Guest</Select.Option>
                        </Select>
                      </div>
                      
                      {attendeeType === 'user' ? (
                        <Space>
                          <Select
                            showSearch
                            placeholder="Search and select person"
                            style={{ width: 250 }}
                            value={selectedPersonId}
                            onChange={setSelectedPersonId}
                            filterOption={(input, option) => {
                              const label = option?.label?.toString().toLowerCase() || '';
                              return label.includes(input.toLowerCase());
                            }}
                            loading={loadingUsers}
                            notFoundContent={loadingUsers ? <Spin size="small" /> : 'No users found'}
                          >
                            {allUsers
                              .filter(user => !attendees.some(a => a.Person_ID === user.Person_ID))
                              .map((user) => (
                                <Select.Option 
                                  key={user.Person_ID} 
                                  value={user.Person_ID}
                                  label={`${user.First_Name} ${user.Last_Name} (${user.Email})`}
                                >
                                  {user.First_Name} {user.Last_Name} ({user.Email})
                                </Select.Option>
                              ))}
                          </Select>
                          <Button
                            type="primary"
                            icon={<UserAddOutlined />}
                            onClick={handleAddAttendee}
                            loading={addingAttendee}
                            disabled={!selectedPersonId}
                          >
                            Add Attendee
                          </Button>
                        </Space>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          <Form form={guestForm} layout="vertical" onFinish={handleAddAttendee}>
                            <Form.Item
                              name="firstName"
                              label="First Name"
                              rules={[{ required: true, message: 'Required' }]}
                            >
                              <Input placeholder="First Name" />
                            </Form.Item>
                            <Form.Item
                              name="lastName"
                              label="Last Name"
                              rules={[{ required: true, message: 'Required' }]}
                            >
                              <Input placeholder="Last Name" />
                            </Form.Item>
                            <Form.Item
                              name="email"
                              label="Email"
                              rules={[
                                { required: true, message: 'Required' },
                                { type: 'email', message: 'Invalid email' }
                              ]}
                            >
                              <Input placeholder="Email" />
                            </Form.Item>
                            <Form.Item
                              name="phone"
                              label="Phone"
                            >
                              <Input placeholder="Phone (optional)" />
                            </Form.Item>
                            <Form.Item
                              name="organization"
                              label="Organization"
                            >
                              <Input placeholder="Organization (optional)" />
                            </Form.Item>
                            <Form.Item>
                              <Button
                                type="primary"
                                icon={<UserAddOutlined />}
                                htmlType="submit"
                                loading={addingAttendee}
                                block
                              >
                                Add Guest
                              </Button>
                            </Form.Item>
                          </Form>
                        </div>
                      )}
                    </Space>
                  </div>
                )}
              </div>
              {loadingAttendees ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin />
                </div>
              ) : attendees.length === 0 ? (
                <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                  No attendees registered yet
                </p>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <Table
                    dataSource={attendees}
                    columns={[
                      {
                        title: 'Name',
                        dataIndex: 'First_Name',
                        key: 'name',
                        render: (_, record) => `${record.First_Name} ${record.Last_Name}`,
                        sorter: (a, b) => {
                          const nameA = `${a.First_Name} ${a.Last_Name}`.toLowerCase();
                          const nameB = `${b.First_Name} ${b.Last_Name}`.toLowerCase();
                          return nameA.localeCompare(nameB);
                        },
                        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                          <div style={{ padding: 8 }}>
                            <Input
                              placeholder="Search name"
                              value={selectedKeys[0]}
                              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                              onPressEnter={() => confirm()}
                              style={{ marginBottom: 8, display: 'block' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Button
                                type="primary"
                                onClick={() => confirm()}
                                size="small"
                                style={{ width: 90 }}
                              >
                                Search
                              </Button>
                              <Button
                                onClick={() => {
                                  clearFilters?.();
                                  confirm();
                                }}
                                size="small"
                                style={{ width: 90 }}
                              >
                                Reset
                              </Button>
                            </div>
                          </div>
                        ),
                        onFilter: (value, record) => {
                          const fullName = `${record.First_Name} ${record.Last_Name}`.toLowerCase();
                          return fullName.includes((value as string).toLowerCase());
                        },
                      },
                      {
                        title: 'Email',
                        dataIndex: 'Email',
                        key: 'email',
                        sorter: (a, b) => a.Email.localeCompare(b.Email),
                        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                          <div style={{ padding: 8 }}>
                            <Input
                              placeholder="Search email"
                              value={selectedKeys[0]}
                              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                              onPressEnter={() => confirm()}
                              style={{ marginBottom: 8, display: 'block' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Button
                                type="primary"
                                onClick={() => confirm()}
                                size="small"
                                style={{ width: 90 }}
                              >
                                Search
                              </Button>
                              <Button
                                onClick={() => {
                                  clearFilters?.();
                                  confirm();
                                }}
                                size="small"
                                style={{ width: 90 }}
                              >
                                Reset
                              </Button>
                            </div>
                          </div>
                        ),
                        onFilter: (value, record) =>
                          record.Email.toLowerCase().includes((value as string).toLowerCase()),
                      },
                      {
                        title: 'Check in Time',
                        dataIndex: 'Check_In_Time',
                        key: 'checkInTime',
                        render: (time: string) => dayjs(time).format('MMM DD, YYYY h:mm A'),
                        sorter: (a, b) => {
                          const timeA = dayjs(a.Check_In_Time).valueOf();
                          const timeB = dayjs(b.Check_In_Time).valueOf();
                          return timeA - timeB;
                        },
                        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                          <div style={{ padding: 8 }}>
                            <Input
                              placeholder="Search date (e.g., Nov 15)"
                              value={selectedKeys[0]}
                              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                              onPressEnter={() => confirm()}
                              style={{ marginBottom: 8, display: 'block' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Button
                                type="primary"
                                onClick={() => confirm()}
                                size="small"
                                style={{ width: 90 }}
                              >
                                Search
                              </Button>
                              <Button
                                onClick={() => {
                                  clearFilters?.();
                                  confirm();
                                }}
                                size="small"
                                style={{ width: 90 }}
                              >
                                Reset
                              </Button>
                            </div>
                          </div>
                        ),
                        onFilter: (value, record) => {
                          const formattedTime = dayjs(record.Check_In_Time).format('MMM DD, YYYY h:mm A');
                          return formattedTime.toLowerCase().includes((value as string).toLowerCase());
                        },
                      },
                    ]}
                    rowKey="Attendance_ID"
                    pagination={{ pageSize: 5 }}
                    size="small"
                    scroll={{ y: 300 }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
