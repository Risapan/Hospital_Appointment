import React from 'react';
import { ShieldCheck, Award, Heart, Activity, CheckCircle, Users } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700">About the Network</span>
        <h1 className="text-3xl sm:text-4xl font-black text-navy-950">Delivering Exceptional Healthcare Across Sri Lanka</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Serving the Sri Lankan community since 2012, our network of clinics and hospital partnerships have pioneered clinical precision and seamless digital health systems.
        </p>
      </div>

      {/* Facilities & Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-150 text-center space-y-1">
          <span className="text-3xl font-black text-navy-950">120,000+</span>
          <p className="text-xs text-slate-500 font-semibold">Patients Treated Annually</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-150 text-center space-y-1">
          <span className="text-3xl font-black text-teal-700">50+</span>
          <p className="text-xs text-slate-500 font-semibold">Board-Certified Doctors</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-150 text-center space-y-1">
          <span className="text-3xl font-black text-navy-950">99.8%</span>
          <p className="text-xs text-slate-500 font-semibold">Appointment Accuracy</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-150 text-center space-y-1">
          <span className="text-3xl font-black text-teal-700">24/7</span>
          <p className="text-xs text-slate-500 font-semibold">Emergency Triage</p>
        </div>
      </div>

      {/* Mission & Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-navy-950">Our Clinical Mission</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our mission is to make first-class healthcare transparent, accessible, and dignified for every citizen of Sri Lanka. By integrating digital appointment management directly with clinical scheduling, we eradicate unnecessary wait times and elevate quality of care.
          </p>
          <ul className="space-y-2.5 text-xs text-slate-700 font-medium pt-2">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Real-time reservation with database-enforced concurrency
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Compliance with Sri Lankan medical privacy and data regulations
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Full transparency in physician credentials and fees
            </li>
          </ul>
        </div>

        <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-100 h-80">
          <img
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800"
            alt="Modern Hospital Facilities"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};
