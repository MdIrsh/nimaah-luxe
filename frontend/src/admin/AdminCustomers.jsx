import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserCheck,
  Crown,
  UserX,
  IndianRupee,
  TrendingUp,
  Repeat,
  Sparkles,
  Search,
  Filter,
  Download,
  Printer,
  Plus,
  Eye,
  Edit2,
  Ban,
  Trash2,
  X,
  Check,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  Award,
  FileText,
  Clock,
  Send,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';

// Format date to match user wireframe exactly: "21-Nov-2026"
export const formatLuxeDate = (dateStr) => {
  if (!dateStr) return '21-Nov-2026';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '21-Nov-2026';
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');

  // Modals & Drawer state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Forms state
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    fullAddress: '',
    customerType: 'Regular',
    status: 'Active',
    gender: 'Female',
    dateOfBirth: '',
    initialNote: '',
  });

  const [editCustomerForm, setEditCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    fullAddress: '',
    customerType: 'Regular',
    status: 'Active',
    gender: 'Female',
    dateOfBirth: '',
    rewardPoints: 0,
    storeCredit: 0,
    kycStatus: 'Verified',
  });

  // Note form in drawer
  const [noteText, setNoteText] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/customers');
      if (res.data?.success && res.data.data) {
        setCustomers(res.data.data.customers || []);
        setAnalytics(res.data.data.analytics || null);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      showFeedback('error', 'Could not load customer roster from database.');
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (type, text) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg({ type: '', text: '' }), 4000);
  };

  // Distinct cities for filter dropdown
  const availableCities = useMemo(() => {
    const set = new Set();
    customers.forEach((c) => {
      const city = c.city || c.addresses?.[0]?.city;
      if (city) set.add(city.trim());
    });
    return Array.from(set).sort();
  }, [customers]);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c, idx) => {
      const custId = c.customerId || `CUST${String(idx + 1).padStart(3, '0')}`;
      const name = c.name || '';
      const email = c.email || '';
      const phone = c.phone || c.addresses?.[0]?.phone || '';
      const city = c.city || c.addresses?.[0]?.city || '';
      const type = c.customerType || 'Regular';
      const status = c.status || 'Active';

      // 1. Search term (Name, Email, Phone, Customer ID)
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        name.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        phone.includes(q) ||
        custId.toLowerCase().includes(q) ||
        city.toLowerCase().includes(q);

      // 2. Customer Type
      const matchType = typeFilter === 'ALL' || type.toLowerCase() === typeFilter.toLowerCase();

      // 3. Status
      const matchStatus = statusFilter === 'ALL' || status.toLowerCase() === statusFilter.toLowerCase();

      // 4. City
      const matchCity = cityFilter === 'ALL' || city.toLowerCase() === cityFilter.toLowerCase();

      // 5. Registration Date
      let matchDate = true;
      if (dateFilter !== 'ALL' && c.createdAt) {
        const created = new Date(c.createdAt);
        const now = new Date();
        if (dateFilter === 'TODAY') {
          matchDate = created.toDateString() === now.toDateString();
        } else if (dateFilter === 'THIS_WEEK') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          matchDate = created >= sevenDaysAgo;
        } else if (dateFilter === 'THIS_MONTH') {
          matchDate =
            created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        } else if (dateFilter === 'THIS_YEAR') {
          matchDate = created.getFullYear() === now.getFullYear();
        }
      }

      return matchSearch && matchType && matchStatus && matchCity && matchDate;
    });
  }, [customers, search, typeFilter, statusFilter, cityFilter, dateFilter]);

  // Summary Metrics: fallback calculated locally if analytics object empty
  const metrics = useMemo(() => {
    if (analytics) return analytics;
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((c) => (c.status || 'Active') === 'Active').length;
    const vipCustomers = customers.filter((c) => c.customerType === 'VIP').length;
    const blockedCustomers = customers.filter((c) => c.status === 'Blocked').length;
    const totalRevenue = customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);
    const totalOrders = customers.reduce((acc, c) => acc + (c.orderCount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const repeatCustomers = customers.filter((c) => (c.orderCount || 0) >= 2).length;
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const newCustomersThisMonth = customers.filter(
      (c) => new Date(c.createdAt || Date.now()) >= startOfMonth
    ).length;

    return {
      totalCustomers,
      activeCustomers,
      vipCustomers,
      blockedCustomers,
      totalRevenue,
      avgOrderValue,
      repeatCustomers,
      newCustomersThisMonth,
    };
  }, [analytics, customers]);

  // Export to Excel (.csv)
  const handleExportExcel = () => {
    if (!filteredCustomers.length) {
      showFeedback('error', 'No customer records available to export.');
      return;
    }

    const headers = [
      'Customer ID',
      'Name',
      'Email',
      'Phone Number',
      'City',
      'Total Orders',
      'Total Spending (INR)',
      'Customer Type',
      'Status',
      'Last Login Date',
      'Join Date',
    ];

    const rows = filteredCustomers.map((c, idx) => {
      const custId = c.customerId || `CUST${String(idx + 1).padStart(3, '0')}`;
      const phone = c.phone || c.addresses?.[0]?.phone || '—';
      const city = c.city || c.addresses?.[0]?.city || '—';
      const orderCount = c.orderCount || 0;
      const totalSpend = c.totalSpent || 0;
      const type = c.customerType || 'Regular';
      const status = c.status || 'Active';
      const lastLogin = c.lastLogin ? formatLuxeDate(c.lastLogin) : '—';
      const joinDate = formatLuxeDate(c.createdAt);

      return [
        `"${custId}"`,
        `"${c.name?.replace(/"/g, '""') || ''}"`,
        `"${c.email || ''}"`,
        `"${phone}"`,
        `"${city}"`,
        orderCount,
        totalSpend,
        `"${type}"`,
        `"${status}"`,
        `"${lastLogin}"`,
        `"${joinDate}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NiMaah_Luxe_Customers_${formatLuxeDate(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback('success', 'Customer directory exported to Excel (CSV) successfully.');
  };

  // Export PDF / Print View
  const handleExportPDF = () => {
    window.print();
  };

  // View Customer Drawer
  const handleOpenDrawer = (customer) => {
    setSelectedCustomer(customer);
    setNoteText('');
    setIsDrawerOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (customer, idx) => {
    setSelectedCustomer(customer);
    const primaryAddr = customer.addresses?.[0] || {};
    setEditCustomerForm({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || primaryAddr.phone || '',
      city: customer.city || primaryAddr.city || '',
      state: primaryAddr.state || customer.state || '',
      country: primaryAddr.country || customer.country || 'India',
      pincode: primaryAddr.postalCode || customer.pincode || '',
      fullAddress: primaryAddr.street || customer.fullAddress || '',
      customerType: customer.customerType || 'Regular',
      status: customer.status || 'Active',
      gender: customer.gender || 'Female',
      dateOfBirth: customer.dateOfBirth ? customer.dateOfBirth.slice(0, 10) : '',
      rewardPoints: customer.rewardPoints || 0,
      storeCredit: customer.storeCredit || 0,
      kycStatus: customer.kycStatus || 'Verified',
    });
    setIsEditModalOpen(true);
  };

  // Save Edit Customer
  const handleSaveEditCustomer = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    try {
      setActionLoading(true);
      const res = await api.put(`/admin/customers/${selectedCustomer._id}`, editCustomerForm);
      if (res.data?.success) {
        showFeedback('success', `Patron ${editCustomerForm.name} updated successfully!`);
        setIsEditModalOpen(false);
        await fetchCustomers();
        if (selectedCustomer) {
          setSelectedCustomer((prev) => ({ ...prev, ...editCustomerForm }));
        }
      }
    } catch (err) {
      console.error('Update failed:', err);
      showFeedback('error', err.response?.data?.message || 'Failed to update customer details.');
    } finally {
      setActionLoading(false);
    }
  };

  // Add New Customer
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await api.post('/admin/customers', newCustomerForm);
      if (res.data?.success) {
        showFeedback('success', `New patron ${newCustomerForm.name} enrolled into Ni'maah Atelier!`);
        setIsAddModalOpen(false);
        setNewCustomerForm({
          name: '',
          email: '',
          phone: '',
          city: 'Delhi',
          state: 'Delhi',
          country: 'India',
          pincode: '110001',
          fullAddress: '',
          customerType: 'New',
          status: 'Active',
          gender: 'Female',
          dateOfBirth: '',
          initialNote: '',
        });
        await fetchCustomers();
      }
    } catch (err) {
      console.error('Create failed:', err);
      showFeedback('error', err.response?.data?.message || 'Could not enroll customer.');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Block / Unblock
  const handleToggleBlock = async (customer) => {
    const newStatus = customer.status === 'Blocked' ? 'Active' : 'Blocked';
    const actionText = newStatus === 'Blocked' ? 'block' : 'unblock';
    if (!window.confirm(`Are you sure you wish to ${actionText} ${customer.name}?`)) return;

    try {
      const res = await api.patch(`/admin/customers/${customer._id}/status`, { status: newStatus });
      if (res.data?.success) {
        showFeedback('success', `Customer status set to ${newStatus}.`);
        setCustomers((prev) =>
          prev.map((c) => (c._id === customer._id ? { ...c, status: newStatus } : c))
        );
        if (selectedCustomer?._id === customer._id) {
          setSelectedCustomer((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error('Failed to change status:', err);
      showFeedback('error', 'Status modification failed.');
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (customer) => {
    if (
      !window.confirm(
        `CAUTION: Permanently delete patron record for ${customer.name}? This action cannot be reversed.`
      )
    )
      return;

    try {
      const res = await api.delete(`/admin/customers/${customer._id}`);
      if (res.data?.success) {
        showFeedback('success', `Customer record for ${customer.name} permanently removed.`);
        setCustomers((prev) => prev.filter((c) => c._id !== customer._id));
        if (selectedCustomer?._id === customer._id) {
          setIsDrawerOpen(false);
          setSelectedCustomer(null);
        }
      }
    } catch (err) {
      console.error('Delete failed:', err);
      showFeedback('error', 'Customer removal failed.');
    }
  };

  // Add Internal Note to Drawer
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!selectedCustomer || !noteText.trim()) return;

    try {
      setIsSubmittingNote(true);
      const res = await api.post(`/admin/customers/${selectedCustomer._id}/notes`, {
        note: noteText.trim(),
        author: 'Super Admin',
      });
      if (res.data?.success) {
        const updatedNotes = res.data.data;
        setSelectedCustomer((prev) => ({ ...prev, internalNotes: updatedNotes }));
        setCustomers((prev) =>
          prev.map((c) =>
            c._id === selectedCustomer._id ? { ...c, internalNotes: updatedNotes } : c
          )
        );
        setNoteText('');
        showFeedback('success', 'Internal note securely recorded.');
      }
    } catch (err) {
      console.error('Note add failed:', err);
      showFeedback('error', 'Could not save internal note.');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 print:p-0 print:space-y-3">
      {/* ================================================================== */}
      {/* 1. TOP HEADER & TOAST NOTIFICATION                                 */}
      {/* ================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E9E1D6] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-[0.28em] uppercase font-bold text-[#A68B66]">
              Atelier Clientela
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
              Live Database
            </span>
          </div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-[#29251F] font-bold mt-1">
            Customer Management Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Orchestrate patron lifecycles, couture VIP tiering, verified orders, and boutique concierge notes.
          </p>
        </div>

        {/* Global Header Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={fetchCustomers}
            className="p-2.5 rounded-lg border border-[#E9E1D6] bg-white text-[#29251F] hover:bg-[#FAF9F6] transition shadow-2xs"
            title="Refresh Directory"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[#C5A059]' : ''} />
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 rounded-lg border border-[#E9E1D6] bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-2 shadow-2xs cursor-pointer"
          >
            <Download size={14} className="text-[#C5A059]" />
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="px-3.5 py-2.5 rounded-lg border border-[#E9E1D6] bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-2 shadow-2xs cursor-pointer"
          >
            <Printer size={14} className="text-[#29251F]" />
            <span>Export PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-[#29251F] hover:bg-[#14110C] text-[#FAF9F6] text-xs font-bold tracking-wide transition flex items-center gap-2 shadow-sm border border-[#29251F] cursor-pointer"
          >
            <Plus size={15} className="text-[#C5A059]" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Floating feedback alert */}
      {feedbackMsg.text && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium border flex items-center justify-between shadow-md animate-in slide-in-from-top-2 duration-300 ${
            feedbackMsg.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg({ type: '', text: '' })}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ================================================================== */}
      {/* 2. TOP CUSTOMER ANALYTICS (8 EXACT REQUESTED KPI CARDS)             */}
      {/* ================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5">
        {/* 1. Total Customers */}
        <div className="bg-white border border-[#E9E1D6] p-3.5 rounded-xl shadow-2xs hover:border-[#C5A059] transition">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] uppercase font-bold text-gray-400 tracking-wider">
              Total Customers
            </span>
            <Users size={14} className="text-[#29251F]" />
          </div>
          <p className="text-xl sm:text-2xl font-serif-luxury font-bold text-[#29251F] mt-2">
            {metrics.totalCustomers}
          </p>
          <span className="text-[10px] text-gray-500 font-medium">Atlas Enrolled</span>
        </div>

        {/* 2. Active Customers */}
        <div className="bg-white border border-[#E9E1D6] p-3.5 rounded-xl shadow-2xs hover:border-emerald-400 transition">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] uppercase font-bold text-emerald-600 tracking-wider">
              Active Customers
            </span>
            <UserCheck size={14} className="text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-serif-luxury font-bold text-emerald-700 mt-2">
            {metrics.activeCustomers}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">In Good Standing</span>
        </div>

        {/* 3. VIP Customers */}
        <div className="bg-gradient-to-br from-[#29251F] to-[#14110C] border border-[#C5A059]/40 p-3.5 rounded-xl shadow-2xs text-[#FAF9F6]">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] uppercase font-bold text-[#C5A059] tracking-wider">
              VIP Customers
            </span>
            <Crown size={14} className="text-[#C5A059]" />
          </div>
          <p className="text-xl sm:text-2xl font-serif-luxury font-bold text-[#E8DCC9] mt-2">
            {metrics.vipCustomers}
          </p>
          <span className="text-[10px] text-[#A68B66] font-medium">Bespoke Tier</span>
        </div>

        {/* 4. Blocked Customers */}
        <div className="bg-white border border-[#E9E1D6] p-3.5 rounded-xl shadow-2xs hover:border-rose-400 transition">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] uppercase font-bold text-rose-600 tracking-wider">
              Blocked Patrons
            </span>
            <UserX size={14} className="text-rose-600" />
          </div>
          <p className="text-xl sm:text-2xl font-serif-luxury font-bold text-rose-700 mt-2">
            {metrics.blockedCustomers}
          </p>
          <span className="text-[10px] text-rose-500 font-medium">Restricted Access</span>
        </div>

        {/* 5. Total Revenue */}
        <div className="bg-white border border-[#E9E1D6] p-3.5 rounded-xl shadow-2xs hover:border-[#C5A059] transition">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] uppercase font-bold text-gray-400 tracking-wider">
              Total Revenue
            </span>
            <IndianRupee size={14} className="text-[#C5A059]" />
          </div>
          <p className="text-xl sm:text-2xl font-serif-luxury font-bold text-[#29251F] mt-2 truncate">
            ₹{metrics.totalRevenue.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-gray-500 font-medium">Patron GMV</span>
        </div>

        {/* 6. Average Order Value */}
        <div className="bg-white border border-[#E9E1D6] p-3.5 rounded-xl shadow-2xs hover:border-[#C5A059] transition">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] uppercase font-bold text-gray-400 tracking-wider">
              Avg. Order Value
            </span>
            <TrendingUp size={14} className="text-[#29251F]" />
          </div>
          <p className="text-xl sm:text-2xl font-serif-luxury font-bold text-[#29251F] mt-2 truncate">
            ₹{metrics.avgOrderValue.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-gray-500 font-medium">Ticket Size</span>
        </div>

        {/* 7. Repeat Customers */}
        <div className="bg-white border border-[#E9E1D6] p-3.5 rounded-xl shadow-2xs hover:border-blue-400 transition">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] uppercase font-bold text-blue-600 tracking-wider">
              Repeat Patrons
            </span>
            <Repeat size={14} className="text-blue-600" />
          </div>
          <p className="text-xl sm:text-2xl font-serif-luxury font-bold text-blue-700 mt-2">
            {metrics.repeatCustomers}
          </p>
          <span className="text-[10px] text-blue-500 font-medium">≥ 2 Orders</span>
        </div>

        {/* 8. New Customers This Month */}
        <div className="bg-white border border-[#E9E1D6] p-3.5 rounded-xl shadow-2xs hover:border-[#C5A059] transition">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] uppercase font-bold text-[#C5A059] tracking-wider">
              New This Month
            </span>
            <Sparkles size={14} className="text-[#C5A059]" />
          </div>
          <p className="text-xl sm:text-2xl font-serif-luxury font-bold text-[#29251F] mt-2">
            {metrics.newCustomersThisMonth}
          </p>
          <span className="text-[10px] text-[#A68B66] font-medium">Acquisitions</span>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 3. CUSTOMER SEARCH & FILTERS CONTROLS                               */}
      {/* ================================================================== */}
      <div className="bg-white border border-[#E9E1D6] p-4 rounded-xl shadow-2xs space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search by Name, Email, Phone, Customer ID */}
          <div className="relative lg:col-span-2">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Name, Email, Phone, Customer ID..."
              className="w-full pl-9 pr-8 py-2 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-xs text-[#29251F] placeholder-gray-400 focus:outline-none focus:border-[#C5A059]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filter by Customer Type */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-xs font-semibold text-[#29251F] focus:outline-none focus:border-[#C5A059] cursor-pointer"
            >
              <option value="ALL">All Patron Types</option>
              <option value="VIP">VIP Tier</option>
              <option value="Premium">Premium</option>
              <option value="Regular">Regular</option>
              <option value="New">New Patrons</option>
            </select>
          </div>

          {/* Filter by Status (Active, Inactive, Blocked) */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-xs font-semibold text-[#29251F] focus:outline-none focus:border-[#C5A059] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          {/* Filter by City */}
          <div>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-xs font-semibold text-[#29251F] focus:outline-none focus:border-[#C5A059] cursor-pointer"
            >
              <option value="ALL">All Cities</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter by Registration Date + Active Count */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Registration Period:
            </span>
            {[
              { id: 'ALL', label: 'All Time' },
              { id: 'TODAY', label: 'Today' },
              { id: 'THIS_WEEK', label: 'This Week' },
              { id: 'THIS_MONTH', label: 'This Month' },
              { id: 'THIS_YEAR', label: '2026' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setDateFilter(p.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                  dateFilter === p.id
                    ? 'bg-[#29251F] text-[#FAF9F6]'
                    : 'bg-[#FAF9F6] text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="text-gray-500 font-mono text-[11px]">
            Showing <strong>{filteredCustomers.length}</strong> of {customers.length} patrons
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 4. EXACT CUSTOMER LIST TABLE (ALL 13 REQUESTED COLUMNS)            */}
      {/* ================================================================== */}
      <div className="bg-white border border-[#E9E1D6] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 bg-[#FAF9F6] border-b border-[#E9E1D6] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h2 className="font-serif-luxury text-lg font-bold text-[#29251F]">
              Customer List Table
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#E9E1D6] text-[#29251F] text-[10px] font-bold font-mono">
              Live Atlas
            </span>
          </div>
          <span className="text-[11px] text-gray-400 font-mono">
            Scroll horizontally to view complete patron record columns →
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/90 border-b border-[#E9E1D6] text-gray-700 font-bold text-[11px] tracking-wider uppercase">
                <th className="py-3 px-3.5 border-r border-gray-100/70 text-center">Profile</th>
                <th className="py-3 px-3.5 border-r border-gray-100/70">Customer ID</th>
                <th className="py-3 px-3.5 border-r border-gray-100/70">Customer Name</th>
                <th className="py-3 px-3.5 border-r border-gray-100/70">Email</th>
                <th className="py-3 px-3.5 border-r border-gray-100/70">Phone Number</th>
                <th className="py-3 px-3.5 border-r border-gray-100/70">City</th>
                <th className="py-3 px-3.5 border-r border-gray-100/70 text-center">Orders</th>
                <th className="py-3 px-3.5 border-r border-gray-100/70 text-right">Total Spending</th>
                <th className="py-3 px-3.5 border-r border-gray-100/70 text-center">Customer Type</th>
                <th className="py-3 px-3.5 border-r border-gray-100/70 text-center">Status</th>
                <th className="py-3 px-3.5 border-r border-gray-100/70">Last Login Date</th>
                <th className="py-3 px-3.5 border-r border-gray-100/70">Join Date</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="13" className="py-12 text-center text-gray-400">
                    <div className="inline-block w-8 h-8 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="font-mono text-xs text-gray-500">Synchronizing MongoDB Atlas Patrons...</p>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="13" className="py-12 text-center text-gray-500">
                    <p className="font-bold text-sm text-[#29251F]">No patron records matched your criteria.</p>
                    <p className="text-xs text-gray-400 mt-1">Try resetting your search query or filter tags.</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c, idx) => {
                  const custId = c.customerId || `CUST${String(idx + 1).padStart(3, '0')}`;
                  const phone = c.phone || c.addresses?.[0]?.phone || '—';
                  const city = c.city || c.addresses?.[0]?.city || '—';
                  const orderCount = c.orderCount || 0;
                  const totalSpend = c.totalSpent || 0;
                  const type = c.customerType || 'Regular';
                  const status = c.status || 'Active';
                  const joinDate = formatLuxeDate(c.createdAt);
                  const lastLogin = c.lastLogin ? formatLuxeDate(c.lastLogin) : '—';
                  const initials = (c.name || 'Patron')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={c._id || idx}
                      className="hover:bg-[#FAF9F6]/80 transition group"
                    >
                      {/* 1. Profile Picture / Avatar */}
                      <td className="py-2.5 px-3.5 border-r border-gray-100/70 text-center">
                        {c.profileImage ? (
                          <img
                            src={c.profileImage}
                            alt={c.name}
                            className="w-8 h-8 rounded-full object-cover mx-auto ring-1 ring-[#C5A059]"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#29251F] text-[#C5A059] flex items-center justify-center font-bold text-[10px] mx-auto shadow-2xs">
                            {initials}
                          </div>
                        )}
                      </td>

                      {/* 2. Customer ID */}
                      <td className="py-2.5 px-3.5 font-mono font-bold text-[#29251F] border-r border-gray-100/70">
                        {custId}
                      </td>

                      {/* 3. Customer Name */}
                      <td className="py-2.5 px-3.5 font-bold text-[#29251F] border-r border-gray-100/70">
                        <button
                          type="button"
                          onClick={() => handleOpenDrawer(c)}
                          className="hover:text-[#C5A059] transition cursor-pointer text-left"
                        >
                          {c.name}
                        </button>
                      </td>

                      {/* 4. Email */}
                      <td className="py-2.5 px-3.5 font-mono text-gray-600 border-r border-gray-100/70">
                        {c.email}
                      </td>

                      {/* 5. Phone Number */}
                      <td className="py-2.5 px-3.5 font-mono text-gray-700 border-r border-gray-100/70">
                        {phone}
                      </td>

                      {/* 6. City */}
                      <td className="py-2.5 px-3.5 text-gray-700 border-r border-gray-100/70">
                        {city}
                      </td>

                      {/* 7. Total Orders */}
                      <td className="py-2.5 px-3.5 font-bold text-center text-gray-800 border-r border-gray-100/70">
                        {orderCount}
                      </td>

                      {/* 8. Total Spending */}
                      <td className="py-2.5 px-3.5 font-bold text-right text-[#29251F] border-r border-gray-100/70 font-mono">
                        ₹{totalSpend.toLocaleString('en-IN')}
                      </td>

                      {/* 9. Customer Type */}
                      <td className="py-2.5 px-3.5 text-center border-r border-gray-100/70">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            type === 'VIP'
                              ? 'bg-[#29251F] text-[#C5A059] border border-[#C5A059]/40'
                              : type === 'Premium'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : type === 'New'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {type}
                        </span>
                      </td>

                      {/* 10. Status */}
                      <td className="py-2.5 px-3.5 text-center border-r border-gray-100/70">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : status === 'Blocked'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      {/* 11. Last Login Date */}
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-gray-500 border-r border-gray-100/70">
                        {lastLogin}
                      </td>

                      {/* 12. Join Date */}
                      <td className="py-2.5 px-3.5 font-mono text-[11px] text-gray-600 border-r border-gray-100/70">
                        {joinDate}
                      </td>

                      {/* 13. Actions (View, Edit, Block, Delete) */}
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Drawer */}
                          <button
                            type="button"
                            onClick={() => handleOpenDrawer(c)}
                            title="View Full Patron Dossier"
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Edit Modal */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(c, idx)}
                            title="Edit Profile"
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-[#C5A059] transition cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>

                          {/* Block / Unblock */}
                          <button
                            type="button"
                            onClick={() => handleToggleBlock(c)}
                            title={status === 'Blocked' ? 'Unblock Patron' : 'Block Patron'}
                            className={`p-1.5 rounded-md transition cursor-pointer ${
                              status === 'Blocked'
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-amber-600 hover:bg-amber-50'
                            }`}
                          >
                            <Ban size={14} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomer(c)}
                            title="Permanently Delete"
                            className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 5. CUSTOMER DETAILS DRAWER / PAGE (SLIDE-OVER FROM RIGHT)           */}
      {/* ================================================================== */}
      {isDrawerOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col border-l border-[#E9E1D6] animate-in slide-in-from-right duration-300">
              {/* Drawer Top Header */}
              <div className="p-6 bg-gradient-to-r from-[#29251F] to-[#14110C] text-[#FAF9F6] flex items-center justify-between border-b border-[#C5A059]/30">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-[#1F1C18] border border-[#C5A059] text-[#C5A059] flex items-center justify-center font-bold text-base shadow-sm">
                    {(selectedCustomer.name || 'P')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif-luxury text-xl font-bold text-[#E8DCC9]">
                        {selectedCustomer.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-[#C5A059] text-[#29251F] text-[9.5px] font-bold tracking-wider uppercase">
                        {selectedCustomer.customerType || 'VIP'}
                      </span>
                    </div>
                    <p className="text-xs text-[#A68B66] font-mono mt-0.5">
                      {selectedCustomer.customerId || 'CUST001'} • {selectedCustomer.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF9F6] flex items-center justify-center transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-gray-700 bg-[#FAF9F6]/40">
                {/* 1. Customer Information */}
                <div className="bg-white border border-[#E9E1D6] rounded-xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-[11px] uppercase font-bold text-[#A68B66] tracking-wider flex items-center gap-1.5">
                      <Users size={13} className="text-[#C5A059]" />
                      Customer Information
                    </span>
                    <span className="font-mono text-[10px] text-gray-400">
                      ID: {selectedCustomer.customerId || 'CUST001'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-1">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Full Name</span>
                      <span className="font-bold text-[#29251F]">{selectedCustomer.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Email</span>
                      <span className="font-mono text-gray-700">{selectedCustomer.email}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Mobile Number</span>
                      <span className="font-mono text-gray-800">
                        {selectedCustomer.phone || selectedCustomer.addresses?.[0]?.phone || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Gender</span>
                      <span className="font-semibold text-gray-700">{selectedCustomer.gender || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Date of Birth</span>
                      <span className="font-mono text-gray-700">
                        {selectedCustomer.dateOfBirth ? formatLuxeDate(selectedCustomer.dateOfBirth) : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Registration Date</span>
                      <span className="font-mono text-gray-700">
                        {formatLuxeDate(selectedCustomer.createdAt)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Last Login</span>
                      <span className="font-mono text-gray-700">
                        {selectedCustomer.lastLogin ? formatLuxeDate(selectedCustomer.lastLogin) : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Account Status</span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          selectedCustomer.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {selectedCustomer.status || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Address Information */}
                <div className="bg-white border border-[#E9E1D6] rounded-xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-[11px] uppercase font-bold text-[#A68B66] tracking-wider flex items-center gap-1.5">
                      <MapPin size={13} className="text-[#C5A059]" />
                      Address Information
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      Primary Atelier Dispatch
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-1">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Country</span>
                      <span className="font-bold text-gray-800">
                        {selectedCustomer.addresses?.[0]?.country || selectedCustomer.country || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">State</span>
                      <span className="font-bold text-gray-800">
                        {selectedCustomer.addresses?.[0]?.state || selectedCustomer.state || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">City</span>
                      <span className="font-bold text-gray-800">
                        {selectedCustomer.city || selectedCustomer.addresses?.[0]?.city || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block">Pincode</span>
                      <span className="font-mono text-gray-800">
                        {selectedCustomer.addresses?.[0]?.postalCode || selectedCustomer.pincode || '—'}
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-4 bg-[#FAF9F6] p-3 rounded-lg border border-[#E9E1D6]/70">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold block mb-0.5">
                        Full Delivery Address
                      </span>
                      <p className="font-medium text-gray-800 leading-relaxed">
                        {selectedCustomer.addresses?.[0]?.street ||
                          selectedCustomer.fullAddress ||
                          'No address saved'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Order Summary */}
                <div className="bg-white border border-[#E9E1D6] rounded-xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-[11px] uppercase font-bold text-[#A68B66] tracking-wider flex items-center gap-1.5">
                      <ShoppingBag size={13} className="text-[#C5A059]" />
                      Order Summary
                    </span>
                    <span className="font-mono text-xs font-bold text-[#29251F]">
                      Total: {selectedCustomer.orderCount || 0} Orders
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 text-center">
                    <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                      <span className="text-[9.5px] uppercase font-bold text-emerald-800 block">Completed</span>
                      <span className="text-base font-bold text-emerald-700">
                        {selectedCustomer.completedOrders || 0}
                      </span>
                    </div>
                    <div className="bg-amber-50/60 p-2.5 rounded-lg border border-amber-100">
                      <span className="text-[9.5px] uppercase font-bold text-amber-800 block">Pending</span>
                      <span className="text-base font-bold text-amber-700">
                        {selectedCustomer.pendingOrders || 0}
                      </span>
                    </div>
                    <div className="bg-rose-50/60 p-2.5 rounded-lg border border-rose-100">
                      <span className="text-[9.5px] uppercase font-bold text-rose-800 block">Cancelled</span>
                      <span className="text-base font-bold text-rose-700">
                        {selectedCustomer.cancelledOrders || 0}
                      </span>
                    </div>
                    <div className="bg-blue-50/60 p-2.5 rounded-lg border border-blue-100">
                      <span className="text-[9.5px] uppercase font-bold text-blue-800 block">Returned</span>
                      <span className="text-base font-bold text-blue-700">
                        {selectedCustomer.returnedOrders || 0}
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 bg-[#FAF9F6] p-2.5 rounded-lg border border-[#E9E1D6]">
                      <span className="text-[9.5px] uppercase font-bold text-gray-500 block">Last Order</span>
                      <span className="text-[11px] font-mono text-gray-800 block mt-1">
                        {selectedCustomer.lastOrderDate ? formatLuxeDate(selectedCustomer.lastOrderDate) : 'No orders yet'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Financial Information */}
                <div className="bg-white border border-[#E9E1D6] rounded-xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-[11px] uppercase font-bold text-[#A68B66] tracking-wider flex items-center gap-1.5">
                      <CreditCard size={13} className="text-[#C5A059]" />
                      Financial Information
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">Currency: INR (₹)</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                    <div className="bg-[#FAF9F6] p-3 rounded-lg border border-[#E9E1D6]">
                      <span className="text-[9.5px] uppercase font-bold text-gray-500 block">Lifetime Spend</span>
                      <span className="text-base font-bold text-[#29251F] font-mono mt-0.5 block">
                        ₹{(selectedCustomer.totalSpent || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="bg-[#FAF9F6] p-3 rounded-lg border border-[#E9E1D6]">
                      <span className="text-[9.5px] uppercase font-bold text-gray-500 block">Avg. Order Value</span>
                      <span className="text-base font-bold text-[#29251F] font-mono mt-0.5 block">
                        ₹{(selectedCustomer.avgOrderValue || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="bg-[#FAF9F6] p-3 rounded-lg border border-[#E9E1D6]">
                      <span className="text-[9.5px] uppercase font-bold text-gray-500 block">Highest Order</span>
                      <span className="text-base font-bold text-[#29251F] font-mono mt-0.5 block">
                        ₹{(selectedCustomer.highestOrderValue || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="bg-[#FAF9F6] p-3 rounded-lg border border-[#E9E1D6]">
                      <span className="text-[9.5px] uppercase font-bold text-[#C5A059] block">Reward Points</span>
                      <span className="text-base font-bold text-[#29251F] font-mono mt-0.5 block">
                        {(selectedCustomer.rewardPoints || 0).toLocaleString('en-IN')} pts
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 bg-[#FAF9F6] p-3 rounded-lg border border-[#E9E1D6]">
                      <span className="text-[9.5px] uppercase font-bold text-emerald-700 block">Store Credit</span>
                      <span className="text-base font-bold text-emerald-800 font-mono mt-0.5 block">
                        ₹{(selectedCustomer.storeCredit || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Verification Status */}
                <div className="bg-white border border-[#E9E1D6] rounded-xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-[11px] uppercase font-bold text-[#A68B66] tracking-wider flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-[#C5A059]" />
                      Verification Status
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">KYC & Compliance</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-1 text-center">
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex flex-col items-center justify-center">
                      <CheckCircle2 size={16} className="text-emerald-600 mb-1" />
                      <span className="text-[10px] uppercase font-bold text-gray-600">Email Verified</span>
                      <span className="text-xs font-bold text-emerald-700">
                        {selectedCustomer.isEmailVerified !== false ? 'Verified' : 'Pending'}
                      </span>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex flex-col items-center justify-center">
                      <CheckCircle2 size={16} className="text-emerald-600 mb-1" />
                      <span className="text-[10px] uppercase font-bold text-gray-600">Phone Verified</span>
                      <span className="text-xs font-bold text-emerald-700">
                        {selectedCustomer.isPhoneVerified !== false ? 'Verified' : 'Pending'}
                      </span>
                    </div>

                    <div className="p-3 bg-[#FAF9F6] rounded-lg border border-[#E9E1D6] flex flex-col items-center justify-center">
                      <Award size={16} className="text-[#C5A059] mb-1" />
                      <span className="text-[10px] uppercase font-bold text-gray-600">KYC Status</span>
                      <span className="text-xs font-bold text-[#29251F]">
                        {selectedCustomer.kycStatus || 'Verified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 6. Customer Notes Section (Internal Notes) */}
                <div className="bg-white border border-[#E9E1D6] rounded-xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-[11px] uppercase font-bold text-[#A68B66] tracking-wider flex items-center gap-1.5">
                      <FileText size={13} className="text-[#C5A059]" />
                      Customer Notes Section (Internal Atelier Memo)
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">Confidential</span>
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="space-y-2">
                    <textarea
                      rows="2"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add an internal note about this patron (e.g. VIP custom hem requests, preferred colors, concierge follow-ups)..."
                      className="w-full p-2.5 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-xs text-[#29251F] focus:outline-none focus:border-[#C5A059]"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmittingNote || !noteText.trim()}
                        className={`px-4 py-1.5 rounded-lg bg-[#29251F] text-[#FAF9F6] hover:bg-[#C5A059] font-bold text-xs transition flex items-center gap-1.5 ${
                          isSubmittingNote || !noteText.trim() ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Send size={12} />
                        <span>{isSubmittingNote ? 'Saving...' : 'Add Note'}</span>
                      </button>
                    </div>
                  </form>

                  {/* Notes List */}
                  <div className="space-y-2 pt-2">
                    {Array.isArray(selectedCustomer.internalNotes) &&
                    selectedCustomer.internalNotes.length > 0 ? (
                      selectedCustomer.internalNotes.map((n, i) => (
                        <div
                          key={i}
                          className="p-3 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                            <span className="font-bold text-[#A68B66]">{n.author || 'Admin'}</span>
                            <span>{formatLuxeDate(n.createdAt)}</span>
                          </div>
                          <p className="text-gray-800 leading-relaxed">{n.note}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-400 py-3 text-xs italic">
                        No internal notes recorded yet. Use the field above to add notes.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 bg-white border-t border-[#E9E1D6] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleBlock(selectedCustomer)}
                  className={`px-4 py-2 rounded-lg font-bold text-xs transition cursor-pointer border ${
                    selectedCustomer.status === 'Blocked'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  {selectedCustomer.status === 'Blocked' ? 'Unblock Patron' : 'Block Patron'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      handleOpenEdit(selectedCustomer);
                    }}
                    className="px-4 py-2 rounded-lg bg-[#29251F] hover:bg-[#C5A059] text-white font-bold text-xs transition cursor-pointer"
                  >
                    Edit Customer Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* 6. ADD CUSTOMER MODAL DIALOG                                        */}
      {/* ================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-[#E9E1D6] max-w-xl w-full rounded-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#FAF9F6] border-b border-[#E9E1D6] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#29251F] text-[#C5A059] flex items-center justify-center font-bold">
                  <Plus size={16} />
                </div>
                <div>
                  <h3 className="font-serif-luxury text-xl font-bold text-[#29251F]">
                    Enroll New Patron
                  </h3>
                  <p className="text-[11px] text-[#A68B66]">
                    Direct registration into Ni'maah Luxe MongoDB Atlas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[#E9E1D6] text-gray-500 hover:text-[#29251F] flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#29251F] mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomerForm.name}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                    placeholder="e.g. Khalid Nawaz"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-[#29251F] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#29251F] mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newCustomerForm.email}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                    placeholder="khalid@gmail.com"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg font-mono text-[#29251F] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#29251F] mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg font-mono text-[#29251F] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#29251F] mb-1">City</label>
                  <input
                    type="text"
                    value={newCustomerForm.city}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, city: e.target.value })}
                    placeholder="Delhi"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-[#29251F] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#29251F] mb-1">Customer Type</label>
                  <select
                    value={newCustomerForm.customerType}
                    onChange={(e) =>
                      setNewCustomerForm({ ...newCustomerForm, customerType: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg font-bold text-[#29251F] focus:outline-none focus:border-[#C5A059] cursor-pointer"
                  >
                    <option value="New">New</option>
                    <option value="Regular">Regular</option>
                    <option value="Premium">Premium</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#29251F] mb-1">Status</label>
                  <select
                    value={newCustomerForm.status}
                    onChange={(e) =>
                      setNewCustomerForm({ ...newCustomerForm, status: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg font-bold text-[#29251F] focus:outline-none focus:border-[#C5A059] cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#29251F] mb-1">Full Delivery Address</label>
                  <input
                    type="text"
                    value={newCustomerForm.fullAddress}
                    onChange={(e) =>
                      setNewCustomerForm({ ...newCustomerForm, fullAddress: e.target.value })
                    }
                    placeholder="Suite, Street, Atelier, Landmark, Delhi - 110001"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-[#29251F] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#29251F] mb-1">Initial Concierge Note</label>
                  <input
                    type="text"
                    value={newCustomerForm.initialNote}
                    onChange={(e) =>
                      setNewCustomerForm({ ...newCustomerForm, initialNote: e.target.value })
                    }
                    placeholder="Optional welcome note or sizing instructions"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-[#29251F] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#E9E1D6]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-white border border-[#E9E1D6] hover:bg-slate-50 text-gray-700 font-bold rounded-lg transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 bg-[#29251F] hover:bg-[#C5A059] text-white font-bold rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>{actionLoading ? 'Enrolling...' : 'Enroll Patron'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* 7. EDIT CUSTOMER MODAL DIALOG                                       */}
      {/* ================================================================== */}
      {isEditModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-[#E9E1D6] max-w-xl w-full rounded-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#FAF9F6] border-b border-[#E9E1D6] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#29251F] text-[#C5A059] flex items-center justify-center font-bold">
                  <Edit2 size={16} />
                </div>
                <div>
                  <h3 className="font-serif-luxury text-xl font-bold text-[#29251F]">
                    Edit Customer Details
                  </h3>
                  <p className="text-[11px] text-[#A68B66] font-mono">
                    {selectedCustomer.customerId || 'CUST001'} • {selectedCustomer.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[#E9E1D6] text-gray-500 hover:text-[#29251F] flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEditCustomer} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#29251F] mb-1">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editCustomerForm.name}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-[#29251F] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#29251F] mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editCustomerForm.email}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg font-mono text-[#29251F] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#29251F] mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editCustomerForm.phone}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg font-mono text-[#29251F] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#29251F] mb-1">City</label>
                  <input
                    type="text"
                    value={editCustomerForm.city}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-[#29251F] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#29251F] mb-1">Customer Type</label>
                  <select
                    value={editCustomerForm.customerType}
                    onChange={(e) =>
                      setEditCustomerForm({ ...editCustomerForm, customerType: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg font-bold text-[#29251F] focus:outline-none focus:border-[#C5A059] cursor-pointer"
                  >
                    <option value="New">New</option>
                    <option value="Regular">Regular</option>
                    <option value="Premium">Premium</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#29251F] mb-1">Status</label>
                  <select
                    value={editCustomerForm.status}
                    onChange={(e) =>
                      setEditCustomerForm({ ...editCustomerForm, status: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg font-bold text-[#29251F] focus:outline-none focus:border-[#C5A059] cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#29251F] mb-1">Reward Points</label>
                  <input
                    type="number"
                    value={editCustomerForm.rewardPoints}
                    onChange={(e) =>
                      setEditCustomerForm({ ...editCustomerForm, rewardPoints: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg font-mono text-[#29251F] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#29251F] mb-1">Store Credit (₹)</label>
                  <input
                    type="number"
                    value={editCustomerForm.storeCredit}
                    onChange={(e) =>
                      setEditCustomerForm({ ...editCustomerForm, storeCredit: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg font-mono text-[#29251F] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#29251F] mb-1">Full Delivery Address</label>
                  <input
                    type="text"
                    value={editCustomerForm.fullAddress}
                    onChange={(e) =>
                      setEditCustomerForm({ ...editCustomerForm, fullAddress: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E9E1D6] rounded-lg text-[#29251F] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#E9E1D6]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-white border border-[#E9E1D6] hover:bg-slate-50 text-gray-700 font-bold rounded-lg transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 bg-[#29251F] hover:bg-[#C5A059] text-white font-bold rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
                >
                  <Check size={14} />
                  <span>{actionLoading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
