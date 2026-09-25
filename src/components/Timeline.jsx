import { motion } from 'framer-motion';
import { STATUS } from '../data/content';
import { fmtDate } from './ui';

export default function Timeline({ history }) {
  return (
    <ol className="relative ml-2 space-y-5 border-l border-white/15 pl-6">
      {history.map((h, i) => (
        <motion.li key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="relative">
          <span className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full ring-4 ring-ink ${i === history.length - 1 ? 'bg-gold' : 'bg-white/30'}`} />
          <div className="text-sm font-medium">{STATUS[h.status]?.label || h.status}</div>
          <div className="text-xs text-white/45">{fmtDate(h.created_at)}{h.note ? ` · ${h.note}` : ''}</div>
        </motion.li>
      ))}
    </ol>
  );
}
