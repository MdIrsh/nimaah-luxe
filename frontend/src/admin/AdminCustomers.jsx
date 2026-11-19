import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar, ShoppingBag, ShieldCheck, Search } from 'lucide-react';
import api from '../services/api';

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/admin/customers');
      if (res.data?.success && res.data.data?.customers) {
        setCustomers(res.data.data.customers);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.addresses?.[0]?.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E9E1D6] pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#A68B66] font-semibold">
            Patron Management
          </span>
          <h1 className="font-serif-luxury text-3xl text-[#29251F] mt-1">
            Registered Customers & Patron Portfolio
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            View customer contact information, order volumes, and lifetime value across MongoDB Atlas.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E9E1D6] text-xs focus:outline-none focus:border-[#C5A059]"
          />
        </div>
      </div>

      {/* Customer Count Stat */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-[#E9E1D6] p-5">
          <span className="text-[10px] uppercase tracking-wider text-gray-500">Total Patrons</span>
          <p className="text-2xl font-serif-luxury font-bold text-[#29251F] mt-1">{customers.length}</p>
        </div>
        <div className="bg-white border border-[#E9E1D6] p-5">
          <span className="text-[10px] uppercase tracking-wider text-gray-500">Active Shoppers</span>
          <p className="text-2xl font-serif-luxury font-bold text-emerald-700 mt-1">
            {customers.filter((c) => c.orderCount > 0).length}
          </p>
        </div>
        <div className="bg-white border border-[#E9E1D6] p-5">
          <span className="text-[10px] uppercase tracking-wider text-gray-500">Avg. Orders / Customer</span>
          <p className="text-2xl font-serif-luxury font-bold text-[#C5A059] mt-1">
            {customers.length > 0
              ? (
                  customers.reduce((acc, c) => acc + (c.orderCount || 0), 0) / customers.length
                ).toFixed(1)
              : '0.0'}
          </p>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white border border-[#E9E1D6] overflow-x-auto shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FAF9F6] border-b border-[#E9E1D6] text-[10.5px] uppercase tracking-widest text-[#29251F] font-semibold">
              <th className="py-3 px-4">Patron Details</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4 text-center">Orders</th>
              <th className="py-3 px-4 text-right">Lifetime Spend</th>
              <th className="py-3 px-4">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#FAF9F6] text-xs">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500">
                  Loading patron directory from MongoDB...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500">
                  No customers found matching "{search}".
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c._id} className="hover:bg-[#FAF9F6]/60 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#E9E1D6] overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {c.avatar ? (
                          <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <Users size={14} className="text-[#A68B66]" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-[#29251F]">{c.name}</p>
                        <p className="text-[11px] text-gray-500 font-mono">{c.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-gray-600">
                    <div className="flex items-center space-x-1.5">
                      <Phone size={12} className="text-[#A68B66]" />
                      <span>{c.addresses?.[0]?.phone || 'Not provided'}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-gray-600">
                    {c.addresses?.[0]?.city
                      ? `${c.addresses[0].city}, ${c.addresses[0].state || 'India'}`
                      : 'No address saved'}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF9F6] text-[#29251F] border border-[#E9E1D6]">
                      {c.orderCount || 0}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right font-semibold text-[#29251F]">
                    ₹{(c.totalSpent || 0).toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-4 text-gray-500 text-[11px]">
                    {new Date(c.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCustomers;
