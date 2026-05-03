'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { FileText, File, Gavel, FileVolume, UploadCloud, Loader2, KeyRound, AlertCircle, Download, CheckCircle2 } from 'lucide-react';
import emailjs from '@emailjs/browser';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

type AnalysisType = 'Legal Text' | 'PDF' | 'FIR' | 'Hearing Summary';

interface EntityResult {
  persons: string[];
  locations: string[];
  organizations: string[];
  dates: string[];
  legalTerms: string[];
}

interface AnalysisResult {
  title: string;
  summary: string;
  keyPoints: string[];
  legalImplications: string;
  recommendations: string[];
  entities: EntityResult;
}

const analysisOptions: { type: AnalysisType; icon: React.ReactNode; desc: string }[] = [
  { type: 'Legal Text', icon: <FileText className="w-5 h-5" />, desc: 'Analyze raw legal text' },
  { type: 'PDF', icon: <File className="w-5 h-5" />, desc: 'Upload and analyze a PDF document' },
  { type: 'FIR', icon: <AlertCircle className="w-5 h-5" />, desc: 'Analyze First Information Reports' },
  { type: 'Hearing Summary', icon: <Gavel className="w-5 h-5" />, desc: 'Summarize court hearings' },
];

export default function AnalyzePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [selectedType, setSelectedType] = useState<AnalysisType>('Legal Text');
  const [textInput, setTextInput] = useState('');
  const [fileInput, setFileInput] = useState<File | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<number>(1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isLoaded || !isSignedIn) {
    return null; // Clerk handles unauthorized access via middleware/layout depending on setup
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFileInput(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileInput(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('type', selectedType);

      if (selectedType === 'PDF') {
        if (!fileInput) throw new Error('Please upload a file.');
        formData.append('content', fileInput);
      } else {
        if (!textInput.trim()) throw new Error('Please enter some text.');
        formData.append('content', textInput);
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze document');
      }

      setResult(data.data);
      if (data.keyInUse) {
        setActiveKey(data.keyInUse);
      }

      // Calculate simple risk score
      const impl = data.data.legalImplications?.toLowerCase() || '';
      let riskLevel = 'low';
      if (impl.includes('penalty') || impl.includes('prison') || impl.includes('prosecution') || impl.includes('fine') || impl.includes('lawsuit')) {
        riskLevel = 'high';
      } else if (impl.includes('warning') || impl.includes('breach') || impl.includes('liability') || impl.includes('obligation')) {
        riskLevel = 'medium';
      }

      // Save to localStorage for the Dashboard
      const historyItem = {
        id: Date.now().toString(),
        title: data.data.title || `${selectedType} Analysis`,
        date: new Date().toISOString(),
        type: selectedType,
        risk: riskLevel,
        status: 'completed'
      };
      const historyKey = user?.id ? `ai_law_history_${user.id}` : 'ai_law_history';
      const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
      localStorage.setItem(historyKey, JSON.stringify([historyItem, ...existingHistory]));

      // Trigger Email Send via EmailJS (Frontend)
      if (user?.primaryEmailAddress?.emailAddress) {
        if (process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID && process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID && process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) {
          
          const templateParams = {
            to_email: user.primaryEmailAddress.emailAddress,
            to_name: user.firstName || 'User',
            analysis_type: selectedType,
            date_time: new Date().toLocaleString(),
            risk_level: riskLevel,
            report_summary: data.data.summary // Provided just in case it is added to the template later
          };

          emailjs.send(
            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
            process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
            templateParams,
            process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
          ).then(() => {
            console.log("EmailJS successfully sent the report notification!");
          }).catch((err) => {
            console.error("EmailJS failed to send:", err);
          });
        } else {
          console.warn("EmailJS credentials not configured properly in .env.local");
        }
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createPDFDocument = (reportData: AnalysisResult, type: string) => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    let yOffset = 40;
    const margin = 40;
    const pageWidth = pdf.internal.pageSize.width;
    const maxWidth = pageWidth - 2 * margin;

    const sanitizeText = (text: string) => {
      if (!text) return '';
      return text
        .replace(/₹/g, 'Rs. ')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/[\u2026]/g, '...')
        .replace(/[^\x00-\x7F]/g, '');
    };

    const addText = (rawText: string, fontSize: number, isBold: boolean, color: number[], extraSpacing = 10) => {
      const text = sanitizeText(rawText);
      pdf.setFontSize(fontSize);
      pdf.setFont("helvetica", isBold ? "bold" : "normal");
      pdf.setTextColor(color[0], color[1], color[2]);
      
      const lines = pdf.splitTextToSize(text, maxWidth);
      
      if (yOffset + lines.length * (fontSize * 1.2) > pdf.internal.pageSize.height - margin) {
        pdf.addPage();
        yOffset = margin;
      }
      
      pdf.text(lines, margin, yOffset);
      yOffset += lines.length * (fontSize * 1.2) + extraSpacing;
    };

    addText(`Legal Analysis Report`, 24, true, [0, 0, 0], 20);
    addText(`Generated: ${new Date().toLocaleString()}`, 10, false, [100, 100, 100], 5);
    addText(`Analysis Type: ${type}`, 10, false, [100, 100, 100], 20);
    addText(reportData.title, 18, true, [50, 50, 150], 15);
    addText(`Summary`, 14, true, [0, 0, 0], 5);
    addText(reportData.summary, 12, false, [50, 50, 50], 15);

    addText(`Key Points`, 14, true, [0, 0, 0], 5);
    if (Array.isArray(reportData.keyPoints) && reportData.keyPoints.length > 0) {
      reportData.keyPoints.forEach((point) => {
        addText(`• ${point}`, 12, false, [50, 50, 50], 5);
      });
    } else {
      addText(`None`, 12, false, [150, 150, 150], 5);
    }
    yOffset += 10;

    addText(`Legal Implications`, 14, true, [0, 0, 0], 5);
    addText(reportData.legalImplications, 12, false, [50, 50, 50], 15);

    addText(`Recommendations`, 14, true, [0, 0, 0], 5);
    if (Array.isArray(reportData.recommendations) && reportData.recommendations.length > 0) {
      reportData.recommendations.forEach((rec) => {
        addText(`• ${rec}`, 12, false, [50, 50, 50], 5);
      });
    } else {
      addText(`None`, 12, false, [150, 150, 150], 5);
    }
    yOffset += 10;

    addText(`Named Entities`, 14, true, [0, 0, 0], 5);
    if (reportData.entities) {
      const printEntities = (label: string, data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          addText(`${label}: ${data.join(', ')}`, 11, false, [80, 80, 80], 5);
        } else if (typeof data === 'string' && data.trim().length > 0) {
          addText(`${label}: ${data}`, 11, false, [80, 80, 80], 5);
        }
      };
      
      printEntities('Persons', reportData.entities.persons);
      printEntities('Locations', reportData.entities.locations);
      printEntities('Organizations', reportData.entities.organizations);
      printEntities('Dates', reportData.entities.dates);
      printEntities('Legal Terms', reportData.entities.legalTerms);
    }

    return pdf;
  };

  const handleDownload = () => {
    if (!result) return;
    try {
      setIsLoading(true);
      const pdf = createPDFDocument(result, selectedType);
      pdf.save(`Analysis_${selectedType.replace(/ /g, '_')}_${new Date().getTime()}.pdf`);
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      setError("Failed to generate PDF: " + (err.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen pt-24">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <motion.div 
          className="w-full md:w-64 flex-shrink-0 space-y-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-bold mb-6">Analysis Type</h2>
          {analysisOptions.map((opt) => (
            <button
              key={opt.type}
              onClick={() => {
                setSelectedType(opt.type);
                setResult(null);
                setError(null);
                setFileInput(null);
                setTextInput('');
              }}
              className={`w-full text-left p-4 rounded-xl flex items-center gap-3 transition-all ${
                selectedType === opt.type 
                ? 'glass-button bg-purple-500/20 border-purple-500/50 text-white' 
                : 'glass hover:bg-white/5 text-gray-400'
              }`}
            >
              <div className={selectedType === opt.type ? 'text-purple-400' : 'text-gray-500'}>
                {opt.icon}
              </div>
              <div>
                <div className="font-medium">{opt.type}</div>
              </div>
            </button>
          ))}

          {/* API Key Status */}
          <div className="mt-8 p-4 glass-card border-white/5">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <KeyRound className="w-4 h-4 text-purple-400" /> API System Status
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-sm text-emerald-400 font-medium">Key {activeKey} in use</span>
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.div 
          className="flex-grow space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="glass-card p-8">
            <h1 className="text-2xl font-bold mb-2">{selectedType} Analysis</h1>
            <p className="text-gray-400 mb-8">{analysisOptions.find(o => o.type === selectedType)?.desc}</p>

            {/* Input Area */}
            {selectedType === 'PDF' ? (
              <div 
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
                  isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-white/20'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="application/pdf" 
                  className="hidden" 
                />
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <UploadCloud className="w-8 h-8 text-purple-400" />
                </div>
                {fileInput ? (
                  <div className="text-emerald-400 font-medium mb-2">{fileInput.name}</div>
                ) : (
                  <>
                    <h3 className="text-lg font-medium mb-2">Drag and drop your PDF here</h3>
                    <p className="text-gray-400 mb-6">or</p>
                  </>
                )}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 rounded-full glass-button text-sm font-medium"
                >
                  Browse Files
                </button>
              </div>
            ) : (
              <div>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={`Paste your ${selectedType.toLowerCase()} here...`}
                  className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-gray-200 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                />
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleAnalyze}
                disabled={isLoading}
                className="glass-button text-white px-8 py-3 rounded-full font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
                ) : (
                  <><Zap className="w-5 h-5" /> Start Analysis</>
                )}
              </button>
            </div>
            
            {error && (
              <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}
          </div>

          {/* Results Area */}
          {result && (
            <div className="space-y-6">
              <div id="report-container" className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-8 md:p-10 relative">
                {/* Download Button */}
                <button 
                  onClick={handleDownload}
                  className="absolute top-8 right-8 p-2 rounded-full glass hover:bg-white/10 text-gray-300 transition-colors"
                  title="Download Report"
                >
                  <Download className="w-5 h-5" />
                </button>

                <div className="border-b border-white/10 pb-6 mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Legal Analysis Report</h2>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <span>Generated: {new Date().toLocaleString()}</span>
                    <span>•</span>
                    <span className="text-purple-400 font-medium">Analysis Type: {selectedType}</span>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-purple-300 mb-6">{result.title}</h3>

                <div className="space-y-8">
                  <section>
                    <h4 className="text-xl font-bold text-white mb-3 border-l-4 border-purple-500 pl-3">Summary</h4>
                    <p className="text-gray-300 leading-relaxed bg-black/20 p-5 rounded-xl border border-white/5">
                      {result.summary}
                    </p>
                  </section>

                  <section>
                    <h4 className="text-xl font-bold text-white mb-3 border-l-4 border-blue-500 pl-3">Key Points</h4>
                    <ul className="space-y-3 bg-black/20 p-5 rounded-xl border border-white/5">
                      {Array.isArray(result.keyPoints) && result.keyPoints.length > 0 ? result.keyPoints.map((point: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-300">
                          <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{point}</span>
                        </li>
                      )) : <li className="text-gray-500 italic">None</li>}
                    </ul>
                  </section>

                  <section>
                    <h4 className="text-xl font-bold text-white mb-3 border-l-4 border-red-500 pl-3">Legal Implications</h4>
                    <p className="text-gray-300 leading-relaxed bg-black/20 p-5 rounded-xl border border-white/5">
                      {result.legalImplications}
                    </p>
                  </section>

                  <section>
                    <h4 className="text-xl font-bold text-white mb-3 border-l-4 border-emerald-500 pl-3">Recommendations</h4>
                    <ul className="space-y-3 bg-black/20 p-5 rounded-xl border border-white/5">
                      {Array.isArray(result.recommendations) && result.recommendations.length > 0 ? result.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2.5 flex-shrink-0"></div>
                          <span className="leading-relaxed">{rec}</span>
                        </li>
                      )) : <li className="text-gray-500 italic">None</li>}
                    </ul>
                  </section>

                  <section className="pt-6 border-t border-white/10">
                    <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-400" />
                      Named Entity Recognition (NER)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Persons</h5>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(result.entities?.persons) && result.entities.persons.length > 0 ? result.entities.persons.map((person: string, i: number) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">{person}</span>
                          )) : <span className="text-gray-600 text-xs italic">None detected</span>}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Locations</h5>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(result.entities?.locations) && result.entities.locations.length > 0 ? result.entities.locations.map((loc: string, i: number) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">{loc}</span>
                          )) : <span className="text-gray-600 text-xs italic">None detected</span>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dates</h5>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(result.entities?.dates) && result.entities.dates.length > 0 ? result.entities.dates.map((date: string, i: number) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">{date}</span>
                          )) : <span className="text-gray-600 text-xs italic">None detected</span>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Organizations</h5>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(result.entities?.organizations) && result.entities.organizations.length > 0 ? result.entities.organizations.map((org: string, i: number) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">{org}</span>
                          )) : <span className="text-gray-600 text-xs italic">None detected</span>}
                        </div>
                      </div>

                      <div className="space-y-2 lg:col-span-2">
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Legal Terms</h5>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(result.entities?.legalTerms) && result.entities.legalTerms.length > 0 ? result.entities.legalTerms.map((term: string, i: number) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">{term}</span>
                          )) : <span className="text-gray-600 text-xs italic">None detected</span>}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="mt-12 pt-6 border-t border-white/5 text-center">
                  <p className="text-xs text-gray-500">
                    This report has been automatically generated by AI Law Interpreter.<br/>
                    Please review with a legal professional for accuracy.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Need to import Zap for the button
import { Zap } from 'lucide-react';
