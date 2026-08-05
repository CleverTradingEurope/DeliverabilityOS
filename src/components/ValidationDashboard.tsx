import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, XCircle, AlertTriangle, HelpCircle, Loader2, FileDown, ArrowLeft, Wand2, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ValidationResult {
  originalEmail: string;
  email: string;
  status: 'deliverable' | 'undeliverable' | 'catch_all' | 'unknown';
  sub_status?: string;
  score: number;
  execution_time_ms: number;
  value_adds: {
    zero_waste_guarantee: { credit_charged: boolean; refunded: boolean; reason: string; };
    auto_correction: { has_suggestion: boolean; suggested_email?: string; suggested_email_status?: string; confidence_score?: number; };
    catch_all_analysis: { is_catch_all: boolean; deliverability_probability_percentage?: number | null; };
    smtp_transparency_log: { mx_used: string; response_code: number; raw_server_message: string; };
  };
}

const COMMON_TYPOS: Record<string, string> = {
  'gmai.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'outlok.com': 'outlook.com',
  'oultook.com': 'outlook.com',
  'yaho.com': 'yahoo.com',
  'yahou.com': 'yahoo.com',
  'hotmai.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
};

const handleValidation = async (originalEmail: string): Promise<ValidationResult> => {
  try {
    const response = await fetch('/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: originalEmail }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    return {
      originalEmail,
      email: originalEmail,
      status: 'unknown',
      sub_status: 'api_error',
      score: 0,
      execution_time_ms: 0,
      value_adds: {
        zero_waste_guarantee: { credit_charged: false, refunded: true, reason: "API call failed" },
        auto_correction: { has_suggestion: false },
        catch_all_analysis: { is_catch_all: false },
        smtp_transparency_log: { mx_used: 'none', response_code: 0, raw_server_message: error.message }
      }
    };
  }
};

