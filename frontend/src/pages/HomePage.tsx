import { Link } from "react-router-dom";
import { Clipboard, Calendar, Shield, Clock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Clipboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">
                MediConnect
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm text-gray-700 hover:text-gray-900 px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Healthcare Connected,
              <br />
              Simplified
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              Seamless telemedicine platform connecting patients with healthcare
              professionals. Book consultations, manage medical records, and
              access care from anywhere.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                to="/register"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Sign Up Now
              </Link>
              <Link
                to="/login"
                className="bg-white text-gray-700 px-8 py-4 rounded-lg text-lg font-medium border-2 border-gray-300 hover:border-gray-400 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Easy Scheduling
              </h3>
              <p className="text-gray-600">
                Book appointments with healthcare professionals at your
                convenience. Manage your schedule effortlessly.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Secure & Private
              </h3>
              <p className="text-gray-600">
                Your medical data is protected with enterprise-grade security
                and GDPR compliance.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                24/7 Access
              </h3>
              <p className="text-gray-600">
                Access your medical records and consultation history anytime,
                anywhere, from any device.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                For Patients & Doctors
              </h2>
              <p className="text-lg text-gray-600">
                Comprehensive platform designed for both sides of healthcare
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-blue-50 rounded-2xl p-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  For Patients
                </h3>
                <ul className="space-y-4">
                  {[
                    "Find and book consultations with verified doctors",
                    "Access your complete medical history",
                    "Manage appointments and prescriptions",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 rounded-2xl p-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  For Doctors
                </h3>
                <ul className="space-y-4">
                  {[
                    "Manage your schedule and availability",
                    "Track patient consultations and history",
                    "Streamlined workflow for efficient care",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="bg-blue-600 rounded-3xl p-16 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-10">
              Join thousands of patients and healthcare professionals on
              MediConnect
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-blue-600 px-10 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Create Your Account
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Clipboard className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold">MediConnect</span>
            </div>
            <p className="text-sm">
              © 2026 MediConnect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
