import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Phone, Mail, MapPin, Clock, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-300 pt-16 pb-12 border-t border-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-navy-900/60">
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 text-navy-950 flex items-center justify-center font-bold">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                East Care<span className="text-teal-400">Point</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Book doctor appointments at hospitals across Batticaloa in one place. Choose a hospital and doctor, pick a time, and we reserve it for you at that hospital.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              East Care Point is an independent booking service and is not operated by the hospitals listed.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Patient Services</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/doctors" className="hover:text-teal-300 transition-colors">Find a Specialist</Link>
              </li>
              <li>
                <Link to="/departments" className="hover:text-teal-300 transition-colors">Hospital Departments</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-teal-300 transition-colors">Book an Appointment</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-teal-300 transition-colors">Our Facilities & Technology</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Departments */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Specialties</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/doctors?specialty=Cardiology" className="hover:text-teal-300 transition-colors">Cardiology & Heart Center</Link></li>
              <li><Link to="/doctors?specialty=Neurology" className="hover:text-teal-300 transition-colors">Neurology & Brain Sciences</Link></li>
              <li><Link to="/doctors?specialty=Orthopaedics" className="hover:text-teal-300 transition-colors">Orthopaedics & Joint Care</Link></li>
              <li><Link to="/doctors?specialty=Paediatrics" className="hover:text-teal-300 transition-colors">Paediatric & Child Health</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact & Emergency */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Emergency & Contact</h4>
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <span>Batticaloa, Sri Lanka</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-5 h-5 text-teal-400 shrink-0" />
              <span className="font-semibold text-white">Emergency Hotline: 1990 (Suwa Seriya)</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-5 h-5 text-teal-400 shrink-0" />
              <span>support@eastcarepoint.lk</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-5 h-5 text-teal-400 shrink-0" />
              <span>OPD Hours: Mon - Sat, 8:00 AM - 8:00 PM</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 East Care Point, Batticaloa. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with care for health & healing</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};
