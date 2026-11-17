import React, { useState } from 'react';
import { User, Mail, MapPin, Plus, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CustomerProfile = () => {
  const { user } = useAuth();
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const [addresses, setAddresses] = useState(
    user?.addresses || [
      {
        fullName: 'Aisha Al-Mansoor',
        phone: '+91 8618621612',
        street: '14 Royal Crescent, Boat Club Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postalCode: '600028',
        isDefault: true,
      },
    ]
  );

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (newAddress.fullName && newAddress.street) {
      setAddresses([...addresses, { ...newAddress, isDefault: false }]);
      setIsAddingAddress(false);
      setNewAddress({ fullName: '', phone: '', street: '', city: '', state: '', postalCode: '' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Info */}
      <div className="bg-white border border-[#E9E1D6] p-6 space-y-4">
        <h3 className="font-serif-luxury text-xl text-[#29251F] border-b border-[#E9E1D6] pb-3">
          Client Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block uppercase tracking-wider text-gray-400 mb-1">Full Legal Name</label>
            <p className="font-semibold text-sm text-[#29251F]">{user?.name || 'Aisha Al-Mansoor'}</p>
          </div>

          <div>
            <label className="block uppercase tracking-wider text-gray-400 mb-1">Email Address</label>
            <p className="font-semibold text-sm text-[#29251F]">{user?.email || 'customer@stylehub.com'}</p>
          </div>

          <div>
            <label className="block uppercase tracking-wider text-gray-400 mb-1">Privilege Membership</label>
            <p className="text-sm text-[#A68B66] font-semibold">StyleHub Haute Privé Patron</p>
          </div>

          <div>
            <label className="block uppercase tracking-wider text-gray-400 mb-1">Atelier Concierge Access</label>
            <p className="text-sm text-emerald-700 font-semibold">Active & Complimentary</p>
          </div>
        </div>
      </div>

      {/* Addresses */}
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
            <h4 className="font-semibold text-[#29251F] uppercase tracking-wider">New Sanctuary Destination</h4>
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
                placeholder="Postal Code"
                required
                value={newAddress.postalCode}
                onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                className="p-2 bg-white border border-[#E9E1D6]"
              />
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-[#29251F] text-white uppercase tracking-widest text-[11px] font-semibold"
              >
                Save Destination
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr, idx) => (
            <div key={idx} className="p-4 border border-[#E9E1D6] bg-[#FAF9F6] relative space-y-1.5 text-xs">
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
      </div>
    </div>
  );
};

export default CustomerProfile;
