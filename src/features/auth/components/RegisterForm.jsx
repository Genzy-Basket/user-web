import { useState } from "react";
import { Eye, EyeOff, MapPin, UserCircle } from "lucide-react";
import { validateRegisterForm } from "../utils/validation";

const RegisterForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: {
      houseOrFlat: "",
      street: "",
      area: "",
      pincode: "",
      geoLocation: {
        type: "Point",
        coordinates: [0, 0],
      },
    },
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setErrors((prev) => ({ ...prev, coordinates: "" }));

    if (!navigator.geolocation) {
      setErrors((prev) => ({
        ...prev,
        coordinates: "Geolocation is not supported by your browser",
      }));
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            geoLocation: {
              type: "Point",
              coordinates: [
                position.coords.longitude,
                position.coords.latitude,
              ],
            },
          },
        }));
        setLocationLoading(false);
      },
      (error) => {
        let errorMessage = "Unable to retrieve location";
        if (error.code === 1) {
          errorMessage = "Location permission denied";
        } else if (error.code === 2) {
          errorMessage = "Location unavailable";
        }
        setErrors((prev) => ({ ...prev, coordinates: errorMessage }));
        setLocationLoading(false);
      },
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    const { confirmPassword, ...submitData } = formData;
    const validationErrors = validateRegisterForm(submitData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(submitData);
  };

  const hasLocation =
    formData.address.geoLocation.coordinates[0] !== 0 ||
    formData.address.geoLocation.coordinates[1] !== 0;

  const inputClass = (fieldName) =>
    `w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
      errors[fieldName] ? "border-red-300 focus:border-red-400 focus:ring-red-200" : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-200"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ── Personal Information ────────────────────────────────────────── */}
      <fieldset>
        <legend className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-5">
          <UserCircle className="w-5 h-5 text-brand" aria-hidden="true" />
          Personal Information
        </legend>

        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={inputClass("fullName")}
              placeholder="Enter your full name"
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
              aria-invalid={!!errors.fullName}
            />
            {errors.fullName && (
              <p id="fullName-error" className="mt-1 text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              maxLength={10}
              className={inputClass("phoneNumber")}
              placeholder="10-digit phone number"
              aria-describedby={errors.phoneNumber ? "phoneNumber-error" : undefined}
              aria-invalid={!!errors.phoneNumber}
            />
            {errors.phoneNumber && (
              <p id="phoneNumber-error" className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Email (Optional) */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Email (Optional)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass("email")}
              placeholder="your@email.com"
              aria-describedby={errors.email ? "email-error" : undefined}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={inputClass("password")}
                placeholder="Minimum 6 characters"
                aria-describedby={errors.password ? "password-error" : undefined}
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Eye className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={inputClass("confirmPassword")}
              placeholder="Re-enter your password"
              aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="mt-1 text-sm text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      {/* ── Delivery Address ────────────────────────────────────────────── */}
      <fieldset className="pt-6 border-t border-slate-200">
        <legend className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-5">
          <MapPin className="w-5 h-5 text-brand" aria-hidden="true" />
          Delivery Address
        </legend>

        <div className="space-y-4">
          {/* House/Flat & Street — side by side on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="houseOrFlat"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                House/Flat Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="houseOrFlat"
                name="houseOrFlat"
                value={formData.address.houseOrFlat}
                onChange={handleAddressChange}
                className={inputClass("houseOrFlat")}
                placeholder="e.g., Flat 301"
                aria-describedby={errors.houseOrFlat ? "houseOrFlat-error" : undefined}
                aria-invalid={!!errors.houseOrFlat}
              />
              {errors.houseOrFlat && (
                <p id="houseOrFlat-error" className="mt-1 text-sm text-red-600">{errors.houseOrFlat}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="street"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Street <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.address.street}
                onChange={handleAddressChange}
                className={inputClass("street")}
                placeholder="Street name"
                aria-describedby={errors.street ? "street-error" : undefined}
                aria-invalid={!!errors.street}
              />
              {errors.street && (
                <p id="street-error" className="mt-1 text-sm text-red-600">{errors.street}</p>
              )}
            </div>
          </div>

          {/* Area & Pincode — side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="area"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Area <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="area"
                name="area"
                value={formData.address.area}
                onChange={handleAddressChange}
                className={inputClass("area")}
                placeholder="Locality/Area"
                aria-describedby={errors.area ? "area-error" : undefined}
                aria-invalid={!!errors.area}
              />
              {errors.area && (
                <p id="area-error" className="mt-1 text-sm text-red-600">{errors.area}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="pincode"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.address.pincode}
                onChange={handleAddressChange}
                maxLength={6}
                className={inputClass("pincode")}
                placeholder="6-digit pincode"
                aria-describedby={errors.pincode ? "pincode-error" : undefined}
                aria-invalid={!!errors.pincode}
              />
              {errors.pincode && (
                <p id="pincode-error" className="mt-1 text-sm text-red-600">{errors.pincode}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Location <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              aria-busy={locationLoading}
              aria-label={
                locationLoading
                  ? "Getting your location"
                  : hasLocation
                    ? "Location captured. Click to refresh"
                    : "Get current location"
              }
              className={`w-full px-4 py-3 border rounded-xl text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 ${
                hasLocation
                  ? "border-brand-100 text-brand-dark bg-brand-50"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {locationLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand" />
                  Getting location...
                </>
              ) : hasLocation ? (
                <>
                  <svg
                    className="w-5 h-5 text-brand"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Location captured
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5" aria-hidden="true" />
                  Get Current Location
                </>
              )}
            </button>
            {hasLocation && (
              <p className="mt-1 text-xs text-slate-500">
                Coordinates:{" "}
                {formData.address.geoLocation.coordinates[1].toFixed(6)},{" "}
                {formData.address.geoLocation.coordinates[0].toFixed(6)}
              </p>
            )}
            {errors.coordinates && (
              <p className="mt-1 text-sm text-red-600" role="alert">{errors.coordinates}</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand text-white py-3 px-4 rounded-xl font-bold hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
};

export default RegisterForm;
