export function createAffLink(search_text: string) {
  return `https://www.amazon.com/s?k=${search_text}&tag=${process.env.AMAZON_AFFILIATE_CODE}`;
}
