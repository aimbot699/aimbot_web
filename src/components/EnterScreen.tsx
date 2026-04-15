import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EnterScreenProps {
  onEnter: () => void;
}

const EnterScreen = ({ onEnter }: EnterScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleEnter = () => {
    setIsVisible(false);
    onEnter();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black cursor-pointer"
          onClick={handleEnter}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center overflow-hidden">
               <img src="/favicon.jpeg" alt="Aimbot" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-white text-sm font-mono tracking-[0.2em] animate-pulse">
              [ CLICK TO ENTER ]
            </h2>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EnterScreen;
