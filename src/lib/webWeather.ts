/**
 * ============================================================
 *  ПОГОДА ДЛЯ ВЕБ-ВЕРСИИ
 * ============================================================
 *
 *  Положить в:  src/lib/webWeather.ts
 *
 *  Берёт погоду напрямую из Open-Meteo — как в мобильном
 *  приложении. Ключ не нужен, backend не участвует.
 *
 *  Геолокация в браузере:
 *   - работает только по HTTPS (GitHub Pages подходит)
 *   - браузер сам спросит разрешение у пользователя
 *   - если откажется — показываем погоду по Москве,
 *     чтобы блок не выглядел сломанным
 * ============================================================
 */

export interface Weather {
  city: string;
  temperature: number;
  feels: number;
  description: string;
  main: string;
  wind: number;
}

/** Сколько считать кеш свежим. */
const CACHE_TTL = 15 * 60 * 1000;

/** Ключ в localStorage — чтобы не запрашивать при каждом заходе. */
const CACHE_KEY = "wardrobe_weather";

/** Координаты по умолчанию, если геолокация недоступна. */
const FALLBACK = { latitude: 55.7558, longitude: 37.6173 };

/* ============================================================
   РАСШИФРОВКА КОДОВ ПОГОДЫ (WMO)
   ============================================================ */

const WEATHER_CODES: Record<number, { description: string; main: string }> = {
  0: { description: "ясно", main: "Clear" },
  1: { description: "малооблачно", main: "Clouds" },
  2: { description: "переменная облачность", main: "Clouds" },
  3: { description: "пасмурно", main: "Clouds" },
  45: { description: "туман", main: "Fog" },
  48: { description: "изморозь", main: "Fog" },
  51: { description: "лёгкая морось", main: "Drizzle" },
  53: { description: "морось", main: "Drizzle" },
  55: { description: "сильная морось", main: "Drizzle" },
  56: { description: "ледяная морось", main: "Drizzle" },
  57: { description: "сильная ледяная морось", main: "Drizzle" },
  61: { description: "небольшой дождь", main: "Rain" },
  63: { description: "дождь", main: "Rain" },
  65: { description: "сильный дождь", main: "Rain" },
  66: { description: "ледяной дождь", main: "Rain" },
  67: { description: "сильный ледяной дождь", main: "Rain" },
  71: { description: "небольшой снег", main: "Snow" },
  73: { description: "снег", main: "Snow" },
  75: { description: "сильный снег", main: "Snow" },
  77: { description: "снежная крупа", main: "Snow" },
  80: { description: "кратковременный дождь", main: "Rain" },
  81: { description: "ливень", main: "Rain" },
  82: { description: "сильный ливень", main: "Rain" },
  85: { description: "снегопад", main: "Snow" },
  86: { description: "сильный снегопад", main: "Snow" },
  95: { description: "гроза", main: "Thunderstorm" },
  96: { description: "гроза с градом", main: "Thunderstorm" },
  99: { description: "сильная гроза с градом", main: "Thunderstorm" },
};

function decodeWeather(code: number) {
  return (
    WEATHER_CODES[code] ?? {
      description: "переменная облачность",
      main: "Clouds",
    }
  );
}

/** Эмодзи для блока погоды. */
export function weatherEmoji(main: string): string {
  switch (main) {
    case "Clear":
      return "☀️";
    case "Rain":
    case "Drizzle":
      return "🌧";
    case "Snow":
      return "❄️";
    case "Thunderstorm":
      return "⛈";
    case "Fog":
      return "🌫";
    default:
      return "☁️";
  }
}

/* ============================================================
   ЗАПРОСЫ
   ============================================================ */

async function fetchJson<T>(url: string, timeout = 10_000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/** Спросить координаты у браузера. */
function getPosition(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(FALLBACK);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      // Отказ или ошибка — показываем Москву
      () => resolve(FALLBACK),
      { timeout: 8000, maximumAge: 10 * 60 * 1000 }
    );
  });
}

/** Название города по координатам. */
async function getCityName(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    const data = await fetchJson<{
      locality?: string;
      city?: string;
      principalSubdivision?: string;
    }>(
      `https://api.bigdatacloud.net/data/reverse-geocode-client` +
        `?latitude=${latitude}&longitude=${longitude}&localityLanguage=ru`,
      6000
    );

    return data.locality || data.city || data.principalSubdivision || "";
  } catch {
    return "";
  }
}

/* ============================================================
   ГЛАВНАЯ ФУНКЦИЯ
   ============================================================ */

export async function getWeather(): Promise<Weather | null> {
  // 1. Свежий кеш из localStorage
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached = JSON.parse(raw) as { value: Weather; at: number };
      if (Date.now() - cached.at < CACHE_TTL) return cached.value;
    }
  } catch {
    // localStorage может быть недоступен — не страшно
  }

  try {
    const { latitude, longitude } = await getPosition();

    const [forecast, city] = await Promise.all([
      fetchJson<{
        current?: {
          temperature_2m: number;
          apparent_temperature: number;
          weather_code: number;
          wind_speed_10m: number;
        };
      }>(
        `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${latitude}&longitude=${longitude}` +
          `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m` +
          `&wind_speed_unit=ms&timezone=auto`
      ),
      getCityName(latitude, longitude),
    ]);

    const current = forecast.current;
    if (!current) return null;

    const decoded = decodeWeather(current.weather_code);

    const weather: Weather = {
      city,
      temperature: Math.round(current.temperature_2m * 10) / 10,
      feels: Math.round(current.apparent_temperature * 10) / 10,
      description: decoded.description,
      main: decoded.main,
      wind: Math.round(current.wind_speed_10m * 10) / 10,
    };

    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ value: weather, at: Date.now() })
      );
    } catch {
      // Приватный режим — просто не кешируем
    }

    return weather;
  } catch {
    return null;
  }
}
