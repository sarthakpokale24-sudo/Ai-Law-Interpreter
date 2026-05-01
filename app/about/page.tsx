'use client';

import { Shield, Cpu, Scale, Lock, Zap, FileSearch } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen pt-32">
      
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-6 text-foreground">
          Democratizing Legal Understanding
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Law Interpreter was built with a singular mission: to make complex legal jargon accessible, transparent, and instantly comprehensible for everyone. We believe that understanding the law should not be a privilege reserved only for legal professionals.
        </p>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-start shadow-lg interactive-hover">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-6">
            <Scale className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-card-foreground">Our Mission</h3>
          <p className="text-muted-foreground leading-relaxed">
            Legal documents are notoriously dense and impenetrable to the average person. Our mission is to bridge the gap between complex legal texts and public comprehension using state-of-the-art Artificial Intelligence. Whether it's an FIR, a court hearing summary, or a lengthy PDF contract, we extract the truth and present it in clear, actionable insights.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-start shadow-lg interactive-hover">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-6">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-card-foreground">Security & Privacy</h3>
          <p className="text-muted-foreground leading-relaxed">
            We understand the sensitive nature of legal documents. That's why we've implemented an architecture where no document data is permanently stored on our servers. All analyses are processed securely in memory and immediately discarded. Authentication is strictly enforced using industry-standard identity management.
          </p>
        </div>
      </motion.div>

      {/* Tech Stack Section */}
      <motion.div 
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Technology Stack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-card p-6 rounded-2xl border border-border hover:border-primary/50 shadow-sm interactive-hover">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-yellow-500" />
              <h4 className="text-lg font-bold text-card-foreground">Next.js 14</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              The entire platform is built on the robust Next.js App Router, enabling lightning-fast server-side rendering and highly secure backend API routes.
            </p>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border hover:border-primary/50 shadow-sm interactive-hover">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-teal-500" />
              <h4 className="text-lg font-bold text-card-foreground">Clerk Auth</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Enterprise-grade authentication ensures that your dashboard and analysis history remain strictly private and tied cryptographically to your identity.
            </p>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border hover:border-primary/50 shadow-sm interactive-hover">
            <div className="flex items-center gap-3 mb-4">
              <Cpu className="w-6 h-6 text-primary" />
              <h4 className="text-lg font-bold text-card-foreground">Gemini AI Engine</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Powered by Google's state-of-the-art Gemini 2.x Flash models. We utilize a highly redundant multi-key proxy architecture to guarantee 100% uptime during high-demand periods.
            </p>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border hover:border-primary/50 shadow-sm interactive-hover">
            <div className="flex items-center gap-3 mb-4">
              <FileSearch className="w-6 h-6 text-blue-400" />
              <h4 className="text-lg font-bold text-card-foreground">NER Pipeline</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Custom-built strict prompts force the AI into parsing mode, creating highly accurate Named Entity Recognition (NER) for dates, persons, and legal terminologies.
            </p>
          </div>

        </div>
      </motion.div>

    </div>
  );
}
