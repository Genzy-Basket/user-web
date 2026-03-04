import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-lg font-bold text-slate-800 mb-2">{title}</h2>
    <div className="text-sm text-slate-600 space-y-2">{children}</div>
  </div>
);

const RefundsAndCancellations = () => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#009661] mb-6 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl font-black text-slate-900 mb-2">
          Refunds &amp; Cancellations
        </h1>
        <p className="text-xs text-slate-400 mb-6">
          Last updated: March 2026
        </p>

        <Section title="Cancellation Policy">
          <p>
            You may cancel your order before it has been dispatched for
            delivery. Once an order is marked as "Out for Delivery", it cannot
            be cancelled.
          </p>
          <p>
            To cancel an order, go to <strong>Orders</strong> in the app and
            select the order you wish to cancel. If you face any issues, contact
            us at{" "}
            <a
              href="mailto:nandishhmn@gmail.com"
              className="text-[#009661] hover:underline"
            >
              nandishhmn@gmail.com
            </a>{" "}
            or call{" "}
            <a
              href="tel:+916363784290"
              className="text-[#009661] hover:underline"
            >
              +91 6363784290
            </a>
            .
          </p>
        </Section>

        <Section title="Refund Policy">
          <p>
            Refund requests can be raised within <strong>7 days</strong> of
            delivery. Refunds are applicable in the following cases:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Damaged or spoiled products received</li>
            <li>Wrong items delivered</li>
            <li>Missing items from your order</li>
            <li>Order cancelled before dispatch</li>
          </ul>
        </Section>

        <Section title="How Refunds Are Processed">
          <p>
            <strong>Online payments:</strong> Refunds will be credited back to
            the original payment method within 5-7 business days after approval.
          </p>
          <p>
            <strong>Cash on Delivery (COD):</strong> Refunds for COD orders will
            be processed via bank transfer. You may be asked to provide your
            bank account details.
          </p>
        </Section>

        <Section title="Non-Refundable Cases">
          <p>Refunds will not be provided in the following scenarios:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Change of mind after delivery</li>
            <li>Refund request raised after 7 days of delivery</li>
            <li>Products used or consumed partially</li>
          </ul>
        </Section>

        <Section title="Contact Us">
          <p>
            For refund or cancellation queries, reach out to us at{" "}
            <a
              href="mailto:nandishhmn@gmail.com"
              className="text-[#009661] hover:underline"
            >
              nandishhmn@gmail.com
            </a>{" "}
            or call{" "}
            <a
              href="tel:+916363784290"
              className="text-[#009661] hover:underline"
            >
              +91 6363784290
            </a>
            . We aim to resolve all queries within 48 hours.
          </p>
        </Section>
      </div>
    </div>
  </div>
);

export default RefundsAndCancellations;
