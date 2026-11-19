import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const CustomerProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(user);
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        if (res.data?.data) {
          setProfile(res.data.data);
          setAddresses(res.data.data.addresses || []);
        }
      } catch (err) {
        console.error('Could not load profile from MongoDB:', err.message);
      }
    };
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.street) return;

    setSaving(true);
    try {
      const res = await api.post('/users/address', newAddress);
      if (res.data?.data) {
        setAddresses(res.data.data);
      }
      setIsAddingAddress(false);
      setNewAddress({
        fullName: profile?.name || '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save address to MongoDB');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="bg-white border border-[#E9E1D6] p-8 text-center text-xs text-gray-500">
        Please sign in to view your profile.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Real Logged-in Client Info */}
      <div className="bg-white border border-[#E9E1D6] p-6 space-y-4">
        <h3 className="font-serif-luxury text-xl text-[#29251F] border-b border-[#E9E1D6] pb-3">
          Client Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block uppercase tracking-wider text-gray-400 mb-1">Full Name</label>
            <p className="font-semibold text-sm text-[#29251F]">{profile.name}</p>
          </div>

          <div>
            <label className="block uppercase tracking-wider text-gray-400 mb-1">Email Address</label>
            <p className="font-semibold text-sm text-[#29251F]">{profile.email}</p>
          </div>

          <div>
            <label className="block uppercase tracking-wider text-gray-400 mb-1">Account Role</label>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-[#C5A059] font-bold uppercase tracking-wider">{profile.role}</p>
              {(profile.role === 'admin' || user?.role === 'admin') && (
                <Link
                  to="/admin/dashboard"
                  className="px-2.5 py-1 bg-[#14110C] text-[#C5A059] hover:text-white border border-[#C5A059]/40 rounded-xs text-[10px] font-bold uppercase tracking-wider transition inline-flex items-center space-x-1"
                >
                  <ShieldCheck size={12} />
                  <span>Admin Panel &rarr;</span>
                </Link>
              )}
            </div>
          </div>

          <div>
            <label className="block uppercase tracking-wider text-gray-400 mb-1">Member Since</label>
            <p className="text-sm text-[#29251F]">
              {profile.createdAt
                ? new Date(profile.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })
                : 'Active'}
            </p>
          </div>
        </div>
      </div>

      {/* Saved Addresses from MongoDB */}
      <div className="bg-white border border-[#E9E1D6] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#E9E1D6] pb-3">
          <h3 className="font-serif-luxury text-xl text-[#29251F]">Saved Delivery Addresses</h3>
          <button
            onClick={() => setIsAddingAddress(!isAddingAddress)}
            className="flex items-center space-x-1.5 text-xs uppercase tracking-wider text-[#A68B66] font-semibold hover:underline"
          >
            <Plus size={14} />
            <span>Add New Address</span>
          </button>
        </div>

        {isAddingAddress && (
          <form onSubmit={handleAddAddress} className="bg-[#FAF9F6] p-4 border border-[#E9E1D6] space-y-3 text-xs">
            <h4 className="font-semibold text-[#29251F] uppercase tracking-wider">New Delivery Address</h4>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Full Name"
                required
                value={newAddress.fullName}
                onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                className="p-2 bg-white border border-[#E9E1D6]"
              />
              <input
                type="text"
                placeholder="Phone Number"
                required
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                className="p-2 bg-white border border-[#E9E1D6]"
              />
              <input
                type="text"
                placeholder="Street Address & Apt"
                required
                className="col-span-2 p-2 bg-white border border-[#E9E1D6]"
                value={newAddress.street}
                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
              />
              <input
                type="text"
                placeholder="City"
                required
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className="p-2 bg-white border border-[#E9E1D6]"
              />
              <input
                type="text"
                placeholder="State"
                required
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                className="p-2 bg-white border border-[#E9E1D6]"
              />
              <input
                type="text"
                placeholder="Postal Code"
                required
                value={newAddress.postalCode}
                onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                className="col-span-2 p-2 bg-white border border-[#E9E1D6]"
              />
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-[#29251F] text-white uppercase tracking-widest text-[11px] font-semibold"
              >
                {saving ? 'Saving...' : 'Save Address'}
              </button>
              <button
                type="button"
                onClick={() => setIsAddingAddress(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 uppercase tracking-widest text-[11px]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {addresses.length === 0 ? (
          <p className="text-xs text-gray-500">No saved delivery addresses yet. Add one above to speed up checkout.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr, idx) => (
              <div key={addr._id || idx} className="p-4 border border-[#E9E1D6] bg-[#FAF9F6] relative space-y-1.5 text-xs">
                {addr.isDefault && (
                  <span className="inline-block bg-[#29251F] text-[#FAF9F6] text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 mb-1">
                    Default Address
                  </span>
                )}
                <h4 className="font-semibold text-sm text-[#29251F]">{addr.fullName}</h4>
                <p className="text-gray-600">{addr.street}</p>
                <p className="text-gray-600">
                  {addr.city}, {addr.state} - {addr.postalCode}
                </p>
                <p className="text-gray-500">{addr.phone}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;
