"use client";

import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { motion } from "framer-motion";

const testimonials = [
  {
    text: "The AI Law Interpreter has completely changed how our startup handles contracts. It instantly flags unfair terms that we used to miss.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "Priya Sharma",
    role: "Startup Founder",
  },
  {
    text: "Instead of spending hours reading through legalese, I get a clear, plain-English summary in seconds. It's an absolute lifesaver.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "Rahul Verma",
    role: "Freelance Designer",
  },
  {
    text: "The risk assessment feature is incredible. We caught a deeply buried liability clause before signing a vendor agreement thanks to this tool.",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Anjali Desai",
    role: "Operations Manager",
  },
  {
    text: "As a small business owner without an in-house legal team, this gives me the confidence I need to negotiate service agreements fairly.",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "Vikram Singh",
    role: "Small Business Owner",
  },
  {
    text: "I love the fairness check! It highlights biased clauses immediately. It's like having a top-tier lawyer sitting right next to you.",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Neha Gupta",
    role: "Procurement Lead",
  },
  {
    text: "It processes 50-page NDAs and enterprise agreements flawlessly. The ease of use and speed are truly unmatched.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Kavita Reddy",
    role: "Business Analyst",
  },
  {
    text: "Reviewing terms of service used to be my least favorite task. Now, it takes less than a minute to understand exactly what I'm agreeing to.",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "Arjun Patel",
    role: "Marketing Director",
  },
  {
    text: "It pinpointed three major loopholes in a contractor agreement that could have cost us thousands. Absolutely brilliant software.",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Sneha Iyer",
    role: "HR Director",
  },
  {
    text: "The privacy and security guarantees are top-notch. I trust this platform completely with our sensitive, confidential documents.",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "Karan Malhotra",
    role: "CTO",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export const Testimonials = () => {
  return (
    <section className="bg-background my-20 relative w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border py-1 px-4 rounded-full text-sm font-medium border-primary/30 bg-primary/10 text-primary">Testimonials</div>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mt-5 text-center">
            What our users say
          </h2>
          <p className="text-center mt-5 text-muted-foreground text-lg">
            See what our customers have to say about us.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};
