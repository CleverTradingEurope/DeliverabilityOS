import React, { useState } from 'react';
import { Mail, ArrowRight, Server, Database, Cloud, LayoutDashboard } from 'lucide-react';
import FeaturesGrid from './components/FeaturesGrid';
import InteractiveDemo from './components/InteractiveDemo';
import ComparisonTable from './components/ComparisonTable';
import ValidationDashboard from './components/ValidationDashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');

  if (currentView === 'dashboard') {
    return <ValidationDashboard onBack={() => setCurrentView('landing')} />;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <Mail className="w-6 h-6 text-indigo-600" />
              <span className="text-xl font-bold tracking-tight">Deliverability<span className="text-indigo-600">OS</span></span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition">Features</a>
              <a href="#demo" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition">Live Demo</a>
              <a href="#comparison" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition">Compare</a>
              <a href="#infrastructure" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition">Infrastructure</a>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center text-sm font-medium text-zinc-700 hover:text-indigo-600 transition"
              >
                <LayoutDashboard className="w-4 h-4 mr-1.5" />
                Go to Console
              </button>
              <button className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition shadow-sm">
                Get Early Access
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 lg:pt-48 lg:pb-32 bg-white relative overflow-hidden">
        {/* Background Decorative blob */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-600/20 mb-8 bg-indigo-50/50">
              Beyond Static Validation
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-zinc-900 mb-8 leading-tight">
              The Real-Time <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Deliverability Engine</span>
            </h1>
            <p className="text-xl text-zinc-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Stop paying for "Unknown" results. Transform your email lists with predictive intelligence, deep Catch-All resolution, and self-healing auto-correction.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full transition shadow-md w-full sm:w-auto"
              >
                Launch Console <ArrowRight className="ml-2 w-4 h-4" />
              </button>
              <a href="#comparison" className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-zinc-900 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-full transition w-full sm:w-auto">
                View Competitor Matrix
              </a>
            </div>
          </div>
        </div>
      </section>

      <FeaturesGrid />
      
      <InteractiveDemo />
      
      <ComparisonTable />

      {/* Infrastructure Section */}
      <section className="py-24 bg-zinc-50" id="infrastructure">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Enterprise-Grade Architecture
            </h2>
            <p className="mt-4 text-lg text-zinc-600">
              Built for speed, IP safety, and maximum throughput.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-zinc-200 text-center relative z-10">
              <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Cloud className="w-6 h-6 text-zinc-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Layer 1: Edge</h3>
              <p className="text-sm text-zinc-500">Cloudflare Enterprise WAF & FastAPI Gateway</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 border border-zinc-200 text-center relative z-10 md:-mx-4 shadow-xl">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Database className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Layer 2: Processing</h3>
              <p className="text-sm text-zinc-500">Redis Cluster Queues & PostgreSQL/ClickHouse Logs</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 border border-zinc-200 text-center relative z-10">
              <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Server className="w-6 h-6 text-zinc-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Layer 3: SMTP Nodes</h3>
              <p className="text-sm text-zinc-500">Bare-Metal Pool with custom rDNS & Proxy Rotators</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Mail className="w-5 h-5 text-indigo-600" />
            <span className="text-lg font-bold tracking-tight text-zinc-900">Deliverability<span className="text-indigo-600">OS</span></span>
          </div>
          <p className="text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} Deliverability OS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

