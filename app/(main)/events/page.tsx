'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Button, Tag, Modal, Form, Input, DatePicker, Select, message } from 'antd';
import { PlusOutlined, CalendarOutlined, EnvironmentOutlined, TeamOutlined } from '@ant-design/icons';
import type { Event } from '@/lib/types';

export default function EventsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Sample data - in real app, fetch from API
  const [events, setEvents] = useState<Event[]>([
    {
      Event_ID: 7001,
      Club_ID: 3001,
      Event_Name: 'Fall Chess Tournament',
      Description: 'Annual chess competition',
      Event_Date: '2024-11-15',
      Venue: 'Student Center Room 101',
      Club_Name: 'Chess Club',
      Attendee_Count: 5,
    },
    {
      Event_ID: 7003,
      Club_ID: 3002,
      Event_Name: 'Robotics Showcase',
      Description: 'Display of student robot projects',
      Event_Date: '2024-12-01',
      Venue: 'Engineering Hall',
      Club_Name: 'Robotics Club',
      Attendee_Count: 4,
    },
    {
      Event_ID: 7005,
      Club_ID: 3003,
      Event_Name: 'Fall Play Performance',
      Description: 'Shakespearean drama production',
      Event_Date: '2024-11-20',
      Venue: 'University Theater',
      Club_Name: 'Drama Society',
      Attendee_Count: 4,
    },
  ]);

  const getEventStatus = (eventDate: string | null): 'upcoming' | 'completed' => {
    if (!eventDate) return 'upcoming';
    const today = new Date();
    const event = new Date(eventDate);
    return event > today ? 'upcoming' : 'completed';
  };

  const getStatusColor = (eventDate: string | null) => {
    const status = getEventStatus(eventDate);
    return status === 'upcoming' ? 'blue' : 'default';
  };

  const handleAddEvent = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      const newEvent: Event = {
        Event_ID: Math.max(...events.map(e => e.Event_ID)) + 1,
        Club_ID: values.Club_ID,
        Event_Name: values.Event_Name,
        Description: values.Description,
        Event_Date: values.Event_Date.format('YYYY-MM-DD'),
        Venue: values.Venue,
        Club_Name: 'Selected Club', // In real app, get from Club_ID
        Attendee_Count: 0,
      };
      setEvents([...events, newEvent]);
      message.success('Event created successfully');
      form.resetFields();
      setIsModalOpen(false);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>Events</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddEvent} size="large">
          Create Event
        </Button>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <Row gutter={[16, 16]}>
          {events.map((event) => (
            <Col key={event.Event_ID} xs={24} sm={12} lg={8}>
            <Card
              title={event.Event_Name}
              extra={
                <Tag color={getStatusColor(event.Event_Date)}>
                  {getEventStatus(event.Event_Date).toUpperCase()}
                </Tag>
              }
              hoverable
            >
              <p>{event.Description || 'No description available'}</p>
              <div style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 8 }}>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  <span>{event.Event_Date || 'TBD'}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <EnvironmentOutlined style={{ marginRight: 8 }} />
                  <span>{event.Venue || 'TBD'}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <TeamOutlined style={{ marginRight: 8 }} />
                  <span>{event.Attendee_Count || 0} attendees</span>
                </div>
                <div>
                  <strong>Club:</strong> {event.Club_Name}
                </div>
              </div>
              <Button type="link" style={{ marginTop: 16, padding: 0 }}>
                View Details
              </Button>
            </Card>
          </Col>
        ))}
        </Row>
      </div>

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
              <Select.Option value={3001}>Chess Club</Select.Option>
              <Select.Option value={3002}>Robotics Club</Select.Option>
              <Select.Option value={3003}>Drama Society</Select.Option>
              <Select.Option value={3004}>Photography Club</Select.Option>
              <Select.Option value={3005}>Debate Team</Select.Option>
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
            <Input.TextArea rows={3} placeholder="Enter event description" />
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
    </div>
  );
}
