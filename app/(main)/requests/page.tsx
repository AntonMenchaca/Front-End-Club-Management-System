'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, Table, Button, Space, Tag, message, Popconfirm, Select, Row, Col, Modal, Form, Input, InputNumber, DatePicker } from 'antd';
import { CheckOutlined, CloseOutlined, DollarOutlined, TeamOutlined, BankOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Expenditure, ClubMembership, Club } from '@/lib/types';
import api from '@/lib/api';

export default function RequestsPage() {
  const [loading, setLoading] = useState(false);
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [memberships, setMemberships] = useState<ClubMembership[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [activeTab, setActiveTab] = useState('expenditures');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClubLeader, setIsClubLeader] = useState(false);
  const [expenditureClubFilter, setExpenditureClubFilter] = useState<number | undefined>(undefined);
  const [expenditureStatusFilter, setExpenditureStatusFilter] = useState<string>('Pending');
  const [isCreateExpenditureModalOpen, setIsCreateExpenditureModalOpen] = useState(false);
  const [createExpenditureForm] = Form.useForm();
  const [leaderClubs, setLeaderClubs] = useState<Club[]>([]);
  const [selectedClubForExpenditure, setSelectedClubForExpenditure] = useState<number | undefined>(undefined);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<any | null>(null);

  useEffect(() => {
    // Get user info
    const userData = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('user') || '{}')
      : {};
    
    const userRole = userData.Role_Name || userData.role;
    setIsAdmin(userRole === 'Admin');
    
    // Check if user is a club leader (we'll check this via API)
    checkClubLeaderStatus(userData);

    // Fetch requests
    fetchExpenditures();
    fetchMemberships();
    if (userRole === 'Admin') {
      fetchClubs();
      fetchAllClubs();
    }
  }, []);

  const fetchAllClubs = async () => {
    try {
      const response = await api.get('/clubs');
      if (response.data?.status === 'success') {
        setAllClubs(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching clubs:', error);
    }
  };

  const checkClubLeaderStatus = async (userData: any) => {
    try {
      const personId = userData.Person_ID || userData.personId;
      if (!personId) return;
      
      // Fetch user's memberships to check if they are a club leader
      const response = await api.get(`/memberships?personId=${personId}`);
      if (response.data?.status === 'success') {
        const memberships = response.data.data || [];
        const hasLeaderRole = memberships.some((m: ClubMembership) => 
          m.Role === 'Club Leader' && m.Status === 'Active'
        );
        setIsClubLeader(hasLeaderRole);
        
        // If user is a club leader, fetch their clubs
        if (hasLeaderRole) {
          const leaderMemberships = memberships.filter((m: ClubMembership) => 
            m.Role === 'Club Leader' && m.Status === 'Active'
          );
          
          // Fetch club details for each club they lead
          const clubPromises = leaderMemberships.map((m: ClubMembership) =>
            api.get(`/clubs/${m.Club_ID}`)
          );
          
          const clubResponses = await Promise.all(clubPromises);
          const clubs = clubResponses
            .filter(res => res.data?.status === 'success' && res.data?.data)
            .map(res => res.data.data);
          setLeaderClubs(clubs);
        }
      }
    } catch (error) {
      console.error('Error checking club leader status:', error);
      // If error, assume not a club leader
      setIsClubLeader(false);
    }
  };

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

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/requests/clubs');
      if (response.data?.status === 'success') {
        setClubs(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching club requests:', error);
      message.error(error.response?.data?.message || 'Failed to fetch club requests');
    } finally {
      setLoading(false);
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

  const handleApproveClub = async (id: number) => {
    try {
      const response = await api.put(`/requests/clubs/${id}`, { status: 'Active' });
      if (response.data?.status === 'success') {
        message.success('Club request approved successfully! The creator is now a Club Leader.');
        fetchClubs();
      }
    } catch (error: any) {
      console.error('Error approving club:', error);
      message.error(error.response?.data?.message || 'Failed to approve club request');
    }
  };

  const handleRejectClub = async (id: number) => {
    try {
      const response = await api.put(`/requests/clubs/${id}`, { status: 'Inactive' });
      if (response.data?.status === 'success') {
        message.success('Club request rejected');
        fetchClubs();
      }
    } catch (error: any) {
      console.error('Error rejecting club:', error);
      message.error(error.response?.data?.message || 'Failed to reject club request');
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
      render: (_, record) => {
        // Only Admin can approve/deny expenditure requests
        // Only show actions for Pending status
        if (!isAdmin) {
          return <Tag color="default">View Only</Tag>;
        }
        
        // Only show actions for Pending status
        if (record.Status !== 'Pending') {
          return <Tag color="default">No Actions</Tag>;
        }
        
        return (
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
        );
      },
    },
  ];

  // Filter expenditures based on selected filters (Admin only)
  const filteredExpenditures = isAdmin ? expenditures.filter(exp => {
    // Filter by club
    if (expenditureClubFilter !== undefined && exp.Club_ID !== expenditureClubFilter) {
      return false;
    }
    // Filter by status
    if (expenditureStatusFilter && expenditureStatusFilter !== 'All' && exp.Status !== expenditureStatusFilter) {
      return false;
    }
    return true;
  }) : expenditures;

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
      render: (_, record) => {
        // Admin and Club Leaders can approve/deny membership requests
        // (Club Leaders can only see requests for their clubs, which is handled by backend)
        if (!isAdmin && !isClubLeader) {
          return <Tag color="default">View Only</Tag>;
        }
        
        return (
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
        );
      },
    },
  ];

  const clubColumns: ColumnsType<Club> = [
    {
      title: 'ID',
      dataIndex: 'Club_ID',
      key: 'Club_ID',
      width: 80,
    },
    {
      title: 'Club Name',
      dataIndex: 'Club_Name',
      key: 'Club_Name',
      render: (name: string) => <Tag color="blue">{name}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'Description',
      key: 'Description',
      ellipsis: true,
    },
    {
      title: 'Creator',
      key: 'creator',
      render: (_, record) => 
        record.Creator_First_Name && record.Creator_Last_Name
          ? `${record.Creator_First_Name} ${record.Creator_Last_Name}`
          : 'Unknown',
    },
    {
      title: 'Date Established',
      dataIndex: 'Date_Established',
      key: 'Date_Established',
      render: (date: string) => <Tag color="blue">{new Date(date).toLocaleDateString()}</Tag>,
      sorter: (a, b) => new Date(a.Date_Established).getTime() - new Date(b.Date_Established).getTime(),
    },
    {
      title: 'Status',
      dataIndex: 'STATUS',
      key: 'STATUS',
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
      render: (_, record) => {
        // Only Admin can approve/reject club requests
        if (!isAdmin) {
          return <Tag color="default">View Only</Tag>;
        }
        
        return (
          <Space direction="vertical">
            <Popconfirm
              title="Approve this club request?"
              description="This will activate the club and make the creator a Club Leader."
              onConfirm={() => handleApproveClub(record.Club_ID)}
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
              title="Reject this club request?"
              onConfirm={() => handleRejectClub(record.Club_ID)}
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
        );
      },
    },
  ];

  const handleCreateExpenditure = async () => {
    setIsCreateExpenditureModalOpen(true);
    createExpenditureForm.resetFields();
    setSelectedClubForExpenditure(undefined);
    setBudgets([]);
    setSelectedBudget(null);
    
    // If admin and allClubs is empty, fetch all clubs
    if (isAdmin && allClubs.length === 0) {
      await fetchAllClubs();
    }
  };

  const handleClubChangeForExpenditure = async (clubId: number) => {
    setSelectedClubForExpenditure(clubId);
    createExpenditureForm.setFieldsValue({ Budget_ID: undefined, amount: undefined });
    setSelectedBudget(null);
    
    // Check if club is inactive
    const allClubsList = isAdmin ? allClubs : leaderClubs;
    const selectedClub = allClubsList.find(c => c.Club_ID === clubId);
    if (selectedClub && selectedClub.STATUS === 'Inactive') {
      message.error('Cannot create expenditures for inactive clubs');
      setSelectedClubForExpenditure(undefined);
      createExpenditureForm.setFieldsValue({ Club_ID: undefined });
      return;
    }
    
    // Fetch budgets for this club
    try {
      const response = await api.get(`/budgets?clubId=${clubId}`);
      if (response.data?.status === 'success') {
        setBudgets(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching budgets:', error);
      message.error('Failed to fetch budgets for this club');
    }
  };

  const handleBudgetChangeForExpenditure = (budgetId: number) => {
    const budget = budgets.find(b => b.Budget_ID === budgetId);
    setSelectedBudget(budget || null);
    createExpenditureForm.setFieldsValue({ amount: undefined }); // Reset amount when budget changes
  };

  const handleCreateExpenditureSubmit = async (values: any) => {
    try {
      // Validate amount doesn't exceed remaining balance
      const remainingBalance = Number(selectedBudget?.Remaining || 0);
      if (selectedBudget && values.amount > remainingBalance) {
        message.error(`Amount cannot exceed the remaining budget balance of $${remainingBalance.toFixed(2)}`);
        return;
      }
      
      const expenditureData = {
        expenseDescription: values.expenseDescription,
        amount: values.amount,
        requestExpenseDate: values.requestExpenseDate.format('YYYY-MM-DD'),
        status: 'Pending' // Always Pending for Club Leaders
      };
      
      await api.post(`/budgets/${values.Budget_ID}/expenditures`, expenditureData);
      message.success('Expenditure request created successfully');
      createExpenditureForm.resetFields();
      setIsCreateExpenditureModalOpen(false);
      setSelectedClubForExpenditure(undefined);
      setBudgets([]);
      setSelectedBudget(null);
      fetchExpenditures(); // Refresh the list
    } catch (error: any) {
      console.error('Error creating expenditure request:', error);
      message.error(error.response?.data?.message || 'Failed to create expenditure request');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>Requests Dashboard</h1>
          <p style={{ color: '#666', marginTop: 8, marginBottom: 0 }}>
            {isAdmin 
              ? 'Review and manage all expenditure, membership, and club requests'
              : isClubLeader
              ? 'Review expenditure and membership requests for clubs you lead'
              : 'View your requests'}
          </p>
        </div>
        {(isAdmin || isClubLeader) && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreateExpenditure}
          >
            Create Expenditure Request
          </Button>
        )}
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'expenditures',
            label: (
              <span>
                <DollarOutlined /> Expenditures ({isAdmin ? filteredExpenditures.length : expenditures.length})
              </span>
            ),
            children: (
              <div>
                {isAdmin && (
                  <div style={{ marginBottom: 16 }}>
                    <Row gutter={16} align="middle">
                      <Col>
                        <label style={{ marginRight: 8, fontWeight: 500 }}>Filter by Club:</label>
                        <Select
                          placeholder="All Clubs"
                          style={{ width: 200 }}
                          allowClear
                          value={expenditureClubFilter}
                          onChange={(value) => setExpenditureClubFilter(value)}
                        >
                          {allClubs.map(club => (
                            <Select.Option key={club.Club_ID} value={club.Club_ID}>
                              {club.Club_Name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Col>
                      <Col>
                        <label style={{ marginRight: 8, fontWeight: 500 }}>Filter by Status:</label>
                        <Select
                          placeholder="Select Status"
                          style={{ width: 200 }}
                          value={expenditureStatusFilter}
                          onChange={(value) => setExpenditureStatusFilter(value)}
                        >
                          <Select.Option value="All">All Statuses</Select.Option>
                          <Select.Option value="Pending">Pending</Select.Option>
                          <Select.Option value="Approved">Approved</Select.Option>
                          <Select.Option value="Rejected">Rejected</Select.Option>
                        </Select>
                      </Col>
                    </Row>
                  </div>
                )}
                <Table
                  style={{ width: '100%' }}
                  columns={expenditureColumns}
                  dataSource={isAdmin ? filteredExpenditures : expenditures}
                  rowKey="Expenditure_ID"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                />
              </div>
            ),
          },
         
          ...(isAdmin ? [{
            key: 'clubs',
            label: (
              <span>
                <BankOutlined /> Club Requests ({clubs.length})
              </span>
            ),
            children: (
              <Table
                style={{ width: '100%' }}
                columns={clubColumns}
                dataSource={clubs}
                rowKey="Club_ID"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            ),
          },  {
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
          },] : []),
        ]}
      />

      <Modal
        title="Create Expenditure Request"
        open={isCreateExpenditureModalOpen}
        onOk={() => createExpenditureForm.submit()}
        onCancel={() => {
          setIsCreateExpenditureModalOpen(false);
          createExpenditureForm.resetFields();
          setSelectedClubForExpenditure(undefined);
          setBudgets([]);
          setSelectedBudget(null);
        }}
        okText="Create Request"
        cancelText="Cancel"
        width={600}
      >
        <Form
          form={createExpenditureForm}
          layout="vertical"
          onFinish={handleCreateExpenditureSubmit}
        >
          <Form.Item
            name="Club_ID"
            label="Club"
            rules={[{ required: true, message: 'Please select a club' }]}
          >
            <Select
              placeholder="Select a club"
              onChange={handleClubChangeForExpenditure}
            >
              {(isAdmin ? allClubs : leaderClubs)
                .filter((club) => club.STATUS === 'Active') // Only show Active clubs
                .map((club) => (
                  <Select.Option key={club.Club_ID} value={club.Club_ID}>
                    {club.Club_Name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="Budget_ID"
            label="Budget"
            rules={[{ required: true, message: 'Please select a budget' }]}
          >
            <Select
              placeholder={selectedClubForExpenditure ? "Select a budget" : "Select a club first"}
              disabled={!selectedClubForExpenditure}
              onChange={handleBudgetChangeForExpenditure}
            >
              {budgets.map((budget) => (
                <Select.Option key={budget.Budget_ID} value={budget.Budget_ID}>
                  {budget.Academic_Year} - ${Number(budget.Remaining || 0).toFixed(2)} remaining
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {selectedBudget && (
            <div style={{ 
              marginBottom: 16, 
              padding: 16, 
              backgroundColor: '#f0f2f5', 
              borderRadius: 4,
              border: '1px solid #d9d9d9'
            }}>
              <div style={{ marginBottom: 8, fontSize: '14px', fontWeight: 600 }}>
                Budget Information
              </div>
              <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.8' }}>
                <div><strong>Academic Year:</strong> {selectedBudget.Academic_Year}</div>
                <div><strong>Total Allocated:</strong> ${Number(selectedBudget.Total_Allocated || 0).toFixed(2)}</div>
                <div><strong>Total Spent:</strong> ${Number(selectedBudget.Total_Spent || 0).toFixed(2)}</div>
                <div style={{ 
                  fontWeight: 600, 
                  fontSize: '14px',
                  color: Number(selectedBudget.Remaining || 0) > 0 ? '#52c41a' : '#ff4d4f', 
                  marginTop: 8,
                  paddingTop: 8,
                  borderTop: '1px solid #d9d9d9'
                }}>
                  <strong>Remaining Balance:</strong> ${Number(selectedBudget.Remaining || 0).toFixed(2)}
                </div>
              </div>
            </div>
          )}

          <Form.Item
            name="expenseDescription"
            label="Expense Description"
            rules={[{ required: true, message: 'Please enter an expense description' }]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Enter a description of the expense" 
            />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[
              { required: true, message: 'Please enter an amount' },
              { type: 'number', min: 0.01, message: 'Amount must be greater than 0' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !selectedBudget) {
                    return Promise.resolve();
                  }
                  const remainingBalance = Number(selectedBudget.Remaining || 0);
                  if (value > remainingBalance) {
                    return Promise.reject(
                      new Error(`Amount cannot exceed remaining balance of $${remainingBalance.toFixed(2)}`)
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              prefix="$"
              placeholder="0.00"
              precision={2}
              min={0.01}
              max={selectedBudget ? Number(selectedBudget.Remaining || 0) : undefined}
            />
          </Form.Item>

          <Form.Item
            name="requestExpenseDate"
            label="Request Expense Date"
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <p style={{ color: '#666', fontSize: '12px', marginTop: -8 }}>
            This expenditure request will be created with &quot;Pending&quot; status and will be reviewed by an admin.
          </p>
        </Form>
      </Modal>
    </div>
  );
}

