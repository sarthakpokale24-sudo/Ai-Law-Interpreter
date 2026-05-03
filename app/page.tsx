'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { FileText, Scale, Zap, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Testimonials } from '@/components/Testimonials';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-card rounded-xl"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div></div>
});

const features = [
  {
    icon: <Zap className="w-6 h-6 text-primary" />,
    title: 'Instant Analysis',
    description: 'Upload any legal document and get a plain-English summary in seconds.',
  },
  {
    icon: <Scale className="w-6 h-6 text-blue-400" />,
    title: 'Fairness Check',
    description: 'Automatically detect biased clauses and unfair terms in contracts.',
  },
  {
    icon: <Shield className="w-6 h-6 text-teal-400" />,
    title: 'Risk Assessment',
    description: 'Highlight potential legal risks and obligations before you sign.',
  },
];

export default function Home() {
  const imageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.4], [40, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.8, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  return (
    <div className="flex flex-col items-center overflow-x-hidden">
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:pt-32 flex flex-col items-center text-center relative z-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-sm font-medium text-primary mb-8 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Law Interpreter Beta is now live
          </div>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-bold tracking-tight mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Your Personal <br className="hidden md:block" />
          <span className="text-primary">Law Interpreter</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Upload your contracts, terms of service, or any legal document. Our advanced AI instantly translates complex legalese into clear, actionable insights.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-16 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link 
            href="/dashboard"
            className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-8 py-6 text-lg font-medium transition-all duration-300 bg-primary text-primary-foreground shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] active:scale-95 active:shadow-[0_0_10px_rgba(168,85,247,0.9)] hover:bg-primary/90 gap-2 group border-0"
          >
            Start Analyzing <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Dashboard/Image Preview with 3D Parallax Scroll Effect */}
        <div ref={imageRef} className="w-full max-w-5xl mx-auto mt-10 relative" style={{ perspective: "1000px" }}>
          <motion.div
            style={{
              rotateX,
              scale,
              opacity,
              transformOrigin: "top center",
            }}
            className="w-full rounded-xl overflow-hidden border border-border shadow-2xl bg-card flex items-center justify-center min-h-[400px] sm:min-h-[500px] md:min-h-[600px]"
          >
            <Spline scene="https://prod.spline.design/vmm-uzTzJDkVAmxP/scene.splinecode" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 relative z-20 bg-background border-t border-border shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground">Everything you need to navigate legal documents with confidence.</p>
          </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card border-border group backdrop-blur-xl h-full shadow-lg interactive-hover">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-card-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Card className="bg-card border-border overflow-hidden relative shadow-lg interactive-hover">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5 opacity-50"></div>
          <CardContent className="p-12 relative z-10">
            <FileText className="w-16 h-16 mx-auto mb-6 text-primary opacity-50" />
            <h2 className="text-3xl font-bold mb-4 text-card-foreground">Secure & Confidential</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Your documents are encrypted end-to-end and automatically deleted after analysis. We never use your confidential data to train our public models.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Testimonials Section */}
      <Testimonials />
    </div>
  );
}
