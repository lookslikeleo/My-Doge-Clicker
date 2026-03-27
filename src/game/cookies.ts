export function readNumberCookie(name: string, fallback: number) {
  const cookies = document.cookie.split(';').map((cookie) => cookie.trim());
  const targetCookie = cookies.find((cookie) => cookie.startsWith(`${name}=`));

  if (!targetCookie) {
    return fallback;
  }

  const value = Number.parseFloat(decodeURIComponent(targetCookie.split('=')[1]));
  return Number.isFinite(value) ? value : fallback;
}

export function writeNumberCookie(name: string, value: number) {
  document.cookie = `${name}=${encodeURIComponent(value.toString())}; path=/; max-age=31536000; SameSite=Lax`;
}

export function readStringCookie(name: string, fallback: string) {
  const cookies = document.cookie.split(';').map((cookie) => cookie.trim());
  const targetCookie = cookies.find((cookie) => cookie.startsWith(`${name}=`));

  if (!targetCookie) {
    return fallback;
  }

  return decodeURIComponent(targetCookie.split('=')[1]) || fallback;
}

export function writeStringCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
}
