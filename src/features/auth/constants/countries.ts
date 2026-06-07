const ALL_COUNTRY_CODES = [
  "AF", "AX", "AL", "DZ", "AS", "AD", "AO", "AI", "AQ", "AG", "AR", "AM",
  "AW", "AU", "AT", "AZ", "BS", "BH", "BD", "BB", "BY", "BE", "BZ", "BJ",
  "BM", "BT", "BO", "BQ", "BA", "BW", "BV", "BR", "IO", "BN", "BG", "BF",
  "BI", "CV", "KH", "CM", "CA", "KY", "CF", "TD", "CL", "CN", "CX", "CC",
  "CO", "KM", "CG", "CD", "CK", "CR", "CI", "HR", "CU", "CW", "CY", "CZ",
  "DK", "DJ", "DM", "DO", "EC", "EG", "SV", "GQ", "ER", "EE", "SZ", "ET",
  "FK", "FO", "FJ", "FI", "FR", "GF", "PF", "TF", "GA", "GM", "GE", "DE",
  "GH", "GI", "GR", "GL", "GD", "GP", "GU", "GT", "GG", "GN", "GW", "GY",
  "HT", "HM", "VA", "HN", "HK", "HU", "IS", "IN", "ID", "IR", "IQ", "IE",
  "IM", "IL", "IT", "JM", "JP", "JE", "JO", "KZ", "KE", "KI", "KP", "KR",
  "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LY", "LI", "LT", "LU", "MO",
  "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MQ", "MR", "MU", "YT", "MX",
  "FM", "MD", "MC", "MN", "ME", "MS", "MA", "MZ", "MM", "NA", "NR", "NP",
  "NL", "NC", "NZ", "NI", "NE", "NG", "NU", "NF", "MK", "MP", "NO", "OM",
  "PK", "PW", "PS", "PA", "PG", "PY", "PE", "PH", "PN", "PL", "PT", "PR",
  "QA", "RE", "RO", "RU", "RW", "BL", "SH", "KN", "LC", "MF", "PM", "VC",
  "WS", "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SX", "SK", "SI",
  "SB", "SO", "ZA", "GS", "SS", "ES", "LK", "SD", "SR", "SJ", "SE", "CH",
  "SY", "TW", "TJ", "TZ", "TH", "TL", "TG", "TK", "TO", "TT", "TN", "TR",
  "TM", "TC", "TV", "UG", "UA", "AE", "GB", "UM", "US", "UY", "UZ", "VU",
  "VE", "VN", "VG", "VI", "WF", "EH", "YE", "ZM", "ZW",
] as const;

const DEFAULT_COUNTRY_CODE = "MW";

const COUNTRY_CODE_TO_NAME: Record<string, string> = {
  MW: "Malawi",
  ZA: "South Africa",
  KE: "Kenya",
  TZ: "Tanzania",
  UG: "Uganda",
  ZW: "Zimbabwe",
  ZM: "Zambia",
  GH: "Ghana",
  NG: "Nigeria",
  ET: "Ethiopia",
  RW: "Rwanda",
  BW: "Botswana",
  NA: "Namibia",
  MZ: "Mozambique",
  AO: "Angola",
  EG: "Egypt",
  SN: "Senegal",
  CI: "Ivory Coast",
  CM: "Cameroon",
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  IN: "India",
  CN: "China",
  JP: "Japan",
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  BR: "Brazil",
  MX: "Mexico",
  AR: "Argentina",
};

const regionDisplayNames =
  typeof Intl !== "undefined"
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

export function getCountryNameFromCode(code: string): string {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) {
    return "";
  }

  if (COUNTRY_CODE_TO_NAME[normalizedCode]) {
    return COUNTRY_CODE_TO_NAME[normalizedCode];
  }

  return regionDisplayNames?.of(normalizedCode) ?? normalizedCode;
}

export function getCountryCodeFromName(name: string): string | null {
  const normalizedName = name.trim().toLowerCase();
  if (!normalizedName) {
    return null;
  }

  for (const [code, countryName] of Object.entries(COUNTRY_CODE_TO_NAME)) {
    if (countryName.toLowerCase() === normalizedName) {
      return code;
    }
  }

  for (const code of ALL_COUNTRY_CODES) {
    const countryName = regionDisplayNames?.of(code);
    if (countryName?.toLowerCase() === normalizedName) {
      return code;
    }
  }

  return null;
}

export function getPrioritizedCountryCodes(
  tenantCountryName?: string | null,
): string[] {
  const tenantCode = tenantCountryName
    ? getCountryCodeFromName(tenantCountryName)
    : null;
  const primaryCode = tenantCode ?? DEFAULT_COUNTRY_CODE;
  const remainingCodes = ALL_COUNTRY_CODES.filter((code) => code !== primaryCode);

  return [primaryCode, ...remainingCodes];
}
