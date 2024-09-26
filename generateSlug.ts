export function generateSlug(city: string, stateAbbr: string): string {
  return `libraries-in-${city.toLowerCase().replace(/\s+/g, "-")}-${stateAbbr.toLowerCase()}`;
}

export function parseSlug(slug: string): { city: string; stateAbbr: string } | null {
  const match = slug.match(/libraries-in-(.+)-(.+)/);
  if (!match) {
    return null;
  }
  const [, city, stateAbbr] = match;
  return {
    city: city.replace(/-/g, " "),
    stateAbbr: stateAbbr.toUpperCase()
  };
}
