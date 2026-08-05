import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Loader2, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

const MOCK_RESPONSE = {
  "email": "juan.perez@gmaill.com",
  "status": "undeliverable",
  "sub_status": "syntax_typo_detected",
  "score": 15,
  "execution_time_ms": 310,
  "value_adds": {
    "zero_waste_guarantee": {
      "credit_charged": true,
      "refunded": false,
      "reason": "Definitive status reached"
    },
    "auto_correction": {
      "has_suggestion": true,
      "suggested_email": "juan.perez@gmail.com",
      "suggested_email_status": "deliverable",
      "confidence_score": 99
    },
    "catch_all_analysis": {
      "is_catch_all": false,
      "deliverability_probability_percentage": null
    },
    "contextual_risk": {
      "safe_for_b2c_newsletter": false,
      "safe_for_b2b_outreach": false,
      "recommended_action": "use_suggested_email"
    },
    "smtp_transparency_log": {
      "mx_used": "gmail-smtp-in.l.google.com",
      "response_code": 550,
      "raw_server_message": "550-5.1.1 The email account that you tried to reach does not exist."
    }
  }
};

export default function InteractiveDemo() {
  const [email, setEmail] = useState('juan.perez@gmaill.com');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setResult(null);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setResult(MOCK_RESPONSE);
    }, 1200);
  };

  return (
    <section className="py-24 bg-zinc-950 text-white border-y border-zinc-800" id="demo">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Live API Simulation
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            See the Deliverability OS engine in action. Try entering an email with a typo to see our Self-Healing List technology.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Input Form */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-indigo-400" />
              Test an Email Address
            </h3>
            
            <form onSubmit={handleValidate} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-zinc-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-xl bg-zinc-950 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="e.g. name@company.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Analyzing...
                  </>
                ) : (
                  'Validate Email'
                )}
              </button>
            </form>

            <div className="mt-8 space-y-4">
              <div className="flex items-start">
                <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-zinc-400">
                  <strong className="text-zinc-200">Zero-Waste Guarantee active.</strong> If we can't definitively verify this email, your credit will be automatically refunded.
                </p>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-0 shadow-2xl overflow-hidden h-[600px] flex flex-col relative">
            <div className="bg-zinc-900 px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-sm font-mono text-zinc-400">API Response</h3>
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 font-mono text-sm">
              {!result && !isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                  <Search className="w-12 h-12 mb-4 opacity-50" />
                  <p>Awaiting API Request...</p>
                </div>
              )}
              
              {isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p>Performing SMTP Handshake & Heuristic Analysis...</p>
                </div>
              )}
              
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <pre className="text-zinc-300 whitespace-pre-wrap break-words">
                    <span className="text-indigo-400">{`{`}</span>
                    {`\n  `}
                    <span className="text-sky-300">"email"</span>
                    <span className="text-zinc-400">: </span>
                    <span className="text-amber-300">"{result.email}"</span>
                    {`,\n  `}
                    <span className="text-sky-300">"status"</span>
                    <span className="text-zinc-400">: </span>
                    <span className="text-rose-400">"{result.status}"</span>
                    {`,\n  `}
                    <span className="text-sky-300">"sub_status"</span>
                    <span className="text-zinc-400">: </span>
                    <span className="text-amber-300">"{result.sub_status}"</span>
                    {`,\n  `}
                    <span className="text-sky-300">"score"</span>
                    <span className="text-zinc-400">: </span>
                    <span className="text-emerald-400">{result.score}</span>
                    {`,\n  `}
                    <span className="text-sky-300">"execution_time_ms"</span>
                    <span className="text-zinc-400">: </span>
                    <span className="text-emerald-400">{result.execution_time_ms}</span>
                    {`,\n  `}
                    <span className="text-sky-300">"value_adds"</span>
                    <span className="text-zinc-400">: {`{`}</span>
                    {`\n    `}
                    <span className="text-sky-300">"zero_waste_guarantee"</span>
                    <span className="text-zinc-400">: {`{`}</span>
                    {`\n      `}
                    <span className="text-sky-300">"credit_charged"</span>
                    <span className="text-zinc-400">: </span>
                    <span className="text-emerald-400">{String(result.value_adds.zero_waste_guarantee.credit_charged)}</span>
                    {`,\n      `}
                    <span className="text-sky-300">"refunded"</span>
                    <span className="text-zinc-400">: </span>
                    <span className="text-emerald-400">{String(result.value_adds.zero_waste_guarantee.refunded)}</span>
                    {`,\n      `}
                    <span className="text-sky-300">"reason"</span>
                    <span className="text-zinc-400">: </span>
                    <span className="text-amber-300">"{result.value_adds.zero_waste_guarantee.reason}"</span>
                    {`\n    `}
                    <span className="text-zinc-400">{`}`}</span>
                    {`,\n    `}
                    
                    {/* Auto Correction Highlight */}
                    <span className="bg-indigo-900/40 p-1 rounded -ml-1">
                      <span className="text-sky-300">"auto_correction"</span>
                      <span className="text-zinc-400">: {`{`}</span>
                      {`\n      `}
                      <span className="text-sky-300">"has_suggestion"</span>
                      <span className="text-zinc-400">: </span>
                      <span className="text-emerald-400">{String(result.value_adds.auto_correction.has_suggestion)}</span>
                      {`,\n      `}
                      <span className="text-sky-300">"suggested_email"</span>
                      <span className="text-zinc-400">: </span>
                      <span className="text-amber-300 font-bold bg-indigo-900/80 px-1 rounded">"{result.value_adds.auto_correction.suggested_email}"</span>
                      {`,\n      `}
                      <span className="text-sky-300">"suggested_email_status"</span>
                      <span className="text-zinc-400">: </span>
                      <span className="text-amber-300">"{result.value_adds.auto_correction.suggested_email_status}"</span>
                      {`,\n      `}
                      <span className="text-sky-300">"confidence_score"</span>
                      <span className="text-zinc-400">: </span>
                      <span className="text-emerald-400">{result.value_adds.auto_correction.confidence_score}</span>
                      {`\n    `}
                      <span className="text-zinc-400">{`}`}</span>
                    </span>
                    {`,\n    `}
                    
                    <span className="text-sky-300">"catch_all_analysis"</span>
                    <span className="text-zinc-400">: {`{`}</span>
                    {`\n      `}
                    <span className="text-sky-300">"is_catch_all"</span>
                    <span className="text-zinc-400">: </span>
                    <span className="text-emerald-400">{String(result.value_adds.catch_all_analysis.is_catch_all)}</span>
                    {`,\n      `}
                    <span className="text-sky-300">"deliverability_probability_percentage"</span>
                    <span className="text-zinc-400">: </span>
                    <span className="text-rose-400">null</span>
                    {`\n    `}
                    <span className="text-zinc-400">{`}`}</span>
                    {`,\n    `}
                    
                    <span className="text-sky-300">"contextual_risk"</span>
                    <span className="text-zinc-400">: {`{`}</span>
                    {`\n      `}
                    <span className="text-sky-300">"safe_for_b2c_newsletter"</span>
                    <span className="text-zinc-400">: </span>
                    <span className="text-rose-400">{String(result.value_adds.contextual_risk.safe_for_b2c_newsletter)}</span>
                    {`,\n      `}
                    <span className="text-sky-300">"safe_for_b2b_outreach"</span>
                    <span className="text-zinc-400">: </span>
                    <span className="text-rose-400">{String(result.value_adds.contextual_risk.safe_for_b2b_outreach)}</span>
                    {`,\n      `}
                    <span className="text-sky-300">"recommended_action"</span>
                    <span className="text-zinc-400">: </span>
                    <span className="text-amber-300">"{result.value_adds.contextual_risk.recommended_action}"</span>
                    {`\n    `}
                    <span className="text-zinc-400">{`}`}</span>
                    {`,\n    `}
                    
                    <span className="text-sky-300">"smtp_transparency_log"</span>
                    <span className="text-zinc-400">: {`{`}</span>
                    {`\n      `}
                    <span className="text-sky-300">"mx_used"</span>
                    <span className="text-zinc-400">: </span>
                    <span className="text-amber-300">"{result.value_adds.smtp_transparency_log.mx_used}"</span>
                    {`,\n      `}
                    <span className="text-sky-300">"response_code"</span>
                    <span className="text-zinc-400">: </span>
                    <span className="text-emerald-400">{result.value_adds.smtp_transparency_log.response_code}</span>
                    {`,\n      `}
                    <span className="text-sky-300">"raw_server_message"</span>
                    <span className="text-zinc-400">: </span>
                    <span className="text-amber-300">"{result.value_adds.smtp_transparency_log.raw_server_message}"</span>
                    {`\n    `}
                    <span className="text-zinc-400">{`}`}</span>
                    {`\n  `}
                    <span className="text-zinc-400">{`}`}</span>
                    {`\n`}
                    <span className="text-indigo-400">{`}`}</span>
                  </pre>
                </motion.div>
              )}
            </div>
            {result && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent pt-12 flex justify-end">
                  <div className="bg-zinc-800/80 backdrop-blur-sm text-xs font-medium text-zinc-300 px-3 py-1.5 rounded flex items-center border border-zinc-700">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                    Typo automatically detected and corrected
                  </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
