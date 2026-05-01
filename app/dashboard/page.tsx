'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { FileText, Clock, AlertTriangle, CheckCircle, Search, UploadCloud } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      const data = JSON.parse(localStorage.getItem(`ai_law_history_${user.id}`) || '[]');
      setHistory(data);
    }
  }, [user?.id]);

  if (!isLoaded || !isSignedIn) {
    return null; // Let Clerk middleware handle redirect or show empty state
  }

  const totalDocs = history.length;
  const highRisk = history.filter(h => h.risk === 'high').length;
  const hoursSaved = totalDocs * 2; // Assuming 2 hours saved per analysis

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {user.firstName || 'User'}</h1>
          <p className="text-gray-400">Here is an overview of your recent legal document analyses.</p>
        </div>
        
        <Link href="/analyze" className="glass-button text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2">
          <UploadCloud className="w-5 h-5" />
          New Analysis
        </Link>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-300">Total Documents</h3>
          </div>
          <p className="text-4xl font-bold">{totalDocs}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-300">High Risks Identified</h3>
          </div>
          <p className="text-4xl font-bold">{highRisk}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-300">Est. Hours Saved</h3>
          </div>
          <p className="text-4xl font-bold">{hoursSaved}</p>
        </motion.div>
      </div>

      {/* Activity History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="glass-card overflow-hidden"
      >
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold">Recent Activity</h2>
        </div>

        <div className="divide-y divide-white/5">
          {history.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No documents analyzed yet. Go to the Analyze page to get started!</p>
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {item.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Clock className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-200 mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    item.risk === 'low' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    item.risk === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {item.risk.charAt(0).toUpperCase() + item.risk.slice(1)} Risk
                  </span>
                  <span className="text-sm text-purple-400 hover:text-purple-300 font-medium">
                    {item.type}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
