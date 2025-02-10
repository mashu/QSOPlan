export const MODULATIONS = ['SSB', 'FM', 'AM'] as const;

export const CB_CHANNELS = Array.from({ length: 40 }, (_, i) => ({
  channel: i + 1,
  frequency: Number((26.965 + (i * 0.01)).toFixed(3)),  // CB channels start at 26.965 MHz with 10 kHz spacing
}));

export const PMR_CHANNELS = Array.from({ length: 16 }, (_, i) => ({
  channel: i + 1,
  frequency: Number((446.00625 + (i * 0.0125)).toFixed(3)),  // PMR channels start at 446.00625 MHz with 12.5 kHz spacing
}));

export type Band = 'CB' | 'PMR';
export type Modulation = typeof MODULATIONS[number];

export const BANDS: Record<Band, typeof CB_CHANNELS | typeof PMR_CHANNELS> = {
  CB: CB_CHANNELS,
  PMR: PMR_CHANNELS,
};

export interface QSOFormData {
  initiator_call_sign: string;    // Pre-filled with user's call sign
  recipient: string;              // Call sign of the other station (max 10 chars)
  frequency: number;              // MHz with 3 decimal places
  mode: Modulation;              // SSB, FM, or AM
  datetime: string;              // ISO date string
  initiator_location: string;    // Grid square (6 chars)
  recipient_location: string;    // Grid square (6 chars)
}
