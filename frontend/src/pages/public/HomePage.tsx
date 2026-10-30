import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { departmentService } from '../../services/departmentService';
import { Doctor, Department } from '../../types';
import { DoctorCard } from '../../components/doctors/DoctorCard';
import { BookingModal } from '../../components/appointments/BookingModal';
import { useAuth } from '../../contexts/AuthContext';
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
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    doctorService.getAllDoctors().then(setDoctors).catch(console.error);
    departmentService.getDepartments().then(setDepartments).catch(console.error);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedDept) params.set('departmentId', selectedDept);
    navigate(`/doctors?${params.toString()}`);
  };

  const handleBook = (doctor: Doctor) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/doctors');
      return;
    }
    setBookingDoctor(doctor);
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
                Sri Lanka's Leading Digital Hospital Booking System
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-950 tracking-tight leading-[1.12]">
                Your Health, Scheduled with <span className="text-teal-600">Precision.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Connect with the finest medical specialists across Sri Lanka's top hospitals, view verified real-time slot availability, and reserve consultations in seconds.
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
                    placeholder="Search doctors in Colombo, Kandy or Galle..."
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
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Instant SMS & In-app Confirmation
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600" /> Board-Certified SL Specialists
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
                      <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400">Clinical Center</span>
                      <h4 className="text-base font-bold">Comprehensive Multi-Specialty Care</h4>
                    </div>
                  </div>
                </div>

                {/* Floating Metric Pill */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-2xl font-black text-navy-950">99.4%</span>
                    <p className="text-xs font-semibold text-slate-500">Patient Satisfaction</p>
                  </div>
                  <div className="h-10 w-px bg-slate-200" />
                  <div>
                    <span className="text-2xl font-black text-teal-700">15 min</span>
                    <p className="text-xs font-semibold text-slate-500">Average Consultation</p>
                  </div>
                  <div className="h-10 w-px bg-slate-200" />
                  <div>
                    <span className="text-2xl font-black text-navy-950">24/7</span>
                    <p className="text-xs font-semibold text-slate-500">Care Assistance</p>
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
            Our intelligent booking engine eliminates endless waiting lines and provides guaranteed reservation slots.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-150 shadow-sm relative group hover:border-teal-500 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-navy-50 text-navy-900 font-black text-xl flex items-center justify-center mb-6 group-hover:bg-navy-900 group-hover:text-white transition-colors">
              01
            </div>
            <h3 className="text-lg font-extrabold text-navy-950 mb-2">Find Your Doctor</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Filter by specialty, department, ratings, and doctor qualifications to select the right medical expert.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-150 shadow-sm relative group hover:border-teal-500 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 font-black text-xl flex items-center justify-center mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              02
            </div>
            <h3 className="text-lg font-extrabold text-navy-950 mb-2">Select Live Time Slot</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Choose an available date and pick an active 30-minute consultation window that matches your personal schedule.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-150 shadow-sm relative group hover:border-teal-500 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 font-black text-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              03
            </div>
            <h3 className="text-lg font-extrabold text-navy-950 mb-2">Instant Confirmation</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your appointment is instantly locked into the doctor’s calendar with zero risk of double booking or delays.
            </p>
          </div>
        </div>
      </section>

      {/* 3. POPULAR MEDICAL SPECIALTIES */}
      <section className="bg-slate-100/70 py-20 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs uppercase font-extrabold text-teal-700 tracking-wider">Clinical Excellence</span>
              <h2 className="text-3xl font-black text-navy-950 mt-1">Specialized Medical Departments</h2>
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

      {/* 4. FEATURED DOCTORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs uppercase font-extrabold text-teal-700 tracking-wider">Verified Practitioners</span>
            <h2 className="text-3xl font-black text-navy-950 mt-1">Featured Doctors & Specialists</h2>
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

      {/* 5. HOSPITAL SERVICES BANNER / EMERGENCY CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-navy-950 text-white p-8 sm:p-12 relative overflow-hidden shadow-2xl border border-navy-900">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-400">Emergency & Critical Care</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Need Immediate Medical Attention?</h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Our 24-hour Emergency Department and trauma unit are staffed with board-certified trauma surgeons and emergency triage nurses ready around the clock.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="tel:1990"
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm px-6 py-3 rounded-xl transition-colors shadow-lg"
              >
                Call Emergency: 1990 (Suwa Seriya)
              </a>
              <Link
                to="/about"
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors backdrop-blur-sm"
              >
                Hospital Location & Map
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <BookingModal
        doctor={bookingDoctor}
        isOpen={!!bookingDoctor}
        onClose={() => setBookingDoctor(null)}
        onSuccess={() => {
          navigate('/patient/appointments');
        }}
      />
    </div>
  );
};
