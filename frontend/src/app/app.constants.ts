export const mempoolFeeColors = [ // LTCbrand: mempool block colours
  '0BAF6E', // green
  '20C572',
  '40C884',
  '2BCF74',
  '36DA76',
  '36DA76',
  '41E578',
  '4CEF7A',
  '57FA7C',
  '62FF7E',
  '6DFF7F',
  '79FF7E',
  '84FF7D',
  '8FFF7C',
  '9AFF7A',
  'FFEBA1', // yellow
  'ffe68a',
  'FFDF6C',
  'FFD53E',
  'ffd333',
  'fdc500',
  'FDB963',
  'C9A5FF',
  'be8aff', // purple
  'B071FF',
  'A35AFF',
  '9447f6',
  '8423FF',
  '9447f6',
  'A54DC3', // transition reds
  'D57AA5',
  'E6A29C',
  'ff8e8e', // red
  'ff6464',
  'ff4b4b',
  'ff3232',
  'f62626',
  'ff0000'
];

export const chartColors = [
  '#D81B60',
  '#8E24AA',
  '#5E35B1',
  '#3949AB',
  '#1E88E5',
  '#039BE5',
  '#00ACC1',
  '#00897B',
  '#43A047',
  '#7CB342',
  '#C0CA33',
  '#FDD835',
  '#FFB300',
  '#FB8C00',
  '#F4511E',
  '#6D4C41',
  '#757575',
  '#546E7A',
  '#b71c1c',
  '#880E4F',
  '#4A148C',
  '#311B92',
  '#1A237E',
  '#0D47A1',
  '#01579B',
  '#006064',
  '#004D40',
  '#1B5E20',
  '#33691E',
  '#827717',
  '#F57F17',
  '#FF6F00',
  '#E65100',
  '#BF360C',
  '#3E2723',
  '#212121',
  '#263238',
  '#801313',
];

export const poolsColor = {
  'unknown': '#FDD835',
};

export const feeLevels = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100, 125, 150, 175, 200,
  250, 300, 350, 400, 500, 600, 700, 800, 900, 1000, 1200, 1400, 1600, 1800, 2000];

export interface Language {
  code: string;
  name: string;
}

export const languages: Language[] = [
   { code: 'ar', name: 'العربية' },         // Arabic
// { code: 'bg', name: 'Български' },       // Bulgarian
// { code: 'bs', name: 'Bosanski' },        // Bosnian
// { code: 'ca', name: 'Català' },          // Catalan
   { code: 'cs', name: 'Čeština' },         // Czech
   { code: 'da', name: 'Dansk' },           // Danish
   { code: 'de', name: 'Deutsch' },         // German
// { code: 'et', name: 'Eesti' },           // Estonian
// { code: 'el', name: 'Ελληνικά' },        // Greek
   { code: 'en', name: 'English' },         // English
   { code: 'es', name: 'Español' },         // Spanish
// { code: 'eo', name: 'Esperanto' },       // Esperanto
// { code: 'eu', name: 'Euskara' },         // Basque
   { code: 'fa', name: 'فارسی' },           // Persian
   { code: 'fr', name: 'Français' },        // French
// { code: 'gl', name: 'Galego' },          // Galician
   { code: 'ko', name: '한국어' },          // Korean
// { code: 'hr', name: 'Hrvatski' },        // Croatian
// { code: 'id', name: 'Bahasa Indonesia' },// Indonesian
   { code: 'hi', name: 'हिन्दी' },             // Hindi
   { code: 'ne', name: 'नेपाली' },            // Nepalese
   { code: 'it', name: 'Italiano' },        // Italian
   { code: 'he', name: 'עברית' },           // Hebrew
   { code: 'ka', name: 'ქართული' },         // Georgian
// { code: 'lv', name: 'Latviešu' },        // Latvian
   { code: 'lt', name: 'Lietuvių' },        // Lithuanian
   { code: 'hu', name: 'Magyar' },          // Hungarian
   { code: 'mk', name: 'Македонски' },      // Macedonian
// { code: 'ms', name: 'Bahasa Melayu' },   // Malay
   { code: 'nl', name: 'Nederlands' },      // Dutch
   { code: 'ja', name: '日本語' },          // Japanese
   { code: 'nb', name: 'Norsk' },           // Norwegian Bokmål
// { code: 'nn', name: 'Norsk Nynorsk' },   // Norwegian Nynorsk
   { code: 'pl', name: 'Polski' },          // Polish
   { code: 'pt', name: 'Português' },       // Portuguese
// { code: 'pt-BR', name: 'Português (Brazil)' }, // Portuguese (Brazil)
   { code: 'ro', name: 'Română' },          // Romanian
   { code: 'ru', name: 'Русский' },         // Russian
// { code: 'sk', name: 'Slovenčina' },      // Slovak
   { code: 'sl', name: 'Slovenščina' },     // Slovenian
// { code: 'sr', name: 'Српски / srpski' }, // Serbian
// { code: 'sh', name: 'Srpskohrvatski / српскохрватски' },// Serbo-Croatian
   { code: 'fi', name: 'Suomi' },           // Finnish
   { code: 'sv', name: 'Svenska' },         // Swedish
   { code: 'th', name: 'ไทย' },             // Thai
   { code: 'tr', name: 'Türkçe' },          // Turkish
   { code: 'uk', name: 'Українська' },      // Ukrainian
   { code: 'vi', name: 'Tiếng Việt' },      // Vietnamese
   { code: 'zh', name: '中文' },            // Chinese
];

