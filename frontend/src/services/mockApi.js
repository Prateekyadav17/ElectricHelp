// Simple Mock API - Staff + Electrician + Admin Functions
const delay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Users
const mockUsers = {
  staff: {
    email: 'staff@test.com',
    password: '123456',
    token: 'mock-staff-token-123',
    userData: {
      id: 1,
      name: 'Utkrishat Dusad',
      email: 'staff@test.com',
      role: 'staff',
      department: 'General Staff',
      phone: '+91 9876543210'
    }
  },
  electrician: {
    email: 'electrician@test.com',
    password: '123456',
    token: 'mock-electrician-token-456',
    userData: {
      id: 2,
      name: 'Ramesh Kumar',
      email: 'electrician@test.com',
      role: 'electrician',
      specialization: 'Electrical Maintenance',
      phone: '+91 9876543211'
    }
  },
  admin: {
    email: 'admin@test.com',
    password: '123456',
    token: 'mock-admin-token-789',
    userData: {
      id: 3,
      name: 'Admin User',
      email: 'admin@test.com',
      role: 'admin',
      department: 'Administration',
      phone: '+91 9876543212'
    }
  }
};

// Mock Electricians List
let mockElectricians = [
  {
    id: 2,
    name: 'Ramesh Kumar',
    email: 'electrician@test.com',
    phone: '+91 9876543211',
    specialization: 'Electrical Maintenance',
    assigned: 3,
    resolved: 20,
    status: 'active'
  },
  {
    id: 4,
    name: 'Suresh Singh',
    email: 'suresh@test.com',
    phone: '+91 9876543213',
    specialization: 'HVAC & Electrical',
    assigned: 1,
    resolved: 12,
    status: 'active'
  },
  {
    id: 5,
    name: 'Vijay Sharma',
    email: 'vijay@test.com',
    phone: '+91 9876543214',
    specialization: 'General Maintenance',
    assigned: 0,
    resolved: 8,
    status: 'active'
  }
];

// Mock Complaints Array with Images
let mockComplaints = [
  {
    _id: 'complaint-1',
    title: 'Broken Light in Room 101',
    description: 'The ceiling light in Room 101 is not working. Needs immediate attention.',
    location: 'Room 101, Building A',
    priority: 'high',
    category: 'electrical',
    status: 'in-progress',
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
      'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400'
    ],
    createdBy: {
      id: 1,
      name: 'Utkrishat Dusad',
      email: 'staff@test.com'
    },
    assignedTo: {
      id: 2,
      name: 'Ramesh Kumar',
      email: 'electrician@test.com'
    },
    createdAt: '2025-11-08T10:30:00Z',
    updatedAt: '2025-11-09T09:15:00Z',
    comments: []
  },
  {
    _id: 'complaint-2',
    title: 'Fan not working in Lab 2',
    description: 'The fan is making noise and not rotating properly.',
    location: 'Lab 2, Building B',
    priority: 'medium',
    category: 'electrical',
    status: 'in-progress',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
    ],
    createdBy: {
      id: 1,
      name: 'Utkrishat Dusad',
      email: 'staff@test.com'
    },
    assignedTo: {
      id: 2,
      name: 'Ramesh Kumar',
      email: 'electrician@test.com'
    },
    createdAt: '2025-11-07T14:20:00Z',
    updatedAt: '2025-11-09T09:15:00Z',
    comments: [
      {
        id: 1,
        user: 'Ramesh Kumar',
        text: 'Inspected the fan. Need to replace the capacitor.',
        timestamp: '2025-11-09T09:15:00Z'
      }
    ]
  },
  {
    _id: 'complaint-3',
    title: 'AC not cooling in Office',
    description: 'The air conditioner is running but not cooling properly.',
    location: 'Main Office, Building A',
    priority: 'high',
    category: 'hvac',
    status: 'resolved',
    images: [],
    createdBy: {
      id: 1,
      name: 'Utkrishat Dusad',
      email: 'staff@test.com'
    },
    assignedTo: {
      id: 2,
      name: 'Ramesh Kumar',
      email: 'electrician@test.com'
    },
    createdAt: '2025-11-05T11:00:00Z',
    updatedAt: '2025-11-06T16:30:00Z',
    resolvedAt: '2025-11-06T16:30:00Z',
    comments: [
      {
        id: 1,
        user: 'Ramesh Kumar',
        text: 'Cleaned the filters and recharged the gas.',
        timestamp: '2025-11-06T16:30:00Z'
      }
    ]
  },
  {
    _id: 'complaint-4',
    title: 'Socket not working in Room 205',
    description: 'Power socket is completely dead. Need urgent fix.',
    location: 'Room 205, Building C',
    priority: 'high',
    category: 'electrical',
    status: 'pending',
    images: [
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400'
    ],
    createdBy: {
      id: 1,
      name: 'Utkrishat Dusad',
      email: 'staff@test.com'
    },
    assignedTo: {
      id: 2,
      name: 'Ramesh Kumar',
      email: 'electrician@test.com'
    },
    createdAt: '2025-11-09T15:00:00Z',
    updatedAt: '2025-11-09T15:00:00Z',
    comments: []
  }
];

