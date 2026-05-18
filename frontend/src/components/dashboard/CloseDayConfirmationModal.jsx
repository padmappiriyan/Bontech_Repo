import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiLock, FiX } from 'react-icons/fi';

const CloseDayConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />
                    
                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)] overflow-hidden"
                    >
                        {/* Header Gradient */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-400 via-brand-600 to-brand-400" />
                        
                        <div className="p-8">
                            {/* Close Button */}
                            <button 
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                            >
                                <FiX size={20} />
                            </button>

                            <div className="text-center">
                                {/* Icon */}
                                <div className="w-20 h-20 bg-brand-50 rounded-[2rem] flex items-center justify-center text-brand-600 mx-auto mb-6 relative">
                                    <div className="absolute inset-0 bg-brand-500/10 rounded-[2rem] animate-ping opacity-20" />
                                    <FiLock size={32} className="relative z-10" />
                                </div>

                                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
                                    Ready to Close?
                                </h2>
                                <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-[280px] mx-auto">
                                    Are you sure you want to end your shift? You will be directed to the final drawer reconciliation.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="mt-10 space-y-3">
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-600/20 active:scale-[0.98]"
                                >
                                    Yes, Proceed to Close
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 bg-white hover:bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-slate-100 active:scale-[0.98]"
                                >
                                    Cancel
                                </button>
                            </div>

                            {/* Footer Note */}
                            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-center gap-2">
                                <FiAlertCircle className="text-slate-300" size={14} />
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                    This action will end your active session
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CloseDayConfirmationModal;
