import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, QrCode, UserPlus, ScanText } from 'lucide-react';

interface AddOption {
  id: string;
  label: string;
  description: string;
  icon: typeof QrCode;
  path: string;
}

const addOptions: AddOption[] = [
  {
    id: 'scan-qr',
    label: 'Scan QR',
    description: 'Scan QR code to add contact',
    icon: QrCode,
    path: '/dashboard/add/scan-qr',
  },
  {
    id: 'add-manual',
    label: 'Add Contact',
    description: 'Add contact manually',
    icon: UserPlus,
    path: '/dashboard/add/manual',
  },
  {
    id: 'scan-ocr',
    label: 'Scan OCR',
    description: 'Scan business card',
    icon: ScanText,
    path: '/dashboard/add/scan-ocr',
  },
];

export function AddEntryFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleOptionClick = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* FAB Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 bottom-24 z-40 h-14 w-14 rounded-full gradient-primary shadow-elevated flex items-center justify-center hover:opacity-90 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        <Plus className="h-6 w-6 text-primary-foreground" />
      </motion.button>

      {/* Options Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-30"
              onClick={() => setIsOpen(false)}
            />

            {/* Options */}
            <div className="fixed right-4 bottom-40 z-40 flex flex-col items-end gap-3">
              {addOptions.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0, 
                    scale: 1,
                    transition: { delay: index * 0.05, type: 'spring', stiffness: 300, damping: 25 }
                  }}
                  exit={{ 
                    opacity: 0, 
                    x: 20, 
                    scale: 0.8,
                    transition: { delay: (addOptions.length - index - 1) * 0.03 }
                  }}
                  onClick={() => handleOptionClick(option.path)}
                  className="flex items-center gap-3 group"
                >
                  {/* Label */}
                  <motion.span
                    className="px-3 py-2 bg-card border border-border/50 rounded-lg shadow-card text-sm font-medium text-foreground whitespace-nowrap"
                    whileHover={{ scale: 1.02 }}
                  >
                    {option.label}
                  </motion.span>

                  {/* Icon Button */}
                  <motion.div
                    className="h-12 w-12 rounded-full bg-card border border-border/50 shadow-card flex items-center justify-center group-hover:border-primary/30 group-hover:shadow-elevated transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <option.icon className="h-5 w-5 text-primary" />
                  </motion.div>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
