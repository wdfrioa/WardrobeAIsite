import { supabase } from "@/lib/supabase";

/**
 * ============================================================
 *  ДЕМО-ГАРДЕРОБ ДЛЯ БЕТА-ТЕСТЕРОВ
 * ============================================================
 *
 *  Положить в:  src/lib/demoWardrobe.ts
 *
 *  Как это работает:
 *
 *  1. Сначала ищем ваши фотографии в Supabase Storage, бакет
 *     `demo`. Папки задают категорию и пол:
 *
 *       unisex/top, unisex/bottom, unisex/shoes, ...
 *       male/top, male/bottom, ...
 *       female/dress, female/bottom, ...
 *
 *     Имя файла становится названием вещи:
 *     «Белая рубашка.jpg» → «Белая рубашка».
 *
 *  2. Если фото не загружены — рисуем силуэты прямо в браузере.
 *     Приложение не сломается, просто выглядит проще.
 *
 *  Почему не берём картинки из интернета: проверял loremflickr
 *  и unsplash — приходят случайные снимки с людьми, витринами
 *  и водяными знаками. Для гардероба не годится.
 * ============================================================
 */

export interface DemoItem {
  name: string;
  category: string;
  type: string;
  color: string;
  season: string;
  /** Готовая картинка: ссылка на фото или нарисованный силуэт. */
  imageUrl: string;
}

/* ============================================================
   ФОТО ИЗ STORAGE
   ============================================================ */

/** Папка в бакете → категория и тип вещи. */
const FOLDERS: Record<string, { category: string; type: string }> = {
  top: { category: "Верх", type: "Верх" },
  bottom: { category: "Низ", type: "Низ" },
  dress: { category: "Платья", type: "Платье" },
  shoes: { category: "Обувь", type: "Обувь" },
  outerwear: { category: "Верх", type: "Верхняя одежда" },
  accessories: { category: "Аксессуары", type: "Аксессуар" },
};

/** Имя файла → название вещи. */
function nameFromFile(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, "") // убрать расширение
    .replace(/[_-]+/g, " ") // подчёркивания и дефисы → пробелы
    .trim();
}

/**
 * Собрать вещи из одной папки бакета.
 *
 * Ошибки глотаем: если папки нет или доступ закрыт —
 * просто вернём пустой список, генератор возьмёт силуэты.
 */
async function loadFolder(path: string): Promise<DemoItem[]> {
  const folderKey = path.split("/")[1];
  const meta = FOLDERS[folderKey];
  if (!meta) return [];

  try {
    const { data, error } = await supabase.storage
      .from("demo")
      .list(path, { limit: 100 });

    if (error || !data) return [];

    return data
      // .emptyFolderPlaceholder — служебный файл Supabase
      .filter((file) => file.id && !file.name.startsWith("."))
      .map((file) => {
        const { data: pub } = supabase.storage
          .from("demo")
          .getPublicUrl(`${path}/${file.name}`);

        return {
          name: nameFromFile(file.name),
          category: meta.category,
          type: meta.type,
          color: "",
          season: "Всесезон",
          imageUrl: pub.publicUrl,
        };
      });
  } catch {
    return [];
  }
}

/** Загрузить все фото, подходящие данному полу. */
async function loadPhotos(gender: string): Promise<DemoItem[]> {
  const own = gender === "female" ? "female" : "male";

  const paths = [
    ...Object.keys(FOLDERS).map((f) => `unisex/${f}`),
    ...Object.keys(FOLDERS).map((f) => `${own}/${f}`),
  ];

  // Параллельно: папок немного, ждать по очереди незачем
  const results = await Promise.all(paths.map(loadFolder));

  return results.flat();
}

/* ============================================================
   ЗАПАСНОЙ ВАРИАНТ — НАРИСОВАННЫЕ СИЛУЭТЫ
   ============================================================ */

type Shape =
  | "top" | "shirt" | "dress" | "skirt" | "pants"
  | "shorts" | "shoe" | "boot" | "jacket" | "bag" | "watch";

interface DrawnItem {
  name: string;
  category: string;
  type: string;
  color: string;
  season: string;
  shape: Shape;
}

const UNISEX: DrawnItem[] = [
  { name: "Белая футболка", category: "Верх", type: "Футболка", color: "Белый", season: "Лето", shape: "top" },
  { name: "Чёрная футболка", category: "Верх", type: "Футболка", color: "Чёрный", season: "Лето", shape: "top" },
  { name: "Серый худи", category: "Верх", type: "Худи", color: "Серый", season: "Демисезон", shape: "top" },
  { name: "Синие джинсы", category: "Низ", type: "Джинсы", color: "Синий", season: "Всесезон", shape: "pants" },
  { name: "Чёрные джинсы", category: "Низ", type: "Джинсы", color: "Чёрный", season: "Всесезон", shape: "pants" },
  { name: "Белые кеды", category: "Обувь", type: "Кеды", color: "Белый", season: "Лето", shape: "shoe" },
  { name: "Чёрные кроссовки", category: "Обувь", type: "Кроссовки", color: "Чёрный", season: "Демисезон", shape: "shoe" },
  { name: "Джинсовая куртка", category: "Верх", type: "Куртка", color: "Синий", season: "Демисезон", shape: "jacket" },
  { name: "Чёрное пальто", category: "Верх", type: "Пальто", color: "Чёрный", season: "Зима", shape: "jacket" },
  { name: "Наручные часы", category: "Аксессуары", type: "Часы", color: "Серебристый", season: "Всесезон", shape: "watch" },
  { name: "Бежевые шорты", category: "Низ", type: "Шорты", color: "Бежевый", season: "Лето", shape: "shorts" },
  { name: "Серые ботинки", category: "Обувь", type: "Ботинки", color: "Серый", season: "Зима", shape: "boot" },
];

