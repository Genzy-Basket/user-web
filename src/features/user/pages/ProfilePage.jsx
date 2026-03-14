import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useAuth } from "../../auth/hooks/useAuth";
import { useWallet } from "../../wallet/hooks/useWallet";
import AddressForm from "../components/AddressForm";
import MemberForm from "../components/MemberForm";
import MemberCard from "../components/MemberCard";
import {
  User,
  MapPin,
  Users,
  Edit2,
  Plus,
  X,
  Home,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  LogOut,
} from "lucide-react";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { balance, fetchWallet } = useWallet();

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);
  const {
    profile,
    loading,
    error,
    saveAddress,
    addMember,
    updateMember,
    removeMember,
    clearError,
  } = useUser();

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  // Handle Logout
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };

  // Handle address save
  const handleAddressSave = async (addressData) => {
    const result = await saveAddress(addressData);
    if (result.success) {
      setIsEditingAddress(false);
    }
  };

  // Handle member add
  const handleMemberAdd = async (memberData) => {
    const result = await addMember(memberData);
    if (result.success) {
      setIsAddingMember(false);
    }
  };

  // Handle member update
  const handleMemberUpdate = async (memberData) => {
    const result = await updateMember(editingMember._id, memberData);
    if (result.success) {
      setEditingMember(null);
    }
  };

  // Handle member delete with confirmation
  const handleMemberDelete = async (memberId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      await removeMember(memberId);
    }
  };

  if (!profile && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto"></div>
          <p className="mt-6 text-slate-600 font-medium text-lg">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Main Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="w-24 h-24 rounded-2xl bg-brand flex items-center justify-center text-white font-bold text-4xl shadow-lg shadow-brand/20">
                {profile?.fullName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                  {profile?.fullName || "User"}
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    {profile?.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    {profile?.phoneNumber}
                  </span>
                  {profile?.accountStatus === "approved" && (
                    <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Approved
                    </span>
                  )}
                </div>
                {profile?.lastLoginAt && (
                  <p className="text-xs text-slate-500 mt-2 flex justify-center md:justify-start items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Last login: {new Date(profile.lastLoginAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Download App */}
              <Link
                to="/download"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-50 text-brand rounded-xl hover:bg-brand hover:text-white transition-all duration-200 font-bold border-2 border-emerald-100 shadow-sm"
              >
                <span className="text-lg">📱</span>
                Download App
              </Link>
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="group flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-200 font-bold border-2 border-red-100 shadow-sm"
              >
                <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Wallet Card */}
        <Link
          to="/wallet"
          className="block bg-brand rounded-2xl p-6 mb-6 text-white shadow-lg shadow-brand/20 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80 mb-1">Wallet Balance</p>
              <p className="text-3xl font-black tracking-tight">₹{balance.toFixed(2)}</p>
            </div>
            <div className="px-5 py-2.5 bg-white/20 rounded-xl font-bold text-sm">
              Add Money
            </div>
          </div>
        </Link>

        {/* Subscription Card */}
        <Link
          to="/subscriptions"
          className="block bg-white rounded-2xl border-2 border-slate-200 p-6 mb-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl">
                🥛
              </div>
              <div>
                <p className="font-bold text-slate-800">Daily Subscriptions</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Get milk, curd & coconut delivered daily
                </p>
              </div>
            </div>
            <div className="px-4 py-2 bg-brand text-white rounded-xl font-bold text-sm">
              Subscribe
            </div>
          </div>
        </Link>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center justify-between">
            <span className="font-medium">{error}</span>
            <button
              onClick={clearError}
              className="text-red-700 hover:text-red-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeTab === "profile"
                ? "bg-white text-emerald-600 shadow-lg border-2 border-emerald-200"
                : "bg-white/50 text-slate-600 hover:bg-white border-2 border-transparent"
            }`}
          >
            <Home className="inline w-4 h-4 mr-2" />
            Address
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeTab === "members"
                ? "bg-white text-emerald-600 shadow-lg border-2 border-emerald-200"
                : "bg-white/50 text-slate-600 hover:bg-white border-2 border-transparent"
            }`}
          >
            <Users className="inline w-4 h-4 mr-2" />
            Members ({profile?.members?.length || 0})
          </button>
        </div>

        {/* Tab Content: Address */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <MapPin className="w-7 h-7 text-emerald-600" />
                Delivery Address
              </h2>
              {profile?.address && !isEditingAddress && (
                <button
                  onClick={() => setIsEditingAddress(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>

            {isEditingAddress || !profile?.address ? (
              <AddressForm
                initialData={profile?.address}
                onSubmit={handleAddressSave}
                onCancel={
                  profile?.address ? () => setIsEditingAddress(false) : null
                }
                loading={loading}
              />
            ) : (
              <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">House/Flat</p>
                    <p className="font-medium text-slate-800">
                      {profile.address.houseOrFlat}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Street</p>
                    <p className="font-medium text-slate-800">
                      {profile.address.street}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Area</p>
                    <p className="font-medium text-slate-800">
                      {profile.address.area}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Pincode</p>
                    <p className="font-medium text-slate-800">
                      {profile.address.pincode}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Members */}
        {activeTab === "members" && (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <Users className="w-7 h-7 text-emerald-600" />
                Family Members
              </h2>
              {!isAddingMember && !editingMember && (profile?.members?.length ?? 0) < 20 && (
                <button
                  onClick={() => setIsAddingMember(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-medium shadow-lg shadow-emerald-200"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              )}
            </div>

            {(isAddingMember || editingMember) && (
              <div className="mb-8 bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  {editingMember ? "Edit Member" : "Add New Member"}
                </h3>
                <MemberForm
                  initialData={editingMember}
                  onSubmit={
                    editingMember ? handleMemberUpdate : handleMemberAdd
                  }
                  onCancel={() => {
                    setIsAddingMember(false);
                    setEditingMember(null);
                  }}
                  loading={loading}
                />
              </div>
            )}

            {profile?.members?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {profile.members.map((member) => (
                  <MemberCard
                    key={member._id}
                    member={member}
                    onEdit={setEditingMember}
                    onDelete={handleMemberDelete}
                    loading={loading}
                  />
                ))}
              </div>
            ) : (
              !isAddingMember && (
                <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                  <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium mb-2">
                    No members added yet
                  </p>
                  <p className="text-slate-500 text-sm mb-6">
                    Add family members to personalize their meal plans
                  </p>
                  <button
                    onClick={() => setIsAddingMember(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-medium shadow-lg shadow-emerald-200"
                  >
                    <Plus className="w-5 h-5" />
                    Add Your First Member
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
