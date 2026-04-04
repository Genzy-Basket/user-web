import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useAuth } from "../../auth/hooks/useAuth";
import { useWallet } from "../../wallet/hooks/useWallet";
import AddressForm from "../components/AddressForm";
import MemberForm from "../components/MemberForm";
import MemberCard from "../components/MemberCard";
import {
  MapPin,
  Users,
  Edit2,
  Plus,
  X,
  Mail,
  Phone,
  CheckCircle,
  LogOut,
  ChevronRight,
  Wallet,
  CalendarDays,
  MessageSquare,
  Receipt,
  MessageCircle,
  FileText,
  Undo2,
  ShieldCheck,
  Trash2,
  Smartphone,
} from "lucide-react";
import PageLayout from "../../../components/PageLayout";

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
    updateProfile,
    saveAddress,
    addMember,
    updateMember,
    removeMember,
    clearError,
  } = useUser();

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
  });

  const startEditingProfile = () => {
    setProfileForm({
      fullName: profile?.fullName || "",
      email: profile?.email || "",
      phoneNumber: profile?.phoneNumber || "",
    });
    setIsEditingProfile(true);
  };

  const handleProfileSave = async () => {
    const result = await updateProfile(profileForm);
    if (result.success) setIsEditingProfile(false);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };

  const handleAddressSave = async (addressData) => {
    const result = await saveAddress(addressData);
    if (result.success) setIsEditingAddress(false);
  };

  const handleMemberAdd = async (memberData) => {
    const result = await addMember(memberData);
    if (result.success) setIsAddingMember(false);
  };

  const handleMemberUpdate = async (memberData) => {
    const result = await updateMember(editingMember._id, memberData);
    if (result.success) setEditingMember(null);
  };

  const handleMemberDelete = async (memberId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      await removeMember(memberId);
    }
  };

  if (!profile && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-brand"></div>
      </div>
    );
  }

  return (
    <PageLayout
      title="Profile"
      green
      maxWidth="max-w-2xl"
      headerRight={
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-white/12 rounded-[10px] text-white"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-[13px] font-semibold">Logout</span>
        </button>
      }
    >
      {/* ── Profile Card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-3">
        {isEditingProfile ? (
          <div className="space-y-3">
            <p className="font-bold text-slate-800">Edit Profile</p>
            <input
              type="text"
              value={profileForm.fullName}
              onChange={(e) =>
                setProfileForm((p) => ({ ...p, fullName: e.target.value }))
              }
              placeholder="Full Name"
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:border-emerald-400 focus:ring-emerald-200 transition-all text-sm"
            />
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) =>
                setProfileForm((p) => ({ ...p, email: e.target.value }))
              }
              placeholder="Email"
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:border-emerald-400 focus:ring-emerald-200 transition-all text-sm"
            />
            <input
              type="tel"
              value={profileForm.phoneNumber}
              onChange={(e) =>
                setProfileForm((p) => ({ ...p, phoneNumber: e.target.value }))
              }
              placeholder="Phone Number"
              maxLength={10}
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:border-emerald-400 focus:ring-emerald-200 transition-all text-sm"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="flex-1 py-2.5 border-2 border-slate-300 text-slate-700 rounded-xl font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleProfileSave}
                disabled={loading}
                className="flex-1 py-2.5 bg-brand text-white rounded-xl font-medium text-sm disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3.5">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-brand flex items-center justify-center text-white font-bold text-2xl">
              {profile?.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[17px] font-bold text-slate-800 truncate">
                {profile?.fullName || "User"}
              </p>
              {profile?.email && (
                <p className="text-[13px] text-slate-500 truncate flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  {profile.email}
                </p>
              )}
              {profile?.phoneNumber && (
                <p className="text-[13px] text-slate-500 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  {profile.phoneNumber}
                </p>
              )}
              {profile?.accountStatus === "approved" && (
                <p className="text-xs text-brand font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Approved
                </p>
              )}
            </div>
            <button
              onClick={startEditingProfile}
              className="shrink-0 p-2 text-slate-400 hover:text-slate-600"
            >
              <Edit2 className="w-4.5 h-4.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Wallet Card ── */}
      <Link
        to="/wallet"
        className="flex items-center gap-3 bg-brand rounded-2xl p-4 mb-3 text-white"
      >
        <Wallet className="w-7 h-7 shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-medium opacity-75">Wallet Balance</p>
          <p className="text-xl font-black">₹{balance.toFixed(2)}</p>
        </div>
        <div className="px-3 py-1.5 bg-white/20 rounded-full text-xs font-bold">
          Add Money
        </div>
      </Link>

      {/* ── Error ── */}
      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between text-sm">
          <span className="font-medium">{error}</span>
          <button onClick={clearError}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Address Section ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2 text-[15px]">
            <MapPin className="w-5 h-5 text-brand" />
            Delivery Address
          </h2>
          {profile?.address && !isEditingAddress && (
            <button
              onClick={() => setIsEditingAddress(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200"
            >
              <Edit2 className="w-3.5 h-3.5" />
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
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["House/Flat", profile.address.houseOrFlat],
                ["Street", profile.address.street],
                ["Area", profile.address.area],
                ["Pincode", profile.address.pincode],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[11px] text-slate-400 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Members Section ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2 text-[15px]">
            <Users className="w-5 h-5 text-brand" />
            Family Members
            {profile?.members?.length > 0 && (
              <span className="text-xs text-slate-400 font-normal">
                ({profile.members.length})
              </span>
            )}
          </h2>
          {!isAddingMember &&
            !editingMember &&
            (profile?.members?.length ?? 0) < 20 && (
              <button
                onClick={() => setIsAddingMember(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand text-white rounded-lg text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            )}
        </div>

        {(isAddingMember || editingMember) && (
          <div className="mb-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-sm font-semibold text-slate-800 mb-3">
              {editingMember ? "Edit Member" : "Add New Member"}
            </p>
            <MemberForm
              initialData={editingMember}
              onSubmit={editingMember ? handleMemberUpdate : handleMemberAdd}
              onCancel={() => {
                setIsAddingMember(false);
                setEditingMember(null);
              }}
              loading={loading}
            />
          </div>
        )}

        {profile?.members?.length > 0 ? (
          <div className="space-y-3">
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
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm mb-3">
                No members added yet
              </p>
              <button
                onClick={() => setIsAddingMember(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand text-white rounded-xl text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Member
              </button>
            </div>
          )
        )}
      </div>

      {/* ── Menu Items ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-3">
        <MenuItem
          icon={Receipt}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Transactions"
          subtitle="View all payments & wallet history"
          to="/wallet"
        />
        <div className="h-px bg-slate-100 mx-4" />
        <MenuItem
          icon={CalendarDays}
          iconBg="bg-emerald-50"
          iconColor="text-brand"
          label="Daily Subscriptions"
          subtitle="Milk, curd & coconut delivered daily"
          to="/subscriptions"
        />
        <div className="h-px bg-slate-100 mx-4" />
        <MenuItem
          icon={MessageSquare}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          label="Send Feedback"
          subtitle="Help us improve your experience"
          to="/feedback"
        />
        <div className="h-px bg-slate-100 mx-4" />
        <MenuItem
          icon={MessageCircle}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
          label="Contact Us"
          subtitle="Get help or reach out"
          to="/contact"
        />
        <div className="h-px bg-slate-100 mx-4" />
        <MenuItem
          icon={Smartphone}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          label="Download App"
          subtitle="Get the Android app for a better experience"
          to="/download"
        />
      </div>

      {/* ── Legal ── */}
      <p className="text-[11px] font-bold text-slate-400 tracking-wide ml-1 mb-2">
        LEGAL
      </p>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4">
        <MenuItem
          icon={FileText}
          iconBg="bg-slate-50"
          iconColor="text-slate-500"
          label="Terms & Conditions"
          to="/terms"
        />
        <div className="h-px bg-slate-100 mx-4" />
        <MenuItem
          icon={Undo2}
          iconBg="bg-slate-50"
          iconColor="text-slate-500"
          label="Refunds & Cancellations"
          to="/refunds"
        />
        <div className="h-px bg-slate-100 mx-4" />
        <MenuItem
          icon={ShieldCheck}
          iconBg="bg-slate-50"
          iconColor="text-slate-500"
          label="Privacy Policy"
          to="/privacy"
        />
        <div className="h-px bg-slate-100 mx-4" />
        <MenuItem
          icon={Trash2}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          label="Delete Account"
          subtitle="Permanently delete your account and data"
          to="/delete-account"
        />
      </div>

      {/* ── Footer ── */}
      <p className="text-center text-xs text-slate-400 pb-6">
        © {new Date().getFullYear()} Genzy Basket. All rights reserved.
      </p>
    </PageLayout>
  );
};

/* ── Reusable menu item ── */
const MenuItem = ({ icon: Icon, iconBg, iconColor, label, subtitle, to }) => (
  <Link to={to} className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors">
    <div
      className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}
    >
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      {subtitle && (
        <p className="text-xs text-slate-500 truncate">{subtitle}</p>
      )}
    </div>
    <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
  </Link>
);

export default ProfilePage;