export const specialBlocks = {
  '0': {
    labelEvent: 'Genesis',
    labelEventCompleted: 'The Genesis of Ferrite',
    networks: ['mainnet', 'testnet'],
  },
  '301107': {
    labelEvent: 'Ferrite\'s 1st Halving',
    labelEventCompleted: 'Block Subsidy has halved to 50 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '602214': {
    labelEvent: 'Ferrite\'s 2nd Halving',
    labelEventCompleted: 'Block Subsidy has halved to 25 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '903321': {
    labelEvent: 'Ferrite\'s 3rd Halving',
    labelEventCompleted: 'Block Subsidy has halved to 12.5 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '1204428': {
    labelEvent: 'Ferrite\'s 4th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 6.25 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '1505535': {
    labelEvent: 'Ferrite\'s 5th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 3.125 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '1806642': {
    labelEvent: 'Ferrite\'s 6th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 1.5625 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '2107749': {
    labelEvent: 'Ferrite\'s 7th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.78125 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '2408856': {
    labelEvent: 'Ferrite\'s 8th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.390625 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '2709963': {
    labelEvent: 'Ferrite\'s 9th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.1953125 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '3011070': {
    labelEvent: 'Ferrite\'s 10th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.09765625 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '3312177': {
    labelEvent: 'Ferrite\'s 11th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.04882812 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '3613284': {
    labelEvent: 'Ferrite\'s 12th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.02441406 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '3914391': {
    labelEvent: 'Ferrite\'s 13th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.01220703 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '4215498': {
    labelEvent: 'Ferrite\'s 14th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.00610351 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '4516605': {
    labelEvent: 'Ferrite\'s 15th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.00305175 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '4817712': {
    labelEvent: 'Ferrite\'s 16th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.00152587 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '5118819': {
    labelEvent: 'Ferrite\'s 17th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.00076293 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '5419926': {
    labelEvent: 'Ferrite\'s 18th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.00038146 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '5721033': {
    labelEvent: 'Ferrite\'s 19th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.00019073 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '6022140': {
    labelEvent: 'Ferrite\'s 20th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.00009536 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '6323247': {
    labelEvent: 'Ferrite\'s 21st Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.00004768 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '6624354': {
    labelEvent: 'Ferrite\'s 22nd Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.00002384 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '6925461': {
    labelEvent: 'Ferrite\'s 23rd Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.00001192 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '7226568': {
    labelEvent: 'Ferrite\'s 24th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.00000596 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '7527675': {
    labelEvent: 'Ferrite\'s 25th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.00000298 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '7828782': {
    labelEvent: 'Ferrite\'s 26th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.00000149 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '8129889': {
    labelEvent: 'Ferrite\'s 27th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.00000074 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '8430996': {
    labelEvent: 'Ferrite\'s 28th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.00000037 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '8732103': {
    labelEvent: 'Ferrite\'s 29th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.00000018 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '9033210': {
    labelEvent: 'Ferrite\'s 30th Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.00000009 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '9334317': {
    labelEvent: 'Ferrite\'s 31st Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.00000004 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '9635424': {
    labelEvent: 'Ferrite\'s 32nd Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.00000002 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '9936531': {
    labelEvent: 'Ferrite\'s 33rd Halving',
    labelEventCompleted: 'Block Subsidy has halved to 0.00000001 FEC per block',
    networks: ['mainnet', 'testnet'],
  },
  '10237638': {
    labelEvent: 'Ferrite\'s Final Halving',
    labelEventCompleted: 'Block Subsidy has ended',
    networks: ['mainnet', 'testnet'],
  }
};

export const fiatCurrencies = {
  AUD: {
    name: 'Australian Dollar',
    code: 'AUD',
    indexed: true,
  },
  EUR: {
    name: 'Euro',
    code: 'EUR',
    indexed: true,
  },
  GBP: {
    name: 'Pound Sterling',
    code: 'GBP',
    indexed: true,
  },
  JPY: {
    name: 'Japanese Yen',
    code: 'JPY',
    indexed: true,
  },
  USD: {
    name: 'US Dollar',
    code: 'USD',
    indexed: true,
  },
};
