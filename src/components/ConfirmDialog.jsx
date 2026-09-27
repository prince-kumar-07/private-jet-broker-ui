import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Promise-free, controlled confirm modal to replace window.confirm's blocking, unstyled dialog.
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] grid place-items-center bg-black/60 px-5 backdrop-blur-sm"
          onPointerDown={(e) => e.target === e.currentTarget && onCancel()}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.25 }} className="card w-full max-w-sm p-6"
          >
            <h2 id="confirm-title" className="font-display text-2xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-white/60">{message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={onCancel} className="btn-ghost !px-5 !py-2 text-sm">Cancel</button>
              <button type="button" onClick={onConfirm} className="btn-gold !px-5 !py-2 text-sm">{confirmLabel}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
