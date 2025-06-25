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
            <ChatMessage from="user" text="What should I wear for a casual weekend?" delay={0.2} />
            <ChatMessage from="bot" text="Based on your wardrobe, I'd suggest your blue denim jacket with the white graphic tee." delay={0.8} />
            <ChatMessage from="user" text="Good idea! Can you find me some new white sneakers to go with that?" delay={1.4} />
            <ChatMessage from="bot" text="Of course! Here are a few top-rated options I found online..." delay={2.0} isTyping/>
        </div>
    </motion.div>
  );
}; 