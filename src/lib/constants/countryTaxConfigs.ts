/**
 * Country-Specific Tax ID Configurations
 *
 * This file contains detailed configuration for business registration numbers
 * across 30 countries. Each configuration includes:
 * - Field names and display labels (English and local)
 * - Format validation patterns
 * - Example formats
 * - Required/optional status
 * - Checksum validation information
 * - Invoice requirements
 */

export type TaxSystemType = 'VAT' | 'GST' | 'Sales Tax' | 'None';
export type RegionType = 'Americas' | 'EU' | 'APAC' | 'MEA' | 'Other';

export interface TaxIdFieldConfig {
  fieldName: string;
  displayName: string;
  displayNameLocal?: string;
  required: boolean;
  format: string;
  formatExample: string;
  formatDescription: string;
  validationLibrary?: string;
  hasChecksum: boolean;
  placeholder?: string;
}

export interface CountryTaxConfig {
  countryCode: string;
  countryName: string;
  primaryId: TaxIdFieldConfig;
  secondaryIds?: TaxIdFieldConfig[];
  region: RegionType;
  taxSystem: TaxSystemType;
  verificationApi?: {
    name: string;
    endpoint?: string;
    requiresAuth: boolean;
    realTime: boolean;
  };
  invoiceRequirements: {
    mustShowOnInvoice: boolean;
    mustShowCustomerTaxId: boolean;
    invoiceLanguage?: 'local' | 'english' | 'either';
    additionalRequirements?: string[];
  };
}

