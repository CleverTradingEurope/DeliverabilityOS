import React from 'react';
import { ShieldCheck, Target, Activity, Wand2, Briefcase, Zap } from 'lucide-react';

export default function FeaturesGrid() {
  const features = [
    {
      title: 'Zero-Unknown Guarantee',
      description: 'Stop paying for timeouts. If the receiving server blocks the connection, the credit is automatically refunded. 100% fair billing.',
      icon: <ShieldCheck className="h-6 w-6 text-indigo-600" />,
      color: 'bg-indigo-100'
    },
    {
      title: 'Catch-All Intelligence',
      description: 'Don\'t settle for "Risky". Our engine cross-references historical logs and B2B data to score probability of actual delivery on Catch-All domains.',
      icon: <Target className="h-6 w-6 text-emerald-600" />,
      color: 'bg-emerald-100'
    },
    {
      title: 'Self-Healing Lists',
      description: 'Detects typos (e.g., @gmial.com), corrects them on the fly, validates the new address, and returns the clean, ready-to-send contact.',
      icon: <Wand2 className="h-6 w-6 text-purple-600" />,
      color: 'bg-purple-100'
    },
    {
      title: 'Contextual Risk Scoring',
      description: 'Validation adapts to your goal. Is it a B2B cold outreach or a B2C newsletter? We adjust thresholds to prevent spam blocks based on context.',
      icon: <Briefcase className="h-6 w-6 text-amber-600" />,
      color: 'bg-amber-100'
    },
    {
      title: 'Zero-Friction SDK',
      description: 'A lightweight script for your web forms that silently corrects typos before submission without rejecting the conversion.',
      icon: <Zap className="h-6 w-6 text-sky-600" />,
      color: 'bg-sky-100'
    },
    {
      title: 'Sender Health Monitor',
      description: 'We audit your domain\'s DNS, SPF, DKIM, and Blacklist status concurrently while validating lists to protect your overall sender reputation.',
      icon: <Activity className="h-6 w-6 text-rose-600" />,
      color: 'bg-rose-100'
    }
  ];

  return (
    <section className="py-24 bg-zinc-50" id="features">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            6 Killer Features That Redefine Deliverability
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            We built a Deliverability Operating System (DOS) that actively fixes your lists and protects your reputation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-zinc-200 hover:shadow-md transition-shadow">
              <div className={`inline-flex items-center justify-center rounded-xl p-3 mb-6 ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-zinc-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
