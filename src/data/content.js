export const STATUS = {
  submitted: { label: 'Submitted', cls: 'bg-sky-500/15 text-sky-300 border-sky-400/30' },
  under_review: { label: 'Under Review', cls: 'bg-amber-500/15 text-amber-300 border-amber-400/30' },
  quoted: { label: 'Quoted', cls: 'bg-violet-500/15 text-violet-300 border-violet-400/30' },
  confirmed: { label: 'Confirmed', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30' },
  declined: { label: 'Declined', cls: 'bg-rose-500/15 text-rose-300 border-rose-400/30' },
  cancelled: { label: 'Cancelled', cls: 'bg-zinc-500/15 text-zinc-300 border-zinc-400/30' },
};

export const FLEET = [
  { kind: 'jet', id: 'light', name: 'Light Jets', example: 'Phenom 300 / Citation CJ3', seats: '6-8', range: '2,000 nm', speed: '450 kts', blurb: 'Agile and efficient for regional hops under four hours.' },
  { kind: 'jet', id: 'midsize', name: 'Midsize Jets', example: 'Citation XLS / Learjet 60', seats: '7-9', range: '2,500 nm', speed: '470 kts', blurb: 'The sweet spot of cabin comfort, range and cost.' },
  { kind: 'jet', id: 'super_midsize', name: 'Super-Midsize', example: 'Challenger 350 / Praetor 600', seats: '8-10', range: '3,400 nm', speed: '480 kts', blurb: 'Stand-up cabins and transcontinental reach.' },
  { kind: 'jet', id: 'heavy', name: 'Heavy Jets', example: 'Gulfstream G550 / Falcon 7X', seats: '12-16', range: '6,500 nm', speed: '500 kts', blurb: 'Full galley, sleeping cabins and intercontinental range.' },
  { kind: 'jet', id: 'ultra_long', name: 'Ultra Long Range', example: 'Global 7500 / Gulfstream G700', seats: '14-19', range: '7,700 nm', speed: '520 kts', blurb: 'Non-stop anywhere, with a true private-residence cabin.' },
  { kind: 'jet', id: 'vip_airliner', name: 'VIP Airliners', example: 'BBJ / ACJ320', seats: '19-50', range: '6,000 nm', speed: '480 kts', blurb: 'Delegations, teams and events in airliner-scale luxury.' },
  { kind: 'helicopter', id: 'heli_single', name: 'Helicopter (Single Engine)', example: 'Airbus H125 / Bell 407 / Robinson R66', seats: '4-6', range: '340 nm', speed: '130 kts', blurb: 'City hops, scenic flights, helipad transfers and hill-station access.' },
  { kind: 'helicopter', id: 'heli_multi', name: 'Helicopter (Multi Engine)', example: 'Airbus H145 / AW139 / Bell 429', seats: '6-12', range: '450 nm', speed: '150 kts', blurb: 'Twin-engine safety for over-water, offshore and VIP city-to-city transfers.' },
];

export const ROUTES = [
  { from: 'Mumbai', fromCode: 'BOM', to: 'Goa', toCode: 'GOX', time: '1h 10m' },
  { from: 'Delhi', fromCode: 'DEL', to: 'Jaipur', toCode: 'JAI', time: '45m' },
  { from: 'Mumbai', fromCode: 'BOM', to: 'Delhi', toCode: 'DEL', time: '2h 00m' },
  { from: 'Bengaluru', fromCode: 'BLR', to: 'Hyderabad', toCode: 'HYD', time: '1h 00m' },
  { from: 'Delhi', fromCode: 'DEL', to: 'Dubai', toCode: 'DXB', time: '3h 15m' },
  { from: 'Mumbai', fromCode: 'BOM', to: 'London', toCode: 'LHR', time: '9h 15m' },
];

// Mostly Indian destinations, plus a few major global ones
export const MARQUEE_CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Goa', 'Jaipur', 'Ahmedabad', 'Udaipur', 'Kochi', 'Pune', 'Dubai', 'London', 'Singapore', 'Maldives'];

export const STEPS = [
  { n: '01', title: 'Request', text: 'Tell us where, when and how many. It takes about a minute.' },
  { n: '02', title: 'We Source', text: 'Our team searches operators and aircraft that fit your trip.' },
  { n: '03', title: 'Receive a Quote', text: 'A transparent, all-inclusive quote lands in your dashboard.' },
  { n: '04', title: 'Fly', text: 'Confirm, and we handle crew, catering and ground transfers.' },
];

export const FAQ = [
  { q: 'How fast will I get a quote?', a: 'Most requests are reviewed and quoted within a few hours, around the clock.' },
  { q: 'Can I change or cancel a request?', a: 'Yes. You can cancel any request from your dashboard until it is confirmed.' },
  { q: 'Do you fly internationally?', a: 'Yes. We arrange charters worldwide, including permits and handling.' },
  { q: 'Can I bring pets or special catering?', a: 'Absolutely. Add them in the request form and we will arrange it.' },
];

export const AIRCRAFT_OPTIONS = [
  { value: '', label: 'No preference' },
  ...FLEET.map((f) => ({ value: f.name, label: f.name })),
];

export const EMPTY_LEG_STATUS = {
  active: { label: 'Active', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30' },
  full: { label: 'Fully booked', cls: 'bg-sky-500/15 text-sky-300 border-sky-400/30' },
  cancelled: { label: 'Cancelled', cls: 'bg-zinc-500/15 text-zinc-300 border-zinc-400/30' },
};

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AED'];

export const PAYMENT_STATUS = {
  unpaid: { label: 'Unpaid', cls: 'bg-zinc-500/15 text-zinc-300 border-zinc-400/30' },
  deposit_paid: { label: 'Deposit paid', cls: 'bg-amber-500/15 text-amber-300 border-amber-400/30' },
  paid: { label: 'Paid', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30' },
  refunded: { label: 'Refunded', cls: 'bg-sky-500/15 text-sky-300 border-sky-400/30' },
};
