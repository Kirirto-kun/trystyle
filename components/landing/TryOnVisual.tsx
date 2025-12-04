"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export const TryOnVisual = () => {
  return (
    <motion.div
      className="relative w-full h-[32rem] md:h-[36rem] bg-muted rounded-lg p-4 md:p-6 flex flex-col items-center justify-center overflow-hidden border"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, amount: 0.5 }}
    >
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.1))]"></div>
      
      {/* Step 1: Human + Clothing */}
      <div className="relative flex items-center justify-center space-x-3 md:space-x-6 mb-4">
        {/* Human Image */}
        <motion.div
          className="w-16 h-24 md:w-24 md:h-32 bg-background/50 backdrop-blur-sm rounded-xl overflow-hidden border shadow-lg"
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Image
            src="/human1.jpeg"
            alt="Person"
            width={96}
            height={128}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Plus Sign */}
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <span className="text-xl md:text-2xl font-bold text-primary">+</span>
        </motion.div>

        {/* Clothing Image */}
        <motion.div
          className="w-16 h-24 md:w-24 md:h-32 bg-background/50 backdrop-blur-sm rounded-xl overflow-hidden border shadow-lg"
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Image
            src="/cloth1.jpeg"
            alt="Clothing"
            width={96}
            height={128}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>

      {/* Equals Sign */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.8 }}
        viewport={{ once: true }}
        className="mb-4"
      >
        <span className="text-xl md:text-2xl font-bold text-primary">=</span>
      </motion.div>

      {/* Step 2: Result - MAIN FOCUS */}
      <motion.div
        className="w-40 h-56 md:w-56 md:h-80 bg-background/50 backdrop-blur-sm rounded-xl overflow-hidden border shadow-xl"
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        viewport={{ once: true }}
      >
        <Image
          src="/final1.jpeg"
          alt="Try-on Result"
          width={224}
          height={320}
          className="w-full h-full object-contain"
          priority
        />
      </motion.div>

      {/* Result Label */}
      <motion.p
        className="text-primary font-bold mt-4 text-base md:text-lg"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.3 }}
        viewport={{ once: true }}
      >
        Your Virtual Try-On Result
      </motion.p>

      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
    </motion.div>
  );
}; 