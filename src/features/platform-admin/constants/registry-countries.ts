export type RegistryCountry = {
  code: string;
  name: string;
};

/** Shown before the user searches. The full ISO list is available through search. */
export const FEATURED_REGISTRY_COUNTRIES: RegistryCountry[] = [
  { code: "MW", name: "Malawi" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" },
  { code: "MZ", name: "Mozambique" },
  { code: "TZ", name: "Tanzania" },
  { code: "KE", name: "Kenya" },
  { code: "UG", name: "Uganda" },
  { code: "RW", name: "Rwanda" },
  { code: "ZA", name: "South Africa" },
  { code: "BW", name: "Botswana" },
  { code: "NA", name: "Namibia" },
  { code: "GH", name: "Ghana" },
  { code: "NG", name: "Nigeria" },
  { code: "ET", name: "Ethiopia" },
];

const ISO_COUNTRY_CODES = `
AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ
BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ
CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ
DE DJ DK DM DO DZ
EC EE EG EH ER ES ET
FI FJ FK FM FO FR
GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY
HK HM HN HR HT HU
ID IE IL IM IN IO IQ IR IS IT
JE JM JO JP
KE KG KH KI KM KN KP KR KW KY KZ
LA LB LC LI LK LR LS LT LU LV LY
MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ
NA NC NE NF NG NI NL NO NP NR NU NZ
OM
PA PE PF PG PH PK PL PM PN PR PS PT PW PY
QA
RE RO RS RU RW
SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ
TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ
UA UG UM US UY UZ
VA VC VE VG VI VN VU
WF WS
YE YT
ZA ZM ZW
`.trim().split(/\s+/);

let allCountries: RegistryCountry[] | null = null;

export function listRegistryCountries(): RegistryCountry[] {
  if (allCountries) {
    return allCountries;
  }

  let display: Intl.DisplayNames | null = null;
  try {
    display = new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    display = null;
  }

  allCountries = ISO_COUNTRY_CODES.map((code) => {
    const featured = FEATURED_REGISTRY_COUNTRIES.find((country) => country.code === code);
    const resolved = display?.of(code);
    const name = resolved && resolved !== code ? resolved : featured?.name ?? code;
    return { code, name };
  }).sort((left, right) => left.name.localeCompare(right.name));

  return allCountries;
}

export function searchRegistryCountries(query: string): RegistryCountry[] {
  const term = query.trim().toLowerCase();
  if (!term) {
    return FEATURED_REGISTRY_COUNTRIES;
  }

  return listRegistryCountries().filter((country) => {
    return (
      country.name.toLowerCase().includes(term) ||
      country.code.toLowerCase().includes(term)
    );
  });
}
