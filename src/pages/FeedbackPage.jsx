import { useState, useEffect } from "react";
import { Star, MessageSquarePlus, Loader2 } from "lucide-react";
import apiClient from "../api/api.client";
import { errorBus } from "../api/errorBus";
import PageLayout from "../components/PageLayout";

const FeedbackPage = () => {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Previous feedbacks ──────────────────────────────────────────────────────
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/feedbacks");
      setFeedbacks(res.data?.feedbacks ?? []);
    } catch {
      // silent — list is non-critical
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      errorBus.emit("Please select a star rating", "error");
      return;
    }
    if (description.trim().length < 10) {
      errorBus.emit("Description must be at least 10 characters", "error");
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post("/feedbacks", {
        rating,
        description: description.trim(),
      });
      errorBus.emit("Feedback submitted! Thank you.", "success");
      setRating(0);
      setDescription("");
      fetchFeedbacks();
    } catch (err) {
      errorBus.emit(err.message || "Could not submit feedback", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const h = d.getHours() % 12 || 12;
    const m = String(d.getMinutes()).padStart(2, "0");
    const p = d.getHours() < 12 ? "AM" : "PM";
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${h}:${m} ${p}`;
  };

  const renderStars = (count, size = "w-4 h-4") =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < count ? "text-amber-400 fill-current" : "text-slate-200"
        }`}
      />
    ));

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <PageLayout title="Feedback">
      {/* ── Feedback Form ──────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8"
      >
        <h2 className="text-xl font-black text-slate-900 mb-1">
          Share your experience
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          We'd love to hear what you think about Genzy Basket.
        </p>

        {/* Star rating */}
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Rating
        </label>
        <div className="flex items-center gap-1 mb-6">
          {Array.from({ length: 5 }, (_, i) => {
            const starValue = i + 1;
            const active = starValue <= (hoveredStar || rating);
            return (
              <button
                key={starValue}
                type="button"
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHoveredStar(starValue)}
                onMouseLeave={() => setHoveredStar(0)}
                className="p-1 rounded-lg transition-transform hover:scale-110 focus:outline-none"
                aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    active ? "text-amber-400 fill-current" : "text-slate-200"
                  }`}
                />
              </button>
            );
          })}
          {rating > 0 && (
            <span className="ml-2 text-sm font-semibold text-slate-500">
              {rating}/5
            </span>
          )}
        </div>

        {/* Description */}
        <label
          htmlFor="feedback-desc"
          className="block text-sm font-bold text-slate-700 mb-2"
        >
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          id="feedback-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell us what you liked or what we can improve..."
          rows={4}
          minLength={10}
          required
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-brand focus:outline-none text-sm font-medium resize-none placeholder:text-slate-400"
        />
        <p className="text-xs text-slate-400 mt-1 mb-5">
          Minimum 10 characters
        </p>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="bg-brand text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-dark disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting…
            </>
          ) : (
            "Submit Feedback"
          )}
        </button>
      </form>

      {/* ── Previous Feedbacks ──────────────────────────────────────────── */}
      <h2 className="text-xl font-black text-slate-900 mb-4">Your Feedbacks</h2>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-7 h-7 text-brand animate-spin" />
        </div>
      )}

      {!loading && feedbacks.length === 0 && (
        <div className="text-center py-12">
          <MessageSquarePlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">
            No feedbacks yet. Be the first to share!
          </p>
        </div>
      )}

      {!loading && feedbacks.length > 0 && (
        <div className="space-y-3">
          {feedbacks.map((fb) => (
            <div
              key={fb._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
            >
              <div className="flex items-center gap-1 mb-2">
                {renderStars(fb.rating)}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mb-3">
                {fb.description}
              </p>
              <p className="text-xs text-slate-400">
                {formatDate(fb.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default FeedbackPage;
