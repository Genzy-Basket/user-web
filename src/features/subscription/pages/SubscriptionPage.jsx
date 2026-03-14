import { useState } from "react";
import { CalendarCheck, Plus } from "lucide-react";
import ActiveSubscriptions from "../components/ActiveSubscriptions";
import NewSubscription from "../components/NewSubscription";

const SubscriptionPage = () => {
  const [activeTab, setActiveTab] = useState("active");

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Subscriptions</h1>
              <p className="text-xs text-slate-500">Daily essentials delivered fresh</p>
            </div>
          </div>
        </div>

        {/* Tabs — full-width like app */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border text-center
              ${
                activeTab === "active"
                  ? "bg-brand text-white border-brand shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
          >
            My Subscriptions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("new")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border flex items-center justify-center gap-1.5
              ${
                activeTab === "new"
                  ? "bg-brand text-white border-brand shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
          >
            <Plus className="w-3.5 h-3.5" />
            New Subscription
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "active" && (
          <ActiveSubscriptions onNewSubscription={() => setActiveTab("new")} />
        )}

        {activeTab === "new" && (
          <NewSubscription onBack={() => setActiveTab("active")} />
        )}
      </div>
    </div>
  );
};

export default SubscriptionPage;
