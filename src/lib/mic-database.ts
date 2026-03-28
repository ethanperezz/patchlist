export interface Microphone {
  model: string
  manufacturer: string
  categories: string[]
}

// Deduplicated list — each mic appears once with all applicable categories
export const MIC_DATABASE: Microphone[] = [
  // Kick
  { model: 'Beta 52A', manufacturer: 'Shure', categories: ['kick'] },
  { model: 'Beta 91A', manufacturer: 'Shure', categories: ['kick', 'piano', 'boundary'] },
  { model: 'D112 MKII', manufacturer: 'AKG', categories: ['kick'] },
  { model: 'D6', manufacturer: 'Audix', categories: ['kick'] },
  { model: 'RE20', manufacturer: 'Electro-Voice', categories: ['kick', 'instrument'] },
  { model: 'ND868', manufacturer: 'Electro-Voice', categories: ['kick'] },
  { model: 'ATM250', manufacturer: 'Audio-Technica', categories: ['kick'] },
  { model: 'e 902', manufacturer: 'Sennheiser', categories: ['kick'] },
  { model: 'TDC1', manufacturer: 'Telefunken', categories: ['kick'] },

  // Snare / instrument
  { model: 'SM57', manufacturer: 'Shure', categories: ['snare', 'tom', 'instrument'] },
  { model: 'Beta 57A', manufacturer: 'Shure', categories: ['snare', 'instrument'] },
  { model: 'i5', manufacturer: 'Audix', categories: ['snare', 'instrument'] },
  { model: 'MD 441-U', manufacturer: 'Sennheiser', categories: ['snare'] },
  { model: 'ATM650', manufacturer: 'Audio-Technica', categories: ['snare'] },
  { model: 'PR30', manufacturer: 'Heil Sound', categories: ['snare', 'instrument'] },

  // Tom
  { model: 'D2', manufacturer: 'Audix', categories: ['tom'] },
  { model: 'D4', manufacturer: 'Audix', categories: ['tom'] },
  { model: 'D40', manufacturer: 'Audix', categories: ['tom'] },
  { model: 'Beta 98AMP', manufacturer: 'Shure', categories: ['tom', 'brass_wind'] },
  { model: 'e 904', manufacturer: 'Sennheiser', categories: ['tom'] },
  { model: 'e 604', manufacturer: 'Sennheiser', categories: ['tom'] },
  { model: 'MD 421-II', manufacturer: 'Sennheiser', categories: ['tom', 'instrument'] },
  { model: 'ATM230', manufacturer: 'Audio-Technica', categories: ['tom'] },
  { model: 'ND44', manufacturer: 'Electro-Voice', categories: ['tom'] },

  // Overhead / condenser
  { model: 'KSM32', manufacturer: 'Shure', categories: ['overhead', 'piano'] },
  { model: 'SM81', manufacturer: 'Shure', categories: ['overhead', 'hihat', 'piano'] },
  { model: 'KSM141', manufacturer: 'Shure', categories: ['overhead'] },
  { model: 'C 414 XLS', manufacturer: 'AKG', categories: ['overhead', 'piano', 'choir'] },
  { model: 'C 414 XLII', manufacturer: 'AKG', categories: ['overhead', 'instrument'] },
  { model: 'C 451 B', manufacturer: 'AKG', categories: ['overhead', 'hihat'] },
  { model: 'e 914', manufacturer: 'Sennheiser', categories: ['overhead', 'hihat'] },
  { model: 'AT4041', manufacturer: 'Audio-Technica', categories: ['overhead', 'hihat'] },
  { model: 'AT4051b', manufacturer: 'Audio-Technica', categories: ['overhead', 'piano', 'choir'] },
  { model: 'M300', manufacturer: 'Earthworks', categories: ['overhead'] },
  { model: 'DPA 2011C', manufacturer: 'DPA', categories: ['overhead'] },
  { model: 'DPA 4011A', manufacturer: 'DPA', categories: ['overhead'] },
  { model: 'MC930', manufacturer: 'Beyerdynamic', categories: ['overhead'] },
  { model: 'ADX51', manufacturer: 'Audix', categories: ['overhead', 'hihat'] },

  // Vocal dynamic
  { model: 'SM58', manufacturer: 'Shure', categories: ['vocal_dynamic'] },
  { model: 'Beta 58A', manufacturer: 'Shure', categories: ['vocal_dynamic'] },
  { model: 'SM86', manufacturer: 'Shure', categories: ['vocal_dynamic'] },
  { model: 'e 835', manufacturer: 'Sennheiser', categories: ['vocal_dynamic'] },
  { model: 'e 935', manufacturer: 'Sennheiser', categories: ['vocal_dynamic'] },
  { model: 'e 945', manufacturer: 'Sennheiser', categories: ['vocal_dynamic'] },
  { model: 'OM5', manufacturer: 'Audix', categories: ['vocal_dynamic'] },
  { model: 'OM7', manufacturer: 'Audix', categories: ['vocal_dynamic'] },
  { model: 'ND96', manufacturer: 'Electro-Voice', categories: ['vocal_dynamic'] },
  { model: 'RE410', manufacturer: 'Electro-Voice', categories: ['vocal_dynamic'] },
  { model: 'RE320', manufacturer: 'Electro-Voice', categories: ['vocal_dynamic'] },
  { model: 'PR35', manufacturer: 'Heil Sound', categories: ['vocal_dynamic'] },

  // Vocal condenser
  { model: 'Beta 87A', manufacturer: 'Shure', categories: ['vocal_condenser'] },
  { model: 'KSM9', manufacturer: 'Shure', categories: ['vocal_condenser'] },
  { model: 'e 965', manufacturer: 'Sennheiser', categories: ['vocal_condenser'] },
  { model: 'KMS 104', manufacturer: 'Neumann', categories: ['vocal_condenser'] },
  { model: 'KMS 105', manufacturer: 'Neumann', categories: ['vocal_condenser'] },
  { model: 'VX5', manufacturer: 'Audix', categories: ['vocal_condenser'] },
  { model: 'AT4050', manufacturer: 'Audio-Technica', categories: ['vocal_condenser'] },
  { model: 'C 535 EB', manufacturer: 'AKG', categories: ['vocal_condenser'] },

  // Headset / lav
  { model: 'DPA 4088', manufacturer: 'DPA', categories: ['headset_lav'] },
  { model: 'DPA 4066', manufacturer: 'DPA', categories: ['headset_lav'] },
  { model: 'DPA 4061', manufacturer: 'DPA', categories: ['headset_lav'] },
  { model: 'DPA 6066', manufacturer: 'DPA', categories: ['headset_lav'] },
  { model: 'Cos11D', manufacturer: 'Countryman', categories: ['headset_lav'] },
  { model: 'E6 Earset', manufacturer: 'Countryman', categories: ['headset_lav'] },
  { model: 'MKE 1', manufacturer: 'Sennheiser', categories: ['headset_lav'] },
  { model: 'HSP 4', manufacturer: 'Sennheiser', categories: ['headset_lav'] },
  { model: 'MX153', manufacturer: 'Shure', categories: ['headset_lav'] },

  // Guitar amp / instrument
  { model: 'e 906', manufacturer: 'Sennheiser', categories: ['instrument'] },
  { model: 'e 609 Silver', manufacturer: 'Sennheiser', categories: ['instrument'] },
  { model: 'ATM350', manufacturer: 'Audio-Technica', categories: ['instrument', 'brass_wind'] },
  { model: 'DPA 4099', manufacturer: 'DPA', categories: ['instrument', 'brass_wind', 'piano'] },

  // Brass / wind
  { model: 'e 908 B', manufacturer: 'Sennheiser', categories: ['brass_wind'] },
  { model: 'D3', manufacturer: 'Audix', categories: ['brass_wind'] },

  // Podium / gooseneck
  { model: 'MX418', manufacturer: 'Shure', categories: ['podium'] },
  { model: 'MX412', manufacturer: 'Shure', categories: ['podium'] },
  { model: 'MX202', manufacturer: 'Shure', categories: ['podium', 'choir'] },
  { model: 'RE90H', manufacturer: 'Electro-Voice', categories: ['podium'] },

  // Boundary
  { model: 'PZM 30D', manufacturer: 'Crown', categories: ['boundary'] },
  { model: 'PZM-11LL', manufacturer: 'Crown', categories: ['boundary'] },

  // Ribbon
  { model: 'R-121', manufacturer: 'Royer Labs', categories: ['ribbon'] },
  { model: 'R-10', manufacturer: 'Royer Labs', categories: ['ribbon'] },
  { model: 'M 160', manufacturer: 'Beyerdynamic', categories: ['ribbon'] },

  // Choir
  { model: 'MC30', manufacturer: 'Earthworks', categories: ['choir'] },
  { model: 'DPA 4006A', manufacturer: 'DPA', categories: ['choir'] },
]

// Sorted display list: "Manufacturer Model"
export const MIC_OPTIONS = MIC_DATABASE
  .map(m => `${m.manufacturer} ${m.model}`)
  .sort()

// Quick lookup for display
export function formatMicDisplay(value: string | null): string {
  if (!value) return ''
  return value
}

// Search function for combobox
export function searchMics(query: string): string[] {
  if (!query) return MIC_OPTIONS.slice(0, 20)
  const lower = query.toLowerCase()
  return MIC_OPTIONS.filter(m => m.toLowerCase().includes(lower))
}