export const COUNTRY_TAX_CONFIGS: Record<string, CountryTaxConfig> = {
  // ============================================================
  // PHASE 1: TOP 10 COUNTRIES
  // ============================================================

  US: {
    countryCode: 'US',
    countryName: 'United States',
    primaryId: {
      fieldName: 'ein',
      displayName: 'EIN',
      required: true,
      format: '^\\d{2}-?\\d{7}$',
      formatExample: '12-3456789',
      formatDescription: '9 digits formatted as XX-XXXXXXX',
      validationLibrary: 'stdnum:US-EIN',
      hasChecksum: false,
      placeholder: '12-3456789',
    },
    region: 'Americas',
    taxSystem: 'Sales Tax',
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: false,
      invoiceLanguage: 'english',
    },
  },

  GB: {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    primaryId: {
      fieldName: 'vatNumber',
      displayName: 'VAT Registration Number',
      displayNameLocal: 'VAT Reg No.',
      required: false,
      format: '^GB\\d{9}(\\d{3})?$|^GB(GD|HA)\\d{3}$',
      formatExample: 'GB123456789',
      formatDescription: 'GB followed by 9 or 12 digits',
      validationLibrary: 'jsvat',
      hasChecksum: true,
      placeholder: 'GB123456789',
    },
    secondaryIds: [
      {
        fieldName: 'companyNumber',
        displayName: 'Company Number',
        required: false,
        format: '^[A-Z0-9]{8}$',
        formatExample: '12345678',
        formatDescription: '8 characters (usually numbers)',
        hasChecksum: false,
        placeholder: '12345678',
      },
      {
        fieldName: 'utr',
        displayName: 'Unique Taxpayer Reference',
        displayNameLocal: 'UTR',
        required: false,
        format: '^\\d{10}$',
        formatExample: '1234567890',
        formatDescription: '10 digits',
        hasChecksum: false,
        placeholder: '1234567890',
      },
    ],
    region: 'EU',
    taxSystem: 'VAT',
    verificationApi: {
      name: 'UK VAT Validation',
      requiresAuth: false,
      realTime: true,
    },
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: true,
      invoiceLanguage: 'english',
      additionalRequirements: [
        'Must show VAT amount separately',
        'Invoices over £250 require full VAT invoice details',
      ],
    },
  },

  DE: {
    countryCode: 'DE',
    countryName: 'Germany',
    primaryId: {
      fieldName: 'vatNumber',
      displayName: 'VAT ID',
      displayNameLocal: 'USt-IdNr.',
      required: true,
      format: '^DE\\d{9}$',
      formatExample: 'DE123456789',
      formatDescription: 'DE followed by 9 digits',
      validationLibrary: 'jsvat',
      hasChecksum: true,
      placeholder: 'DE123456789',
    },
    secondaryIds: [
      {
        fieldName: 'handelsregister',
        displayName: 'Commercial Register',
        displayNameLocal: 'Handelsregister',
        required: false,
        format: '^HR[AB]\\s*\\d+$',
        formatExample: 'HRB 123456',
        formatDescription: 'HRA or HRB followed by number',
        hasChecksum: false,
        placeholder: 'HRB 123456',
      },
    ],
    region: 'EU',
    taxSystem: 'VAT',
    verificationApi: {
      name: 'EU VIES',
      endpoint: 'https://ec.europa.eu/taxation_customs/vies/checkVatService',
      requiresAuth: false,
      realTime: true,
    },
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: true,
      invoiceLanguage: 'either',
      additionalRequirements: [
        'Must include "Steuernummer" or "USt-IdNr"',
        'Invoices must be stored for 10 years',
      ],
    },
  },

  AU: {
    countryCode: 'AU',
    countryName: 'Australia',
    primaryId: {
      fieldName: 'abn',
      displayName: 'ABN',
      required: true,
      format: '^\\d{11}$',
      formatExample: '12 345 678 901',
      formatDescription: '11 digits (shown with spaces)',
      validationLibrary: 'stdnum:AU-ABN',
      hasChecksum: true,
      placeholder: '12 345 678 901',
    },
    secondaryIds: [
      {
        fieldName: 'acn',
        displayName: 'ACN',
        required: false,
        format: '^\\d{9}$',
        formatExample: '123 456 789',
        formatDescription: '9 digits (shown with spaces)',
        validationLibrary: 'stdnum:AU-ACN',
        hasChecksum: true,
        placeholder: '123 456 789',
      },
    ],
    region: 'APAC',
    taxSystem: 'GST',
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: false,
      invoiceLanguage: 'english',
      additionalRequirements: [
        'Tax invoices over AUD $1,000 must show ABN',
        'Must include "Tax Invoice" wording',
      ],
    },
  },

  CA: {
    countryCode: 'CA',
    countryName: 'Canada',
    primaryId: {
      fieldName: 'businessNumber',
      displayName: 'Business Number',
      displayNameLocal: 'BN',
      required: true,
      format: '^\\d{9}$',
      formatExample: '123456789',
      formatDescription: '9-digit Business Number',
      hasChecksum: false,
      placeholder: '123456789',
    },
    secondaryIds: [
      {
        fieldName: 'gstNumber',
        displayName: 'GST/HST Number',
        required: false,
        format: '^\\d{9}RT\\d{4}$',
        formatExample: '123456789RT0001',
        formatDescription: '9-digit BN + RT + 4 digits',
        hasChecksum: false,
        placeholder: '123456789RT0001',
      },
    ],
    region: 'Americas',
    taxSystem: 'GST',
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: false,
      invoiceLanguage: 'either',
    },
  },

  SG: {
    countryCode: 'SG',
    countryName: 'Singapore',
    primaryId: {
      fieldName: 'uen',
      displayName: 'UEN',
      required: true,
      format: '^([0-9]{9,10}[A-Z]?|[TRS]\\d{2}[A-Z]{2}\\d{4}[A-Z])$',
      formatExample: '202012345A',
      formatDescription: '9-10 characters (new format: TyyPQnnnnX)',
      hasChecksum: true,
      placeholder: '202012345A',
    },
    secondaryIds: [
      {
        fieldName: 'gstNumber',
        displayName: 'GST Registration No.',
        required: false,
        format: '^M\\d{8,9}$',
        formatExample: 'M12345678',
        formatDescription: 'M followed by 8-9 digits',
        hasChecksum: false,
        placeholder: 'M12345678',
      },
    ],
    region: 'APAC',
    taxSystem: 'GST',
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: false,
      invoiceLanguage: 'english',
    },
  },

  FR: {
    countryCode: 'FR',
    countryName: 'France',
    primaryId: {
      fieldName: 'vatNumber',
      displayName: 'VAT Number',
      displayNameLocal: 'N° TVA',
      required: true,
      format: '^FR[A-HJ-NP-Z0-9]{2}\\d{9}$',
      formatExample: 'FR12345678901',
      formatDescription: 'FR + 2 chars + 9 digits',
      validationLibrary: 'jsvat',
      hasChecksum: true,
      placeholder: 'FR12345678901',
    },
    secondaryIds: [
      {
        fieldName: 'siren',
        displayName: 'SIREN',
        required: false,
        format: '^\\d{9}$',
        formatExample: '123456789',
        formatDescription: '9 digits',
        hasChecksum: false,
        placeholder: '123456789',
      },
      {
        fieldName: 'siret',
        displayName: 'SIRET',
        required: false,
        format: '^\\d{14}$',
        formatExample: '12345678900012',
        formatDescription: '14 digits (SIREN + establishment)',
        hasChecksum: false,
        placeholder: '12345678900012',
      },
    ],
    region: 'EU',
    taxSystem: 'VAT',
    verificationApi: {
      name: 'EU VIES',
      endpoint: 'https://ec.europa.eu/taxation_customs/vies/checkVatService',
      requiresAuth: false,
      realTime: true,
    },
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: true,
      invoiceLanguage: 'either',
    },
  },

  IN: {
    countryCode: 'IN',
    countryName: 'India',
    primaryId: {
      fieldName: 'pan',
      displayName: 'PAN',
      required: true,
      format: '^[A-Z]{5}\\d{4}[A-Z]{1}$',
      formatExample: 'ABCDE1234F',
      formatDescription: '10 characters (5 letters, 4 digits, 1 letter)',
      validationLibrary: 'stdnum:IN-PAN',
      hasChecksum: false,
      placeholder: 'ABCDE1234F',
    },
    secondaryIds: [
      {
        fieldName: 'gstin',
        displayName: 'GSTIN',
        required: false,
        format: '^\\d{2}[A-Z]{5}\\d{4}[A-Z]{1}[A-Z\\d]{1}[Z]{1}[A-Z\\d]{1}$',
        formatExample: '29ABCDE1234F1Z5',
        formatDescription: '15 characters (includes PAN)',
        validationLibrary: 'stdnum:IN-GSTIN',
        hasChecksum: true,
        placeholder: '29ABCDE1234F1Z5',
      },
    ],
    region: 'APAC',
    taxSystem: 'GST',
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: true,
      invoiceLanguage: 'english',
    },
  },

  NL: {
    countryCode: 'NL',
    countryName: 'Netherlands',
    primaryId: {
      fieldName: 'vatNumber',
      displayName: 'VAT Number',
      displayNameLocal: 'BTW-nummer',
      required: true,
      format: '^NL\\d{9}B\\d{2}$',
      formatExample: 'NL123456789B01',
      formatDescription: 'NL + 9 digits + B + 2 digits',
      validationLibrary: 'jsvat',
      hasChecksum: true,
      placeholder: 'NL123456789B01',
    },
    secondaryIds: [
      {
        fieldName: 'kvkNumber',
        displayName: 'KVK Number',
        displayNameLocal: 'KVK-nummer',
        required: false,
        format: '^\\d{8}$',
        formatExample: '12345678',
        formatDescription: '8 digits',
        hasChecksum: false,
        placeholder: '12345678',
      },
    ],
    region: 'EU',
    taxSystem: 'VAT',
    verificationApi: {
      name: 'EU VIES',
      endpoint: 'https://ec.europa.eu/taxation_customs/vies/checkVatService',
      requiresAuth: false,
      realTime: true,
    },
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: true,
      invoiceLanguage: 'either',
    },
  },

  CN: {
    countryCode: 'CN',
    countryName: 'China',
    primaryId: {
      fieldName: 'uscc',
      displayName: 'USCC',
      displayNameLocal: '统一社会信用代码',
      required: true,
      format: '^[0-9A-HJ-NPQRTUWXY]{18}$',
      formatExample: '91110000123456789X',
      formatDescription: '18 characters (alphanumeric)',
      hasChecksum: true,
      placeholder: '91110000123456789X',
    },
    region: 'APAC',
    taxSystem: 'VAT',
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: true,
      invoiceLanguage: 'either',
    },
  },

  // ============================================================
  // PHASE 2: NEXT 10 COUNTRIES
  // ============================================================

  JP: {
    countryCode: 'JP',
    countryName: 'Japan',
    primaryId: {
      fieldName: 'corporateNumber',
      displayName: 'Corporate Number',
      displayNameLocal: '法人番号',
      required: true,
      format: '^[1-9]\\d{12}$',
      formatExample: '1130001011420',
      formatDescription: '13 digits (first digit is checksum 1-9)',
      hasChecksum: true,
      placeholder: '1130001011420',
    },
    region: 'APAC',
    taxSystem: 'VAT',
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: false,
      invoiceLanguage: 'either',
    },
  },

  BR: {
    countryCode: 'BR',
    countryName: 'Brazil',
    primaryId: {
      fieldName: 'cnpj',
      displayName: 'CNPJ',
      required: true,
      format: '^\\d{2}\\.?\\d{3}\\.?\\d{3}\\/?\\d{4}-?\\d{2}$',
      formatExample: '12.345.678/0001-90',
      formatDescription: '14 digits (XX.XXX.XXX/XXXX-XX)',
      validationLibrary: 'stdnum:BR-CNPJ',
      hasChecksum: true,
      placeholder: '12.345.678/0001-90',
    },
    region: 'Americas',
    taxSystem: 'VAT',
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: true,
      invoiceLanguage: 'local',
    },
  },

  MX: {
    countryCode: 'MX',
    countryName: 'Mexico',
    primaryId: {
      fieldName: 'rfc',
      displayName: 'RFC',
      required: true,
      format: '^[A-Z]{3,4}\\d{6}[A-Z0-9]{3}$',
      formatExample: 'ABC010101ABC',
      formatDescription: '12-13 characters (business: 12, individual: 13)',
      hasChecksum: false,
      placeholder: 'ABC010101ABC',
    },
    region: 'Americas',
    taxSystem: 'VAT',
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: true,
      invoiceLanguage: 'either',
    },
  },

  ES: {
    countryCode: 'ES',
    countryName: 'Spain',
    primaryId: {
      fieldName: 'vatNumber',
      displayName: 'VAT Number',
      displayNameLocal: 'NIF/CIF',
      required: true,
      format: '^ES[A-Z0-9]\\d{7}[A-Z0-9]$',
      formatExample: 'ESA12345678',
      formatDescription: 'ES + letter/number + 7 digits + letter/number',
      validationLibrary: 'jsvat',
      hasChecksum: true,
      placeholder: 'ESA12345678',
    },
    region: 'EU',
    taxSystem: 'VAT',
    verificationApi: {
      name: 'EU VIES',
      endpoint: 'https://ec.europa.eu/taxation_customs/vies/checkVatService',
      requiresAuth: false,
      realTime: true,
    },
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: true,
      invoiceLanguage: 'either',
    },
  },

  IT: {
    countryCode: 'IT',
    countryName: 'Italy',
    primaryId: {
      fieldName: 'vatNumber',
      displayName: 'VAT Number',
      displayNameLocal: 'Partita IVA',
      required: true,
      format: '^IT\\d{11}$',
      formatExample: 'IT12345678901',
      formatDescription: 'IT followed by 11 digits',
      validationLibrary: 'jsvat',
      hasChecksum: true,
      placeholder: 'IT12345678901',
    },
    region: 'EU',
    taxSystem: 'VAT',
    verificationApi: {
      name: 'EU VIES',
      endpoint: 'https://ec.europa.eu/taxation_customs/vies/checkVatService',
      requiresAuth: false,
      realTime: true,
    },
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: true,
      invoiceLanguage: 'either',
    },
  },

  ZA: {
    countryCode: 'ZA',
    countryName: 'South Africa',
    primaryId: {
      fieldName: 'vatNumber',
      displayName: 'VAT Number',
      required: false,
      format: '^4\\d{9}$',
      formatExample: '4123456789',
      formatDescription: '10 digits starting with 4',
      hasChecksum: false,
      placeholder: '4123456789',
    },
    region: 'MEA',
    taxSystem: 'VAT',
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: false,
      invoiceLanguage: 'english',
    },
  },

  NZ: {
    countryCode: 'NZ',
    countryName: 'New Zealand',
    primaryId: {
      fieldName: 'irdNumber',
      displayName: 'IRD Number',
      required: true,
      format: '^\\d{8,9}$',
      formatExample: '123456789',
      formatDescription: '8-9 digits',
      hasChecksum: true,
      placeholder: '123456789',
    },
    secondaryIds: [
      {
        fieldName: 'nzbn',
        displayName: 'NZBN',
        required: false,
        format: '^\\d{13}$',
        formatExample: '1234567890123',
        formatDescription: '13 digits',
        hasChecksum: false,
        placeholder: '1234567890123',
      },
    ],
    region: 'APAC',
    taxSystem: 'GST',
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: false,
      invoiceLanguage: 'english',
    },
  },

  CH: {
    countryCode: 'CH',
    countryName: 'Switzerland',
    primaryId: {
      fieldName: 'uid',
      displayName: 'UID',
      displayNameLocal: 'CHE',
      required: true,
      format: '^CHE-\\d{3}\\.\\d{3}\\.\\d{3}( (MWST|TVA|IVA))?$',
      formatExample: 'CHE-116.281.710 MWST',
      formatDescription: 'CHE-NNN.NNN.NNN + language suffix',
      hasChecksum: true,
      placeholder: 'CHE-116.281.710',
    },
    region: 'Other',
    taxSystem: 'VAT',
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: false,
      invoiceLanguage: 'either',
    },
  },

  IE: {
    countryCode: 'IE',
    countryName: 'Ireland',
    primaryId: {
      fieldName: 'vatNumber',
      displayName: 'VAT Number',
      required: true,
      format: '^IE\\d{7}[A-Z]{1,2}$|^IE\\d[A-Z]\\d{5}[A-Z]$',
      formatExample: 'IE1234567AB',
      formatDescription: 'IE + 7-8 digits/letters',
      validationLibrary: 'jsvat',
      hasChecksum: true,
      placeholder: 'IE1234567AB',
    },
    region: 'EU',
    taxSystem: 'VAT',
    verificationApi: {
      name: 'EU VIES',
      endpoint: 'https://ec.europa.eu/taxation_customs/vies/checkVatService',
      requiresAuth: false,
      realTime: true,
    },
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: true,
      invoiceLanguage: 'english',
    },
  },

  SE: {
    countryCode: 'SE',
    countryName: 'Sweden',
    primaryId: {
      fieldName: 'vatNumber',
      displayName: 'VAT Number',
      displayNameLocal: 'Momsregistreringsnummer',
      required: true,
      format: '^SE\\d{10}01$',
      formatExample: 'SE123456789001',
      formatDescription: 'SE + 10 digits + 01',
      validationLibrary: 'jsvat',
      hasChecksum: true,
      placeholder: 'SE123456789001',
    },
    region: 'EU',
    taxSystem: 'VAT',
    verificationApi: {
      name: 'EU VIES',
      endpoint: 'https://ec.europa.eu/taxation_customs/vies/checkVatService',
      requiresAuth: false,
      realTime: true,
    },
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: true,
      invoiceLanguage: 'either',
    },
  },

  // ============================================================
  // PHASE 3: REMAINING 10 COUNTRIES
  // ============================================================

  BE: {
    countryCode: 'BE',
    countryName: 'Belgium',
    primaryId: {
      fieldName: 'vatNumber',
      displayName: 'VAT Number',
      displayNameLocal: 'BTW-nummer / N° TVA',
      required: true,
      format: '^BE0?\\d{9}$',
      formatExample: 'BE0123456789',
      formatDescription: 'BE + optional 0 + 9 digits',
      validationLibrary: 'jsvat',
      hasChecksum: true,
      placeholder: 'BE0123456789',
    },
    region: 'EU',
    taxSystem: 'VAT',
    verificationApi: {
      name: 'EU VIES',
      endpoint: 'https://ec.europa.eu/taxation_customs/vies/checkVatService',
      requiresAuth: false,
      realTime: true,
    },
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: true,
      invoiceLanguage: 'either',
    },
  },

  PL: {
    countryCode: 'PL',
    countryName: 'Poland',
    primaryId: {
      fieldName: 'vatNumber',
      displayName: 'VAT Number',
      displayNameLocal: 'NIP',
      required: true,
      format: '^PL\\d{10}$',
      formatExample: 'PL1234567890',
      formatDescription: 'PL followed by 10 digits',
      validationLibrary: 'jsvat',
      hasChecksum: true,
      placeholder: 'PL1234567890',
    },
    region: 'EU',
    taxSystem: 'VAT',
    verificationApi: {
      name: 'EU VIES',
      endpoint: 'https://ec.europa.eu/taxation_customs/vies/checkVatService',
      requiresAuth: false,
      realTime: true,
    },
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: true,
      invoiceLanguage: 'either',
    },
  },

  KR: {
    countryCode: 'KR',
    countryName: 'South Korea',
    primaryId: {
      fieldName: 'brn',
      displayName: 'Business Registration Number',
      displayNameLocal: '사업자등록번호',
      required: true,
      format: '^\\d{3}-?\\d{2}-?\\d{5}$',
      formatExample: '123-45-67890',
      formatDescription: '10 digits (NNN-NN-NNNNN)',
      hasChecksum: false,
      placeholder: '123-45-67890',
    },
    region: 'APAC',
    taxSystem: 'VAT',
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: false,
      invoiceLanguage: 'either',
    },
  },

  MY: {
    countryCode: 'MY',
    countryName: 'Malaysia',
    primaryId: {
      fieldName: 'businessNumber',
      displayName: 'Company Registration No.',
      required: true,
      format: '^\\d{6,12}$',
      formatExample: '123456789012',
      formatDescription: '6-12 digits',
      hasChecksum: false,
      placeholder: '123456789012',
    },
    secondaryIds: [
      {
        fieldName: 'gstNumber',
        displayName: 'GST Number',
        required: false,
        format: '^[A-Z0-9]{10}$',
        formatExample: 'A01234567890',
        formatDescription: '10 alphanumeric characters',
        hasChecksum: false,
        placeholder: 'A01234567890',
      },
    ],
    region: 'APAC',
    taxSystem: 'GST',
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: false,
      invoiceLanguage: 'english',
    },
  },

  AE: {
    countryCode: 'AE',
    countryName: 'United Arab Emirates',
    primaryId: {
      fieldName: 'trn',
      displayName: 'Tax Registration Number',
      displayNameLocal: 'TRN',
      required: false,
      format: '^\\d{15}$',
      formatExample: '123456789012345',
      formatDescription: '15 digits',
      hasChecksum: false,
      placeholder: '123456789012345',
    },
    region: 'MEA',
    taxSystem: 'VAT',
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: true,
      invoiceLanguage: 'either',
    },
  },

  NO: {
    countryCode: 'NO',
    countryName: 'Norway',
    primaryId: {
      fieldName: 'orgNumber',
      displayName: 'Organization Number',
      displayNameLocal: 'Organisasjonsnummer',
      required: true,
      format: '^\\d{9}$',
      formatExample: '123456789',
      formatDescription: '9 digits',
      hasChecksum: true,
      placeholder: '123456789',
    },
    secondaryIds: [
      {
        fieldName: 'vatNumber',
        displayName: 'VAT Number',
        displayNameLocal: 'MVA-nummer',
        required: false,
        format: '^NO\\d{9}MVA$',
        formatExample: 'NO123456789MVA',
        formatDescription: 'NO + 9 digits + MVA',
        hasChecksum: true,
        placeholder: 'NO123456789MVA',
      },
    ],
    region: 'Other',
    taxSystem: 'VAT',
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: false,
      invoiceLanguage: 'either',
    },
  },

  DK: {
    countryCode: 'DK',
    countryName: 'Denmark',
    primaryId: {
      fieldName: 'cvrNumber',
      displayName: 'CVR Number',
      displayNameLocal: 'CVR-nummer',
      required: true,
      format: '^\\d{8}$',
      formatExample: '12345678',
      formatDescription: '8 digits',
      hasChecksum: true,
      placeholder: '12345678',
    },
    secondaryIds: [
      {
        fieldName: 'vatNumber',
        displayName: 'VAT Number',
        displayNameLocal: 'Momsregistreringsnummer',
        required: false,
        format: '^DK\\d{8}$',
        formatExample: 'DK12345678',
        formatDescription: 'DK + 8 digits (same as CVR)',
        hasChecksum: true,
        placeholder: 'DK12345678',
      },
    ],
    region: 'EU',
    taxSystem: 'VAT',
    verificationApi: {
      name: 'EU VIES',
      endpoint: 'https://ec.europa.eu/taxation_customs/vies/checkVatService',
      requiresAuth: false,
      realTime: true,
    },
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: true,
      invoiceLanguage: 'either',
    },
  },

  AT: {
    countryCode: 'AT',
    countryName: 'Austria',
    primaryId: {
      fieldName: 'vatNumber',
      displayName: 'VAT Number',
      displayNameLocal: 'UID-Nummer',
      required: true,
      format: '^ATU\\d{8}$',
      formatExample: 'ATU12345678',
      formatDescription: 'ATU followed by 8 digits',
      validationLibrary: 'jsvat',
      hasChecksum: true,
      placeholder: 'ATU12345678',
    },
    region: 'EU',
    taxSystem: 'VAT',
    verificationApi: {
      name: 'EU VIES',
      endpoint: 'https://ec.europa.eu/taxation_customs/vies/checkVatService',
      requiresAuth: false,
      realTime: true,
    },
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: true,
      invoiceLanguage: 'either',
    },
  },

  FI: {
    countryCode: 'FI',
    countryName: 'Finland',
    primaryId: {
      fieldName: 'businessId',
      displayName: 'Business ID',
      displayNameLocal: 'Y-tunnus',
      required: true,
      format: '^\\d{7}-\\d{1}$',
      formatExample: '1234567-8',
      formatDescription: '7 digits + hyphen + checksum',
      hasChecksum: true,
      placeholder: '1234567-8',
    },
    secondaryIds: [
      {
        fieldName: 'vatNumber',
        displayName: 'VAT Number',
        displayNameLocal: 'ALV-numero',
        required: false,
        format: '^FI\\d{8}$',
        formatExample: 'FI12345678',
        formatDescription: 'FI + 8 digits',
        hasChecksum: true,
        placeholder: 'FI12345678',
      },
    ],
    region: 'EU',
    taxSystem: 'VAT',
    verificationApi: {
      name: 'EU VIES',
      endpoint: 'https://ec.europa.eu/taxation_customs/vies/checkVatService',
      requiresAuth: false,
      realTime: true,
    },
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: true,
      invoiceLanguage: 'either',
    },
  },

  HK: {
    countryCode: 'HK',
    countryName: 'Hong Kong',
    primaryId: {
      fieldName: 'brn',
      displayName: 'Business Registration Number',
      displayNameLocal: 'BRN',
      required: true,
      format: '^\\d{8}$',
      formatExample: '12345678',
      formatDescription: '8 digits',
      hasChecksum: false,
      placeholder: '12345678',
    },
    region: 'APAC',
    taxSystem: 'None',
    invoiceRequirements: {
      mustShowOnInvoice: true,
      mustShowCustomerTaxId: false,
      invoiceLanguage: 'either',
    },
  },
};

