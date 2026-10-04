let promise;

// Loaded on demand (only when someone actually opens checkout), not on every page load.
export function loadRazorpay() {
  promise ??= new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(window.Razorpay);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error('Could not load the payment gateway. Check your connection and try again.'));
    document.body.appendChild(script);
  });
  return promise;
}