const MALE: DrawnItem[] = [
  { name: "Белая рубашка", category: "Верх", type: "Рубашка", color: "Белый", season: "Всесезон", shape: "shirt" },
  { name: "Голубая рубашка", category: "Верх", type: "Рубашка", color: "Голубой", season: "Лето", shape: "shirt" },
  { name: "Синее поло", category: "Верх", type: "Поло", color: "Синий", season: "Лето", shape: "top" },
  { name: "Бежевые чиносы", category: "Низ", type: "Брюки", color: "Бежевый", season: "Демисезон", shape: "pants" },
  { name: "Тёмные брюки", category: "Низ", type: "Брюки", color: "Тёмно-синий", season: "Всесезон", shape: "pants" },
];

const FEMALE: DrawnItem[] = [
  { name: "Чёрное платье", category: "Платья", type: "Платье", color: "Чёрный", season: "Всесезон", shape: "dress" },
  { name: "Летнее платье", category: "Платья", type: "Платье", color: "Бежевый", season: "Лето", shape: "dress" },
  { name: "Юбка миди", category: "Низ", type: "Юбка", color: "Бежевый", season: "Демисезон", shape: "skirt" },
  { name: "Джинсовая юбка", category: "Низ", type: "Юбка", color: "Синий", season: "Лето", shape: "skirt" },
  { name: "Белая блузка", category: "Верх", type: "Блузка", color: "Белый", season: "Всесезон", shape: "shirt" },
  { name: "Кожаная сумка", category: "Аксессуары", type: "Сумка", color: "Коричневый", season: "Всесезон", shape: "bag" },
];

const COLORS: Record<string, string> = {
  "Белый": "#F5F5F4",
  "Чёрный": "#2A2A2E",
  "Серый": "#9CA3AF",
  "Синий": "#3B5A8C",
  "Тёмно-синий": "#28374F",
  "Голубой": "#8FB4D9",
  "Бежевый": "#D8C3A5",
  "Коричневый": "#8B5E3C",
  "Серебристый": "#C0C4C9",
};

