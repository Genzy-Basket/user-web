import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import NewSubscription from "../components/NewSubscription";

const NewSubscriptionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="sticky top-0 z-40 bg-brand px-4 py-3.5"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.875rem)" }}
      >
        <div className="flex items-center max-w-2xl mx-auto">
          <button onClick={() => navigate("/subscriptions")} className="p-1 -ml-1 mr-3 text-white">
            <ArrowLeft className="w-5.5 h-5.5" />
          </button>
          <h1 className="text-lg font-black text-white">New Subscription</h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-4 pb-36">
        <NewSubscription onBack={() => navigate("/subscriptions")} />
      </div>
    </div>
  );
};

export default NewSubscriptionPage;
