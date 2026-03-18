import { useState, useEffect } from "react";
import { User, Calendar, Activity } from "lucide-react";

const BELLY_SIZE_OPTIONS = [
  { value: "small", label: "Small", emoji: "🟢" },
  { value: "standard", label: "Standard", emoji: "🟡" },
  { value: "hearty", label: "Hearty", emoji: "🔴" },
];

const MemberForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    bellySize: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || "",
        age: initialData.age?.toString() || "",
        bellySize: initialData.bellySize || "",
      });
    }
  }, [initialData]);

  const validate = () => {
    const e = {};
    if (!formData.fullName?.trim()) e.fullName = "Full name is required";
    else if (formData.fullName.trim().length < 2)
      e.fullName = "Name must be at least 2 characters";
    if (!formData.age) e.age = "Age is required";
    else if (isNaN(formData.age) || formData.age < 0 || formData.age > 150)
      e.age = "Please enter a valid age";
    if (!formData.bellySize) e.bellySize = "Belly size is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ ...formData, age: parseInt(formData.age, 10) });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <User className="inline w-4 h-4 mr-1.5" />
          Full Name
        </label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="e.g., John Doe"
          className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
            errors.fullName
              ? "border-red-300 focus:border-red-400 focus:ring-red-200"
              : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-200"
          }`}
        />
        {errors.fullName && (
          <p className="mt-1.5 text-sm text-red-600">{errors.fullName}</p>
        )}
      </div>

      {/* Age */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <Calendar className="inline w-4 h-4 mr-1.5" />
          Age
        </label>
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          min="0"
          max="150"
          placeholder="e.g., 25"
          className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
            errors.age
              ? "border-red-300 focus:border-red-400 focus:ring-red-200"
              : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-200"
          }`}
        />
        {errors.age && (
          <p className="mt-1.5 text-sm text-red-600">{errors.age}</p>
        )}
      </div>

      {/* Belly Size */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <Activity className="inline w-4 h-4 mr-1.5" />
          Belly Size
        </label>
        <div className="grid grid-cols-3 gap-3">
          {BELLY_SIZE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                handleChange({
                  target: { name: "bellySize", value: option.value },
                })
              }
              className={`px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm flex items-center justify-center gap-2 ${
                formData.bellySize === option.value
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <span className="text-lg">{option.emoji}</span>
              {option.label}
            </button>
          ))}
        </div>
        {errors.bellySize && (
          <p className="mt-1.5 text-sm text-red-600">{errors.bellySize}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-medium shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : initialData ? "Update Member" : "Add"}
        </button>
      </div>
    </form>
  );
};

export default MemberForm;