/** Контуры вещей. Проверял отрисовкой — читаются на маленькой карточке. */
const SHAPES: Record<Shape, string> = {
  top: '<path d="M70 55 L100 42 L130 42 L160 55 L172 80 L152 92 L148 175 L82 175 L78 92 L58 80 Z" fill="{f}" stroke="{s}" stroke-width="2.5" stroke-linejoin="round"/>',

  shirt: '<path d="M70 52 L98 40 L132 40 L160 52 L174 82 L152 94 L150 178 L80 178 L78 94 L56 82 Z" fill="{f}" stroke="{s}" stroke-width="2.5" stroke-linejoin="round"/><path d="M98 40 L115 62 L132 40" fill="none" stroke="{s}" stroke-width="3"/><path d="M115 62 L115 176" stroke="{s}" stroke-width="2.5"/><circle cx="115" cy="92" r="3" fill="{s}"/><circle cx="115" cy="120" r="3" fill="{s}"/><circle cx="115" cy="148" r="3" fill="{s}"/>',

  dress: '<path d="M78 50 L100 40 L130 40 L152 50 L162 78 L146 88 L142 108 L172 192 L58 192 L88 108 L84 88 L68 78 Z" fill="{f}" stroke="{s}" stroke-width="2.5" stroke-linejoin="round"/><path d="M84 88 Q115 100 146 88" fill="none" stroke="{s}" stroke-width="2.5"/>',

  skirt: '<path d="M78 68 L152 68 L176 178 L54 178 Z" fill="{f}" stroke="{s}" stroke-width="2.5" stroke-linejoin="round"/><path d="M78 82 L152 82" stroke="{s}" stroke-width="2.5"/>',

  pants: '<path d="M74 55 L156 55 L162 185 L126 185 L115 110 L104 185 L68 185 Z" fill="{f}" stroke="{s}" stroke-width="2.5" stroke-linejoin="round"/><path d="M74 70 L156 70" stroke="{s}" stroke-width="2.5"/>',

  shorts: '<path d="M74 62 L156 62 L160 142 L126 142 L115 104 L104 142 L70 142 Z" fill="{f}" stroke="{s}" stroke-width="2.5" stroke-linejoin="round"/><path d="M74 76 L156 76" stroke="{s}" stroke-width="2.5"/>',

  shoe: '<path d="M44 150 Q44 116 76 112 L96 110 Q106 110 112 118 L128 138 Q136 146 150 150 L172 156 Q186 160 186 172 L44 172 Z" fill="{f}" stroke="{s}" stroke-width="3" stroke-linejoin="round"/><path d="M40 170 L190 170 L190 182 Q190 188 182 188 L48 188 Q40 188 40 180 Z" fill="{s}" opacity="0.55"/><path d="M74 124 L104 134 M68 142 L100 152" stroke="{s}" stroke-width="3" stroke-linecap="round" fill="none"/>',

  boot: '<path d="M80 54 L130 54 L132 128 Q134 142 152 150 L178 162 Q186 168 182 176 L82 176 Q74 176 74 168 L74 62 Q74 54 80 54 Z" fill="{f}" stroke="{s}" stroke-width="2.5" stroke-linejoin="round"/><path d="M74 162 L182 170" stroke="{s}" stroke-width="3"/><path d="M74 82 L131 82" stroke="{s}" stroke-width="2"/>',

  jacket: '<path d="M66 52 L96 40 L115 66 L134 40 L164 52 L178 84 L156 96 L154 182 L76 182 L74 96 L52 84 Z" fill="{f}" stroke="{s}" stroke-width="2.5" stroke-linejoin="round"/><path d="M96 40 L115 66 L88 96 L82 60 Z" fill="{s}" opacity="0.25"/><path d="M134 40 L115 66 L142 96 L148 60 Z" fill="{s}" opacity="0.25"/><path d="M115 66 L115 180" stroke="{s}" stroke-width="2.5"/>',

  bag: '<path d="M86 100 Q86 52 115 52 Q144 52 144 100" fill="none" stroke="{s}" stroke-width="9" stroke-linecap="round" opacity="0.85"/><path d="M56 96 L174 96 L182 180 L48 180 Z" fill="{f}" stroke="{s}" stroke-width="3" stroke-linejoin="round"/><rect x="102" y="122" width="26" height="18" rx="4" fill="{s}" opacity="0.4"/>',

  watch: '<rect x="100" y="46" width="30" height="46" rx="6" fill="{f}" stroke="{s}" stroke-width="2.5"/><rect x="100" y="140" width="30" height="46" rx="6" fill="{f}" stroke="{s}" stroke-width="2.5"/><circle cx="115" cy="116" r="34" fill="{f}" stroke="{s}" stroke-width="2.5"/><circle cx="115" cy="116" r="25" fill="none" stroke="{s}" stroke-width="2"/><path d="M115 116 L115 100 M115 116 L127 122" stroke="{s}" stroke-width="2.5" stroke-linecap="round"/>',
};

/** Нарисовать вещь. Возвращает data:URL — сеть не нужна. */
export function drawItem(shape: Shape, colorName: string): string {
  const fill = COLORS[colorName] ?? "#B1886A";
  const stroke = colorName === "Белый" ? "#B8B4AF" : "rgba(0,0,0,0.25)";

  const body = SHAPES[shape].split("{f}").join(fill).split("{s}").join(stroke);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 230 230">
  <rect width="230" height="230" fill="#F4F3F1"/>
  ${body}
</svg>`;

  // encodeURIComponent, а не btoa — btoa падает на кириллице
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/* ============================================================
   ГЕНЕРАЦИЯ
   ============================================================ */

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Нарисованные вещи для данного пола. */
function drawnPool(gender: string): DemoItem[] {
  const pool = [...UNISEX, ...(gender === "female" ? FEMALE : MALE)];

  return pool.map((item) => ({
    name: item.name,
    category: item.category,
    type: item.type,
    color: item.color,
    season: item.season,
    imageUrl: drawItem(item.shape, item.color),
  }));
}

/**
 * Собрать случайный гардероб.
 *
 * Сначала пробуем ваши фото из бакета `demo`, если их нет —
 * рисуем силуэты.
 *
 * @param gender  male | female
 * @param count   сколько вещей
 */
export async function generateWardrobe(
  gender: string,
  count = 14
): Promise<DemoItem[]> {
  const photos = await loadPhotos(gender);

  // Меньше четырёх фото — слишком бедно, лучше силуэты
  const pool = photos.length >= 4 ? photos : drawnPool(gender);

  const picked = shuffle(pool).slice(0, Math.min(count, pool.length));

  // Следим, чтобы были и обувь, и низ — иначе стилисту
  // нечего собирать
  const hasShoes = picked.some((i) => i.category === "Обувь");
  const hasBottom = picked.some(
    (i) => i.category === "Низ" || i.category === "Платья"
  );

  if (!hasShoes) {
    const shoes = pool.find((i) => i.category === "Обувь");
    if (shoes && picked.length > 0) picked[picked.length - 1] = shoes;
  }

  if (!hasBottom) {
    const bottom = pool.find(
      (i) => i.category === "Низ" || i.category === "Платья"
    );
    if (bottom && picked.length > 1) picked[picked.length - 2] = bottom;
  }

  return picked;
}

/** Используются ли ваши фото или силуэты — для подписи в интерфейсе. */
export async function hasDemoPhotos(gender: string): Promise<boolean> {
  const photos = await loadPhotos(gender);
  return photos.length >= 4;
}
