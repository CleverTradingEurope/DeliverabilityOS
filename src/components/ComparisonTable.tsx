import React from 'react';
import { Check, X } from 'lucide-react';

export default function ComparisonTable() {
  const features = [
    {
      name: 'Credit Policy for "Unknown"',
      competitor: 'Charged regardless',
      us: 'Zero-Risk Billing (Auto-Refund)',
      usHighlight: true,
      desc: 'You only pay for definitive responses.'
    },
    {
      name: 'Catch-All Resolution',
      competitor: 'Tagged "Risky" (abandoned)',
      us: 'Deep Analysis Engine (35%+ recovered)',
      usHighlight: true,
      desc: 'Historical cross-referencing and sub-pattern SMTP analysis.'
    },
    {
      name: 'Spam Trap Detection',
      competitor: 'Static blacklists only',
      us: 'AI Pattern & Honeypot Detection',
      usHighlight: true,
      desc: 'Prevents catastrophic domain blocking prior to sending.'
    },
    {
      name: 'Typo Auto-Correction',
      competitor: 'Basic (@gmial -> @gmail)',
      us: 'Smart-Typo Repair & Auto-Recheck',
      usHighlight: true,
      desc: 'Corrects, re-validates in flight, and returns clean contact.'
    },
    {
      name: 'Inbox Simulation',
      competitor: 'Requires 3rd party tools',
      us: 'Built-in Placement Predictor',
      usHighlight: true,
      desc: 'Analyzes context + scoring to predict Inbox vs Spam.'
    },
    {
      name: 'SMTP Transparency Logs',
      competitor: 'Hidden / Black-box',
      us: 'Full Raw Inspection Logs',
      usHighlight: true,
      desc: 'Raw code, response times, and exact server node.'
    }
  ];

  return (
    <section className="py-24 bg-white text-zinc-900" id="comparison">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            More than just a "static validator"
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            See how we stack up against traditional tools like ZeroBounce, NeverBounce, and Bouncer.
          </p>
        </div>

        <div className="overflow-x-auto shadow-xl rounded-2xl ring-1 ring-zinc-200">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                <th scope="col" className="py-5 pl-6 pr-3 text-left text-sm font-semibold text-zinc-900 sm:pl-6 w-1/3">
                  Feature
                </th>
                <th scope="col" className="px-3 py-5 text-left text-sm font-semibold text-zinc-500 w-1/3">
                  Legacy Competitors
                </th>
                <th scope="col" className="px-3 py-5 text-left text-sm font-semibold text-indigo-600 w-1/3 bg-indigo-50/50">
                  Deliverability OS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white">
              {features.map((feature, index) => (
                <tr key={index} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-5 pl-6 pr-3 text-sm sm:pl-6">
                    <div className="font-medium text-zinc-900">{feature.name}</div>
                    <div className="text-zinc-500 text-xs mt-1">{feature.desc}</div>
                  </td>
                  <td className="px-3 py-5 text-sm text-zinc-500 flex items-center">
                    <X className="w-4 h-4 text-rose-400 mr-2 flex-shrink-0" />
                    {feature.competitor}
                  </td>
                  <td className="px-3 py-5 text-sm font-medium bg-indigo-50/20">
                    <div className="flex items-center text-indigo-700">
                      <Check className="w-4 h-4 text-indigo-600 mr-2 flex-shrink-0" />
                      {feature.us}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
