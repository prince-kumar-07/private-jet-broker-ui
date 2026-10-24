import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

// Scroll-linked depth. `speed` is the fraction of the layer's own height it drifts across the time the
// element crosses the viewport: positive moves it down as you scroll (feels far away), negative moves it
// up (feels close). Respects prefers-reduced-motion by staying put.
export function ParallaxLayer({ speed = 0.2, className = '', children, ...rest }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}%`, `${speed * 100}%`]);
  return (
    <motion.div ref={ref} style={{ y: reduce ? 0 : y }} className={`will-change-transform ${className}`} {...rest}>
      {children}
    </motion.div>
  );
}

// A section with its own scroll progress: children can be plain markup, and `bg` is rendered as a
// slow-moving backdrop that stays behind the content.
export function ParallaxSection({ bg, className = '', children, ...rest }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['-12%', '12%']);
  return (
    <section ref={ref} className={`relative isolate overflow-hidden ${className}`} {...rest}>
      <motion.div aria-hidden="true" style={{ y: reduce ? 0 : bgY }} className="absolute inset-x-0 -top-[15%] -z-10 h-[130%]">
        {bg}
      </motion.div>
      {children}
    </section>
  );
}
