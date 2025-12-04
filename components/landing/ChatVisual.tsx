"use client";
import { motion } from "framer-motion";

const TypingIndicator = () => {
    return (
        <motion.div
            className="flex gap-1.5 items-center"
            initial="initial"
            animate="animate"
            transition={{ staggerChildren: 0.2 }}
        >
            <motion.span className="w-2 h-2 bg-muted-foreground rounded-full" variants={{ initial: { y: 0 }, animate: { y: [0, -4, 0] }}} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} />
            <motion.span className="w-2 h-2 bg-muted-foreground rounded-full" variants={{ initial: { y: 0 }, animate: { y: [0, -4, 0] }}} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} />
            <motion.span className="w-2 h-2 bg-muted-foreground rounded-full" variants={{ initial: { y: 0 }, animate: { y: [0, -4, 0] }}} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} />
        </motion.div>
    )
}

const ChatMessage = ({ text, from, delay, isTyping }: { text: string, from: 'user' | 'bot', delay: number, isTyping?: boolean }) => {
    const isUser = from === 'user';
    return (
        <motion.div
            className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            viewport={{ once: true }}
        >
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0"></div>
            )}
            <div className={`max-w-[75%] rounded-lg px-4 py-2 ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {isTyping ? <TypingIndicator/> : <p className="text-sm">{text}</p>}
            </div>
        </motion.div>
    );
};

export const ChatVisual = () => {
  return (
    <motion.div
      className="relative w-full h-80 md:h-96 bg-muted rounded-lg p-4 flex flex-col justify-end border"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, amount: 0.5 }}
    >
        <div className="space-y-4">
            <ChatMessage from="user" text="Looking for a black dress for a date night under $150" delay={0.2} />
            <ChatMessage from="bot" text="Found 12 options! Here's an elegant one from Zara for $120 and a stylish one from H&M for $85." delay={0.8} />
            <ChatMessage from="user" text="Can I try them on virtually?" delay={1.4} />
            <ChatMessage from="bot" text="Absolutely! Upload your photo and see both options on yourself..." delay={2.0} isTyping/>
        </div>
    </motion.div>
  );
}; 