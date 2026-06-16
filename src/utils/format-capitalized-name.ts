/**
 * Capitalizes the first character of each word and lowercases the rest.
 * e.g. "OWEN ONIONS" → "Owen Onions", "owen onions" → "Owen Onions"
 */
export function formatCapitalizedName(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  return trimmed
    .split(/\s+/)
    .map((word) => {
      if (!word) {
        return "";
      }

      const [first, ...rest] = word;
      return `${first.toLocaleUpperCase()}${rest.join("").toLocaleLowerCase()}`;
    })
    .join(" ");
}
