// Types for different modulations per band
export type CBModulation = 'AM' | 'SSB' | 'FM';
export type PMRModulation = 'FM';
export type Modulation = CBModulation | PMRModulation;
export type Band = 'CB' | 'PMR';

// All available modulations for QSO form
export const MODULATIONS: Modulation[] = ['AM', 'SSB', 'FM'];

// Band-specific modulation lists
export const CB_MODULATIONS: CBModulation[] = ['AM', 'SSB', 'FM'];
export const PMR_MODULATIONS: PMRModulation[] = ['FM'];

// Channel data with frequencies
export const CB_CHANNELS = Array.from({ length: 40 }, (_, i) => ({
  channel: i + 1,
  frequency: Number((26.965 + (i * 0.01)).toFixed(3)),  // CB channels start at 26.965 MHz with 10 kHz spacing
}));

export const PMR_CHANNELS = Array.from({ length: 16 }, (_, i) => ({
  channel: i + 1,
  frequency: Number((446.00625 + (i * 0.0125)).toFixed(3)),  // PMR channels start at 446.00625 MHz with 12.5 kHz spacing
}));

// Band configurations
export const BANDS: Record<Band, typeof CB_CHANNELS | typeof PMR_CHANNELS> = {
  CB: CB_CHANNELS,
  PMR: PMR_CHANNELS,
};

// Modulations per band
export const BAND_MODULATIONS: Record<Band, Modulation[]> = {
  CB: CB_MODULATIONS,
  PMR: PMR_MODULATIONS,
};

// Type for form data
export interface QSOFormData {
  initiator_call_sign: string;
  recipient: string;
  frequency: number;
  mode: Modulation;
  datetime: string;
  initiator_location: string;
  recipient_location: string;
}

// Helper functions
export function getBandModulations(band: Band): Modulation[] {
  return BAND_MODULATIONS[band];
}

export function isValidModulationForBand(band: Band, modulation: Modulation): boolean {
  return BAND_MODULATIONS[band].includes(modulation);
}

export function getDefaultModulationForBand(band: Band): Modulation {
  return BAND_MODULATIONS[band][0];
}

// Frequency validation functions
export function isValidFrequencyForBand(band: Band, frequency: number): boolean {
  const channels = BANDS[band];
  return channels.some(ch => Math.abs(ch.frequency - frequency) < 0.0001); // Allow small floating point differences
}

export function getChannelFromFrequency(band: Band, frequency: number) {
  const channels = BANDS[band];
  return channels.find(ch => Math.abs(ch.frequency - frequency) < 0.0001);
}

export function getBandFromFrequency(frequency: number): Band | null {
  if (frequency >= 26.965 && frequency <= 27.405) return 'CB';
  if (frequency >= 446.00625 && frequency <= 446.19375) return 'PMR';
  return null;
}
