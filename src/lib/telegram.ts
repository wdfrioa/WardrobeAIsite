"use client";

/**
 * ============================================================
 *  ИНТЕГРАЦИЯ С TELEGRAM MINI APP
 * ============================================================
 *
 *  Положить в:  src/lib/telegram.ts
 *
 *  Когда сайт открыт внутри Telegram, доступен объект
 *  window.Telegram.WebApp. Через него можно:
 *
 *   - развернуть окно на весь экран
 *   - подобрать цвет шапки под тему приложения
 *   - узнать имя пользователя
 *   - включить подтверждение при закрытии
 *
 *  В обычном браузере объекта нет — все функции просто
 *  ничего не делают, сайт работает как раньше.
 * ============================================================
 */

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface TelegramWebApp {
  ready(): void;
  expand(): void;
  close(): void;
  isExpanded: boolean;
  viewportHeight: number;
  colorScheme: "light" | "dark";
  themeParams: Record<string, string>;
  initDataUnsafe: { user?: TelegramUser };
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  enableClosingConfirmation(): void;
  disableVerticalSwipes?(): void;
  HapticFeedback?: {
    impactOccurred(style: "light" | "medium" | "heavy"): void;
    notificationOccurred(type: "error" | "success" | "warning"): void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

/** Получить объект Telegram, если сайт открыт внутри мессенджера. */
export function tg(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
}

/** Открыт ли сайт как Mini App. */
export function isTelegram(): boolean {
  return tg() !== null;
}

/**
 * Подготовить окно Telegram.
 *
 * Вызывается один раз при запуске приложения.
 */
export function initTelegram(): void {
  const app = tg();
  if (!app) return;

  // Сообщаем Telegram, что интерфейс готов — убирает заглушку
  app.ready();

  // Разворачиваем на весь экран: по умолчанию окно занимает
  // половину высоты, и приложение выглядит зажатым
  app.expand();

  // Шапка и фон в цвет приложения
  app.setHeaderColor("#F8F6F2");
  app.setBackgroundColor("#F8F6F2");

  /*
   * Отключаем закрытие свайпом вниз.
   *
   * В приложении есть вертикальная прокрутка, и свайп по списку
   * вещей закрывал бы окно. Метод появился в Bot API 7.7,
   * поэтому проверяем наличие.
   */
  app.disableVerticalSwipes?.();
}

/** Имя пользователя из Telegram — для приветствия. */
export function telegramName(): string {
  const user = tg()?.initDataUnsafe?.user;
  if (!user) return "";

  return [user.first_name, user.last_name].filter(Boolean).join(" ");
}

/** Фото профиля из Telegram, если есть. */
export function telegramPhoto(): string | null {
  return tg()?.initDataUnsafe?.user?.photo_url ?? null;
}

/**
 * Короткая вибрация.
 *
 * Приятная мелочь: отклик при нажатии кнопок делает
 * веб-страницу похожей на нативное приложение.
 */
export function haptic(style: "light" | "medium" | "heavy" = "light"): void {
  tg()?.HapticFeedback?.impactOccurred(style);
}

/** Вибрация результата — успех или ошибка. */
export function hapticResult(type: "success" | "error" | "warning"): void {
  tg()?.HapticFeedback?.notificationOccurred(type);
}