// Mock API Service
export const mockApi = {
  // Staff Login
  staffLogin: async (email, password) => {
    await delay(800);
    if (email === mockUsers.staff.email && password === mockUsers.staff.password) {
      return {
        success: true,
        data: {
          token: mockUsers.staff.token,
          user: mockUsers.staff.userData
        }
      };
    }
    throw new Error('Invalid credentials');
  },

  // Electrician Login
  electricianLogin: async (email, password) => {
    await delay(800);
    if (email === mockUsers.electrician.email && password === mockUsers.electrician.password) {
      return {
        success: true,
        data: {
          token: mockUsers.electrician.token,
          user: mockUsers.electrician.userData
        }
      };
    }
    throw new Error('Invalid credentials');
  },

  // Admin Login
  adminLogin: async (email, password) => {
    await delay(800);
    if (email === mockUsers.admin.email && password === mockUsers.admin.password) {
      return {
        success: true,
        data: {
          token: mockUsers.admin.token,
          user: mockUsers.admin.userData
        }
      };
    }
    throw new Error('Invalid credentials');
  },

  // Get Staff Complaints
  getStaffComplaints: async (token) => {
    await delay(500);
    if (token === mockUsers.staff.token) {
      return {
        success: true,
        data: mockComplaints
      };
    }
    throw new Error('Unauthorized');
  },

  // Get Electrician Assigned Complaints
  getElectricianComplaints: async (token) => {
    await delay(500);
    if (token === mockUsers.electrician.token) {
      const assignedComplaints = mockComplaints.filter(
        c => c.assignedTo && c.assignedTo.id === mockUsers.electrician.userData.id
      );
      return {
        success: true,
        data: assignedComplaints
      };
    }
    throw new Error('Unauthorized');
  },

  // Get All Complaints (Admin)
  getAllComplaints: async (token) => {
    await delay(500);
    if (token === mockUsers.admin.token) {
      return {
        success: true,
        data: mockComplaints
      };
    }
    throw new Error('Unauthorized');
  },

  // Get Electricians (Admin)
  getElectricians: async (token) => {
    await delay(500);
    if (token === mockUsers.admin.token) {
      return {
        success: true,
        data: mockElectricians
      };
    }
    throw new Error('Unauthorized');
  },

  // Submit Complaint (Staff)
  submitComplaint: async (token, complaintData) => {
    await delay(800);
    if (token === mockUsers.staff.token) {
      const newComplaint = {
        _id: `complaint-${Date.now()}`,
        ...complaintData,
        status: 'pending',
        images: complaintData.images || [],
        createdBy: mockUsers.staff.userData,
        assignedTo: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: []
      };
      mockComplaints.unshift(newComplaint);
      return {
        success: true,
        data: newComplaint
      };
    }
    throw new Error('Unauthorized');
  },

  // Update Complaint Status (Electrician)
  updateComplaintStatus: async (token, complaintId, status, comment) => {
    await delay(800);
    if (token === mockUsers.electrician.token) {
      const complaint = mockComplaints.find(c => c._id === complaintId);
      if (complaint) {
        complaint.status = status;
        complaint.updatedAt = new Date().toISOString();
        if (status === 'resolved') {
          complaint.resolvedAt = new Date().toISOString();
        }
        if (comment) {
          complaint.comments.push({
            id: complaint.comments.length + 1,
            user: mockUsers.electrician.userData.name,
            text: comment,
            timestamp: new Date().toISOString()
          });
        }
        return {
          success: true,
          data: complaint
        };
      }
      throw new Error('Complaint not found');
    }
    throw new Error('Unauthorized');
  },

  // Assign Complaint to Electrician (Admin)
  assignComplaint: async (token, complaintId, electricianId) => {
    await delay(700);
    if (token !== mockUsers.admin.token) throw new Error('Unauthorized');
    const complaint = mockComplaints.find(c => c._id === complaintId);
    const electrician = mockElectricians.find(e => e.id === electricianId);
    if (!complaint || !electrician) throw new Error('Not found');
    complaint.assignedTo = { id: electrician.id, name: electrician.name, email: electrician.email };
    complaint.status = 'in-progress';
    complaint.updatedAt = new Date().toISOString();
    electrician.assigned += 1;
    return { success: true, data: complaint };
  },

  // Get Admin Stats
  getAdminStats: async (token) => {
    await delay(400);
    if (token !== mockUsers.admin.token) throw new Error('Unauthorized');
    const total = mockComplaints.length;
    const pending = mockComplaints.filter(c => c.status === 'pending').length;
    const inProgress = mockComplaints.filter(c => c.status === 'in-progress').length;
    const resolved = mockComplaints.filter(c => c.status === 'resolved').length;
    return {
      success: true,
      data: {
        total,
        pending,
        inProgress,
        resolved,
        electricians: mockElectricians.length
      }
    };
  }
};

export default mockApi;
