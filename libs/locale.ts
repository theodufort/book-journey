import { Locale, defaultLocale } from "@/i18n/config";

const COOKIE_NAME = "NEXT_LOCALE";

export async function getUserLocale() {
  if (typeof window === 'undefined') {
    // Server-side
    const { cookies } = await import('next/headers');
    return cookies().get(COOKIE_NAME)?.value || defaultLocale;
  } else {
    // Client-side
    return document.cookie.split('; ').find(row => row.startsWith(COOKIE_NAME))?.split('=')[1] || defaultLocale;
  }
}

export async function setUserLocale(locale: Locale) {
  if (typeof window === 'undefined') {
    // Server-side
    const { cookies } = await import('next/headers');
    cookies().set(COOKIE_NAME, locale);
  } else {
    // Client-side
    document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  }
}