/**
 * Get all country codes
 */
export const getAllCountryCodes = (): string[] => {
  return Object.keys(COUNTRY_TAX_CONFIGS);
};

/**
 * Get countries grouped by region
 */
export const getCountriesByRegion = (): Record<RegionType, CountryTaxConfig[]> => {
  const grouped: Record<RegionType, CountryTaxConfig[]> = {
    Americas: [],
    EU: [],
    APAC: [],
    MEA: [],
    Other: [],
  };

  Object.values(COUNTRY_TAX_CONFIGS).forEach((config) => {
    grouped[config.region].push(config);
  });

  return grouped;
};

/**
 * Get field configuration by field name
 */
export const getFieldConfig = (
  config: CountryTaxConfig,
  fieldName: string
): TaxIdFieldConfig | undefined => {
  if (config.primaryId.fieldName === fieldName) {
    return config.primaryId;
  }
  return config.secondaryIds?.find((field) => field.fieldName === fieldName);
};

/**
 * Check if country is in EU and has VIES verification
 */
export const hasVIESVerification = (countryCode: string): boolean => {
  const config = COUNTRY_TAX_CONFIGS[countryCode];
  return config?.verificationApi?.name === 'EU VIES';
};

/**
 * Get display label for a tax ID field (prefer local name)
 */
export const getDisplayLabel = (config: CountryTaxConfig, fieldName: string): string => {
  const field = getFieldConfig(config, fieldName);
  if (!field) return fieldName;
  return field.displayNameLocal || field.displayName;
};
