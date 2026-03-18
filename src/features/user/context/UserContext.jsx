import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import userAPI from "../../../api/endpoints/user.api";
import { useApiCall } from "../../../api/use.apiCall";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(() => {
    try {
      const p = localStorage.getItem("gb_profile");
      return p ? JSON.parse(p) : null;
    } catch { return null; }
  });
  const [error, setError] = useState(null);

  // ── Wired API calls ──────────────────────────────────────────────────────
  const { execute: runFetchProfile, loading: fetchLoading } = useApiCall(
    userAPI.getProfile,
    { silent: true },
  );
  const { execute: runAddAddress, loading: addAddressLoading } = useApiCall(
    userAPI.addAddress,
    { successMessage: "Address saved!" },
  );
  const { execute: runUpdateAddress, loading: updateAddressLoading } =
    useApiCall(userAPI.updateAddress, { successMessage: "Address updated!" });
  const { execute: runAddMember, loading: addMemberLoading } = useApiCall(
    userAPI.addMember,
    { successMessage: "Member added!" },
  );
  const { execute: runUpdateMember, loading: updateMemberLoading } = useApiCall(
    userAPI.updateMember,
    { successMessage: "Member updated!" },
  );
  const { execute: runRemoveMember, loading: removeMemberLoading } = useApiCall(
    userAPI.removeMember,
    { successMessage: "Member removed." },
  );
  const { execute: runUpdateProfile, loading: updateProfileLoading } = useApiCall(
    userAPI.updateProfile,
    { successMessage: "Profile updated!" },
  );

  const loading =
    fetchLoading ||
    addAddressLoading ||
    updateAddressLoading ||
    addMemberLoading ||
    updateMemberLoading ||
    removeMemberLoading ||
    updateProfileLoading;

  // ── Helpers ──────────────────────────────────────────────────────────────
  /**
   * useApiCall returns null when the call fails (error is toasted automatically).
   * Wrap every action so callers always get { success, data } — never null.
   */
  const wrap = (response) => response ?? { success: false };

  // ── Actions ──────────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) return;
    const response = await runFetchProfile();
    if (response?.success) {
      setProfile(response.data);
      try { localStorage.setItem("gb_profile", JSON.stringify(response.data)); } catch {}
    }
  }, [isAuthenticated, runFetchProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveAddress = useCallback(
    async (addressData) => {
      const run = profile?.address ? runUpdateAddress : runAddAddress;
      const response = wrap(await run(addressData));
      if (response.success) setProfile(response.data);
      return response;
    },
    [profile, runAddAddress, runUpdateAddress],
  );

  const addMember = useCallback(
    async (memberData) => {
      const response = wrap(await runAddMember(memberData));
      if (response.success) setProfile(response.data);
      return response;
    },
    [runAddMember],
  );

  const updateMember = useCallback(
    async (memberId, memberData) => {
      const response = wrap(await runUpdateMember(memberId, memberData));
      if (response.success) setProfile(response.data);
      return response;
    },
    [runUpdateMember],
  );

  const removeMember = useCallback(
    async (memberId) => {
      const response = wrap(await runRemoveMember(memberId));
      if (response.success) setProfile(response.data);
      return response;
    },
    [runRemoveMember],
  );

  const updateProfile = useCallback(
    async (data) => {
      const response = wrap(await runUpdateProfile(data));
      if (response.success) setProfile(response.data);
      return response;
    },
    [runUpdateProfile],
  );

  const clearError = useCallback(() => setError(null), []);

  const hasAddress = !!profile?.address;
  const hasMembers = (profile?.members?.length ?? 0) > 0;

  const value = useMemo(
    () => ({
      profile,
      loading,
      error,
      clearError,
      fetchProfile,
      updateProfile,
      saveAddress,
      addMember,
      updateMember,
      removeMember,
      hasAddress,
      hasMembers,
    }),
    [
      profile,
      loading,
      error,
      clearError,
      fetchProfile,
      updateProfile,
      saveAddress,
      addMember,
      updateMember,
      removeMember,
      hasAddress,
      hasMembers,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
