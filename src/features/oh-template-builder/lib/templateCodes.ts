const NON_CODE_CHARS = /[^a-z0-9]+/g;
const EDGE_UNDERSCORES = /^_+|_+$/g;

function slug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(NON_CODE_CHARS, "_")
    .replace(EDGE_UNDERSCORES, "");
}

/** Template and item codes are UPPER_SNAKE (e.g. `PRE_EMP`, `BLOOD_PRESSURE`). */
export function toUpperCode(value: string) {
  return slug(value).toUpperCase();
}

/** Library section codes are lower_snake (e.g. `vital_signs`). */
export function toSectionCode(value: string) {
  return slug(value);
}
