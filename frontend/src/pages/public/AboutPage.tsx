import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Hospital, Stethoscope, CalendarCheck, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700">About East Care Point</span>
        <h1 className="text-3xl sm:text-4xl font-black text-navy-950">One place to book doctors at Batticaloa hospitals</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Many hospitals in Batticaloa don't have their own online booking. East Care Point lets you choose a hospital
          and doctor online, and we make the reservation at that hospital for you.
        </p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-150 space-y-2">
          <Hospital className="w-8 h-8 text-teal-700" />
          <h2 className="font-extrabold text-navy-950">1. Choose a hospital</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Start with the hospital you want to visit, such as EMS Hospital, New Pioneer Hospital, GV Hospital or Designer Smiles.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-150 space-y-2">
          <Stethoscope className="w-8 h-8 text-teal-700" />
          <h2 className="font-extrabold text-navy-950">2. Pick a doctor and time</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            See the doctors available at that hospital, their fees in rupees, and their open appointment times.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-150 space-y-2">
          <CalendarCheck className="w-8 h-8 text-teal-700" />
          <h2 className="font-extrabold text-navy-950">3. We reserve it</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            East Care Point reserves your appointment at the hospital. You get a confirmation in your account and pay at the hospital.
          </p>
        </div>
      </div>

      {/* Why */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-navy-950">Why we started</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Getting an appointment often means phoning the hospital or travelling there just to book. We want people in
            Batticaloa to see which doctors are available and reserve a time from home, whichever hospital they choose.
          </p>
          <ul className="space-y-2.5 text-xs text-slate-700 font-medium pt-2">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Several hospitals, one account
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Doctor fees shown up front in rupees
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Cancel or reschedule online
            </li>
          </ul>
          <Link to="/hospitals" className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-800">
            See hospitals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-100 h-80">
          <img
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800"
            alt="Hospital corridor"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center max-w-2xl mx-auto">
        East Care Point is an independent booking service. It is not operated by, and does not speak for, the hospitals
        listed. For medical emergencies call 1990 (Suwa Seriya) or go to the nearest emergency unit.
      </p>
    </div>
  );
};
