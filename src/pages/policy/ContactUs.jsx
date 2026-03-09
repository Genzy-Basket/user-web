import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const ContactUs = () => (
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
        <h1 className="text-2xl font-black text-slate-900 mb-6">Contact Us</h1>

        <p className="text-slate-600 mb-6">
          Have questions, feedback, or need help with your order? We'd love to
          hear from you. Reach out using any of the methods below.
        </p>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
            <Phone className="w-5 h-5 text-brand mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-700">Phone</p>
              <a
                href="tel:+916363784290"
                className="text-sm text-brand hover:underline"
              >
                +91 6363784290
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
            <Mail className="w-5 h-5 text-brand mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-700">Email</p>
              <a
                href="mailto:nandishhmn@gmail.com"
                className="text-sm text-brand hover:underline"
              >
                nandishhmn@gmail.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
            <MapPin className="w-5 h-5 text-brand mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-700">Business</p>
              <p className="text-sm text-slate-600">Genzy Basket</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            We typically respond within 24 hours on business days.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default ContactUs;
