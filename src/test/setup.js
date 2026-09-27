import '@testing-library/jest-dom/vitest';

// jsdom has no IntersectionObserver; framer-motion's whileInView (used by <Reveal>) needs one.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.IntersectionObserver = MockIntersectionObserver;
