"use client";

/**
 * ============================================================
 *  НИЖНЕЕ МЕНЮ — КАК В ПРИЛОЖЕНИИ
 * ============================================================
 *
 *  Положить в:  src/components/TabBar.tsx
 *
 *  Три вкладки: Гардероб, Стилист, Профиль.
 *  Активная подсвечивается синим #5E5CE6, как в приложении.
 *
 *  Панель зафиксирована внизу и учитывает «шторку» iPhone
 *  через safe-area-inset-bottom — иначе на телефонах с чёлкой
 *  подписи залезали бы под системную полоску.
 * ============================================================
 */

export type Tab = "wardrobe" | "stylist" | "profile";

const TABS: { id: Tab; emoji: string; label: string }[] = [
  { id: "wardrobe", emoji: "👕", label: "Гардероб" },
  { id: "stylist", emoji: "✨", label: "Стилист" },
  { id: "profile", emoji: "👤", label: "Профиль" },
];

export default function TabBar({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (tab: Tab) => void;
}) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white
                 border-t border-black/[0.06]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="max-w-lg mx-auto flex">
        {TABS.map((tab) => {
          const isActive = active === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex-1 flex flex-col items-center gap-1 py-2.5
                         transition active:scale-95"
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className="text-[22px] leading-none transition"
                style={{ opacity: isActive ? 1 : 0.45 }}
              >
                {tab.emoji}
              </span>

              <span
                className="text-[11px] font-semibold leading-none"
                style={{ color: isActive ? "#5E5CE6" : "#A1A1AA" }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
