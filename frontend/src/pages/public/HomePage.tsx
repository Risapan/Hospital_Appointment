import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { departmentService } from '../../services/departmentService';
import { hospitalService } from '../../services/hospitalService';
import { Doctor, Department, Hospital } from '../../types';
import { DoctorCard } from '../../components/doctors/DoctorCard';
import {
  Calendar,
  Search,
  ShieldCheck,
  Clock,
  Heart,
  Activity,
  ArrowRight,
  CheckCircle,
  Users,
  Award,
  Sparkles,
  Hospital as HospitalIcon,
  MapPin,
  Phone,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  useEffect(() => {
    doctorService.getAllDoctors().then(setDoctors).catch(console.error);
    departmentService.getDepartments().then(setDepartments).catch(console.error);
    hospitalService.getHospitals().then(setHospitals).catch(console.error);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedDept) params.set('departmentId', selectedDept);
    navigate(`/doctors?${params.toString()}`);
  };

  // Booking starts by asking which hospital the patient prefers
  const handleBook = (doctor: Doctor) => {
    navigate(`/book?doctorId=${doctor.id}`);
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-navy-50/60 via-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-bold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Doctor booking for hospitals in Batticaloa
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-950 tracking-tight leading-[1.12]">
                Book your doctor at any hospital, <span className="text-teal-600">in one place.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Many hospitals don't have their own booking website. Choose a hospital and doctor on East Care Point, pick a time, and we reserve the appointment at that hospital for you.
              </p>

              {/* Quick Search Bar Box */}
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-slate-150 grid grid-cols-1 sm:grid-cols-12 gap-3"
              >
                <div className="sm:col-span-6 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search doctor name or specialty..."
                    className="w-full pl-10 pr-3 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 placeholder:text-slate-400 font-medium"
                  />
                </div>

                <div className="sm:col-span-4">
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full px-3.5 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white font-medium text-slate-700"
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full h-full bg-navy-900 hover:bg-navy-800 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm py-3 sm:py-0"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Key Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Instant in-app confirmation
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600" /> {hospitals.length} hospitals in Batticaloa
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" /> Reduced Waiting Time
                </span>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100">
                <div className="relative h-72 rounded-2xl overflow-hidden bg-slate-100 mb-6">
                  <img
                    src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800"
                    alt="Doctors Consultation"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent flex items-end p-5">
                    <div className="text-white">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400">East Care Point</span>
                      <h4 className="text-base font-bold">One booking site for Batticaloa hospitals</h4>
                    </div>
                  </div>
                </div>

                {/* Floating Metric Pill */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-2xl font-black text-navy-950">{hospitals.length}</span>
                    <p className="text-xs font-semibold text-slate-500">Hospitals</p>
                  </div>
                  <div className="h-10 w-px bg-slate-200" />
                  <div>
                    <span className="text-2xl font-black text-teal-700">{doctors.length}</span>
                    <p className="text-xs font-semibold text-slate-500">Doctors</p>
                  </div>
                  <div className="h-10 w-px bg-slate-200" />
                  <div>
                    <span className="text-2xl font-black text-navy-950">24/7</span>
                    <p className="text-xs font-semibold text-slate-500">Online Booking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW APPOINTMENT BOOKING WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs uppercase font-extrabold text-teal-700 tracking-wider">Fast & Hassle Free</span>
          <h2 className="text-3xl font-black text-navy-950 sm:text-4xl">How to Book in 3 Easy Steps</h2>
          <p className="text-slate-600 text-sm">
            No need to visit or call the hospital first. We make the reservation at the hospital for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-150 shadow-sm relative group hover:border-teal-500 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-navy-50 text-navy-900 font-black text-xl flex items-center justify-center mb-6 group-hover:bg-navy-900 group-hover:text-white transition-colors">
              01
            </div>
            <h3 className="text-lg font-extrabold text-navy-950 mb-2">Choose Hospital & Doctor</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pick a hospital in Batticaloa, then find a doctor by name, specialty or department.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-150 shadow-sm relative group hover:border-teal-500 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 font-black text-xl flex items-center justify-center mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              02
            </div>
            <h3 className="text-lg font-extrabold text-navy-950 mb-2">Select Live Time Slot</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Choose a date and an available time at that hospital that suits you.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-150 shadow-sm relative group hover:border-teal-500 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 font-black text-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              03
            </div>
            <h3 className="text-lg font-extrabold text-navy-950 mb-2">We Reserve It For You</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              East Care Point reserves your time at the hospital. Just arrive at the hospital at your appointment time.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOSPITALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs uppercase font-extrabold text-teal-700 tracking-wider">Where you can book</span>
            <h2 className="text-3xl font-black text-navy-950 mt-1">Hospitals in Batticaloa</h2>
          </div>
          <Link to="/hospitals" className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-800">
            View All Hospitals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {hospitals.filter((h) => h.sector !== 'Government').concat(hospitals.filter((h) => h.sector === 'Government')).slice(0, 4).map((h) => (
            <Link
              key={h.id}
              to={`/hospitals/${h.id}`}
              className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group flex flex-col"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <HospitalIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-navy-950 group-hover:text-teal-700 transition-colors">{h.name}</h3>
              <p className="text-xs font-semibold text-slate-400">{h.type}</p>
              {h.address && (
                <p className="mt-2 text-xs text-slate-500 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {h.address}
                </p>
              )}
              {h.phone && (
                <p className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 shrink-0" /> {h.phone}
                </p>
              )}
              <span className="mt-auto pt-4 inline-flex items-center gap-1 text-xs font-bold text-teal-700">
                Book at this hospital <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. POPULAR MEDICAL SPECIALTIES */}
      <section className="bg-slate-100/70 py-20 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs uppercase font-extrabold text-teal-700 tracking-wider">Browse by specialty</span>
              <h2 className="text-3xl font-black text-navy-950 mt-1">Medical Departments</h2>
            </div>
            <Link
              to="/departments"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-800"
            >
              View All Departments <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept) => (
              <Link
                key={dept.id}
                to={`/doctors?departmentId=${dept.id}`}
                className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-navy-950 group-hover:text-teal-700 transition-colors">
                  {dept.name}
                </h3>
                <p className="mt-2 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {dept.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-teal-700">
                  Book Specialist <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FEATURED DOCTORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs uppercase font-extrabold text-teal-700 tracking-wider">Doctors you can book</span>
            <h2 className="text-3xl font-black text-navy-950 mt-1">Featured Doctors</h2>
          </div>
          <Link
            to="/doctors"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-800"
          >
            Explore Complete Directory ({doctors.length}) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.slice(0, 3).map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onBook={handleBook}
              onViewProfile={(doc) => navigate(`/doctors/${doc.id}`)}
            />
          ))}
        </div>
      </section>

      {/* 6. EMERGENCY NOTICE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-navy-950 text-white p-8 sm:p-12 relative overflow-hidden shadow-2xl border border-navy-900">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-400">Emergency</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Need Immediate Medical Attention?</h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              East Care Point is for planned appointments. In an emergency, call 1990 for a free Suwa Seriya ambulance or go straight to the nearest hospital's emergency unit.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="tel:1990"
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm px-6 py-3 rounded-xl transition-colors shadow-lg"
              >
                Call Emergency: 1990 (Suwa Seriya)
              </a>
              <Link
                to="/hospitals"
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors backdrop-blur-sm"
              >
                Find a Hospital
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
