"use client";
import { motion } from "framer-motion";
import { User, Shirt } from "lucide-react";

export const TryOnVisual = () => {
  return (
    <motion.div
      className="relative w-full h-80 md:h-96 bg-muted rounded-lg p-4 md:p-8 flex items-center justify-center overflow-hidden border"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, amount: 0.5 }}
    >
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.1))]"></div>
      <div className="relative flex items-center justify-center space-x-2 md:space-x-8">
        {/* Human Image */}
        <motion.div
          className="w-28 h-44 md:w-40 md:h-64 bg-background/50 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center border shadow-lg"
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <User className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-2">Your Photo</p>
        </motion.div>

        {/* Plus Sign */}
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <span className="text-3xl md:text-4xl font-bold text-primary">+</span>
        </motion.div>


        {/* Clothing Image */}
        <motion.div
          className="w-28 h-44 md:w-40 md:h-64 bg-background/50 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center border shadow-lg"
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Shirt className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground" />
           <p className="text-sm text-muted-foreground mt-2">Clothing</p>
        </motion.div>
      </div>

        {/* Result Arrow */}
        <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            viewport={{ once: true }}
        >
            <div className="text-2xl font-bold text-primary animate-bounce">↓</div>
        </motion.div>

        {/* Resulting Image Teaser */}
        <motion.div
            className="absolute -bottom-8 w-48 h-24 bg-gradient-to-t from-background via-background to-transparent"
        >
            <div className="absolute bottom-0 w-full h-16 bg-background/50 backdrop-blur-sm border-t rounded-t-xl shadow-2xl flex items-center justify-center">
                 <motion.p
                    className="text-primary font-semibold"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                    viewport={{ once: true }}
                >
                    Your Virtual Try-On
                </motion.p>
            </div>
        </motion.div>

    </motion.div>
  );
}; 