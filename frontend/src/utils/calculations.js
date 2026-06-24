export const quadSymmetry = (op, healthy) => healthy ? Math.round((Number(op) / Number(healthy)) * 100) : 0;
export const readinessScore = ({ strength = 0, rom = 0, hop = 0, balance = 0, swelling = 0, confidence = 0, pain = 0 }) => Math.round(strength * .3 + rom * .15 + hop * .2 + balance * .15 + (10 - swelling) * 10 * .1 + confidence * .05 + (10 - pain) * 10 * .05);
export const statusColor = (value) => value >= 90 ? 'text-emerald-600' : value >= 75 ? 'text-amber-600' : 'text-red-600';
