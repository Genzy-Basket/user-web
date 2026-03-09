import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-lg font-bold text-slate-800 mb-2">{title}</h2>
    <div className="text-sm text-slate-600 space-y-2">{children}</div>
  </div>
);

const TermsAndConditions = () => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand mb-6 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl font-black text-slate-900 mb-2">
          Terms &amp; Conditions
        </h1>
        <p className="text-xs text-slate-400 mb-6">
          Last updated: March 2026
        </p>

        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using the Genzy Basket platform (website and mobile
            application), you agree to be bound by these Terms &amp; Conditions.
            If you do not agree, please do not use our services.
          </p>
        </Section>

        <Section title="2. Services">
          <p>
            Genzy Basket provides an online platform for ordering fresh
            vegetables, fruits, and grocery items for home delivery. All
            products are listed with prices in Indian Rupees (INR).
          </p>
        </Section>

        <Section title="3. User Accounts">
          <p>
            You must provide accurate and complete information during
            registration. You are responsible for maintaining the
            confidentiality of your account credentials and for all activities
            under your account.
          </p>
        </Section>

        <Section title="4. Orders and Payments">
          <p>
            All orders are subject to availability. We reserve the right to
            cancel or refuse any order. Payments can be made via online payment
            methods (powered by Cashfree Payments) or Cash on Delivery (COD)
            where available.
          </p>
          <p>
            Prices are inclusive of applicable taxes unless stated otherwise. A
            delivery charge may apply based on your order and location.
          </p>
        </Section>

        <Section title="5. Delivery">
          <p>
            We aim to deliver orders within the estimated delivery window shown
            at checkout. Delivery times may vary due to demand, weather, or
            other factors beyond our control.
          </p>
        </Section>

        <Section title="6. Product Quality">
          <p>
            We take care to ensure the quality and freshness of our products. If
            you receive a damaged or incorrect item, please contact us within 24
            hours of delivery for a resolution.
          </p>
        </Section>

        <Section title="7. Limitation of Liability">
          <p>
            Genzy Basket shall not be liable for any indirect, incidental, or
            consequential damages arising from the use of our platform or
            services. Our liability is limited to the value of the order in
            question.
          </p>
        </Section>

        <Section title="8. Changes to Terms">
          <p>
            We may update these terms from time to time. Continued use of the
            platform after changes constitutes acceptance of the revised terms.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            For questions about these terms, contact us at{" "}
            <a
              href="mailto:nandishhmn@gmail.com"
              className="text-brand hover:underline"
            >
              nandishhmn@gmail.com
            </a>{" "}
            or call{" "}
            <a
              href="tel:+916363784290"
              className="text-brand hover:underline"
            >
              +91 6363784290
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  </div>
);

export default TermsAndConditions;