export default function ValidationDashboard({ onBack }: { onBack: () => void }) {
  const [inputText, setInputText] = useState('juan.perez@gmaill.com\nadmin@empresa.com\ntest@unknown-domain-12345.com\nhello@valid-startup.io\nbroken@email\nsales@catchall-corp.com');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [selectedResult, setSelectedResult] = useState<ValidationResult | null>(null);

  const startValidation = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    setResults([]);
    setSelectedResult(null);
    setProgress(0);

    const emails = inputText.split('\n').map(e => e.trim()).filter(e => e);
    const total = emails.length;
    let processed = 0;
    const currentResults: ValidationResult[] = [];

    // Process in small batches for UI responsiveness
    const batchSize = 3;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(email => handleValidation(email)));
      
      currentResults.push(...batchResults);
      processed += batch.length;
      
      setResults([...currentResults]);
      setProgress(Math.round((processed / total) * 100));
    }

    setIsProcessing(false);
  };

  const stats = {
    total: results.length,
    deliverable: results.filter(r => r.status === 'deliverable').length,
    undeliverable: results.filter(r => r.status === 'undeliverable').length,
    catch_all: results.filter(r => r.status === 'catch_all').length,
    unknown: results.filter(r => r.status === 'unknown').length,
    corrected: results.filter(r => r.value_adds.auto_correction.has_suggestion).length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deliverable': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'undeliverable': return <XCircle className="w-5 h-5 text-rose-500" />;
      case 'catch_all': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <HelpCircle className="w-5 h-5 text-zinc-400" />;
    }
  };

  const exportCSV = () => {
    if (results.length === 0) return;

    const headers = ['Original Email', 'Final Email', 'Status', 'Sub Status', 'Score', 'Typo Corrected', 'Refunded', 'Server MX', 'Response Code', 'Raw Message'];
    
    const rows = results.map(r => [
      r.originalEmail,
      r.email,
      r.status,
      r.sub_status || '',
      r.score,
      r.value_adds.auto_correction.has_suggestion ? 'Yes' : 'No',
      r.value_adds.zero_waste_guarantee.refunded ? 'Yes' : 'No',
      r.value_adds.smtp_transparency_log.mx_used,
      r.value_adds.smtp_transparency_log.response_code,
      `"${r.value_adds.smtp_transparency_log.raw_server_message.replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `validation_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-600" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">DeliverabilityOS <span className="text-zinc-400 font-normal ml-2">Console</span></h1>
        </div>
        <div className="flex space-x-3">
          <button className="text-sm font-medium text-zinc-600 hover:text-zinc-900 px-3 py-2">Documentation</button>
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
            US
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input & Controls */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Upload or Paste Emails</h2>
            <textarea
              className="w-full h-64 p-4 border border-zinc-300 rounded-xl bg-zinc-50 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Paste one email per line..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isProcessing}
            />
            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs text-zinc-500">{inputText.split('\n').filter(e => e.trim()).length} emails detected</span>
              <button
                onClick={startValidation}
                disabled={isProcessing || !inputText.trim()}
                className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  <><Play className="w-4 h-4 mr-2" /> Start Validation</>
                )}
              </button>
            </div>
          </div>

          {/* Real-time Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 flex-1">
            <h2 className="text-lg font-semibold mb-6">Validation Statistics</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-xl">
                <div className="text-2xl font-bold text-zinc-900">{stats.total}</div>
                <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mt-1">Total Processed</div>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div className="text-2xl font-bold text-emerald-700">{stats.deliverable}</div>
                <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider mt-1">Deliverable</div>
              </div>
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
                <div className="text-2xl font-bold text-rose-700">{stats.undeliverable}</div>
                <div className="text-xs font-medium text-rose-600 uppercase tracking-wider mt-1">Undeliverable</div>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="text-2xl font-bold text-amber-700">{stats.catch_all}</div>
                <div className="text-xs font-medium text-amber-600 uppercase tracking-wider mt-1">Catch-All</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                <div className="flex items-center text-indigo-800">
                  <Wand2 className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Typos Corrected</span>
                </div>
                <span className="font-bold text-indigo-700">{stats.corrected}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-sky-50 border border-sky-100 rounded-lg">
                <div className="flex items-center text-sky-800">
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Credits Refunded (Unknown)</span>
                </div>
                <span className="font-bold text-sky-700">{stats.unknown}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Results List & Detail View */}
        <div className="lg:col-span-8 flex flex-col h-[calc(100vh-8rem)]">
          
          {/* Progress Bar */}
          {isProcessing && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-600 font-medium">Processing List...</span>
                <span className="text-zinc-900 font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col">
            <div className="border-b border-zinc-200 bg-zinc-50/50 p-4 flex justify-between items-center">
              <h3 className="font-semibold text-zinc-900">Validation Stream</h3>
              <button 
                onClick={exportCSV}
                disabled={results.length === 0 || isProcessing}
                className="flex items-center text-sm font-medium text-zinc-600 hover:text-zinc-900 disabled:opacity-50"
              >
                <FileDown className="w-4 h-4 mr-1.5" /> Export CSV
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
              {results.length === 0 && !isProcessing ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                  <Play className="w-12 h-12 mb-4 text-zinc-200" />
                  <p>Start validation to see real-time results.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-zinc-200 text-sm">
                  <thead className="bg-zinc-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-zinc-900">Email</th>
                      <th className="px-6 py-3 text-left font-semibold text-zinc-900">Status</th>
                      <th className="px-6 py-3 text-left font-semibold text-zinc-900">Score</th>
                      <th className="px-6 py-3 text-right font-semibold text-zinc-900">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 bg-white">
                    <AnimatePresence>
                      {results.map((result, idx) => (
                        <motion.tr 
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`hover:bg-zinc-50 cursor-pointer transition-colors ${selectedResult === result ? 'bg-indigo-50/50' : ''}`}
                          onClick={() => setSelectedResult(result)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-zinc-900">{result.email}</div>
                            {result.value_adds.auto_correction.has_suggestion && (
                              <div className="text-xs text-indigo-600 mt-1 flex items-center">
                                <Wand2 className="w-3 h-3 mr-1" /> Auto-corrected from {result.originalEmail}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getStatusIcon(result.status)}
                              <span className="ml-2 capitalize font-medium text-zinc-700">{result.status.replace('_', '-')}</span>
                            </div>
                            <div className="text-xs text-zinc-500 ml-7 mt-0.5 capitalize">{result.sub_status?.replace(/_/g, ' ')}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 h-2 bg-zinc-100 rounded-full overflow-hidden mr-2">
                                <div 
                                  className={`h-full rounded-full ${result.score > 70 ? 'bg-emerald-500' : result.score > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                  style={{ width: `${result.score}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-zinc-600">{result.score}/100</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-indigo-600 font-medium">
                            Inspect
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* JSON Inspector / Detailed View */}
          {selectedResult && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-zinc-950 rounded-2xl shadow-xl border border-zinc-800 overflow-hidden flex flex-col h-72"
            >
              <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="text-sm font-mono text-zinc-400">SMTP Transparency Log & Data Object</h3>
                <button onClick={() => setSelectedResult(null)} className="text-zinc-500 hover:text-white">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto font-mono text-xs text-zinc-300">
                <pre>{JSON.stringify(selectedResult, null, 2)}</pre>
              </div>
            </motion.div>
          )}

        </div>

      </main>
    </div>
  );
}
