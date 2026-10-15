import type { AllergenId } from "@/lib/allergens";
import type { AllergenMark, DietaryTag, Dish } from "@/lib/events";

/** A dish on a standard menu, with the allergens and tags recorded the last time it was served. */
export type MenuDish = {
  section: string;
  name: string;
  allergens?: Partial<Record<AllergenId, AllergenMark>>;
  tags?: readonly DietaryTag[];
};

export type StandardMenu = {
  id: string;
  name: string;
  dishes: readonly MenuDish[];
  /** Retired menus aren't offered for new events or menu changes; events already using them keep their dishes. */
  retired?: boolean;
};

/**
 * EMCC's standard menus, from the prototype, with each dish's allergens and
 * dietary tags as previously recorded (the street food menu has none yet).
 * Menus B and C list two unnamed placeholder desserts in the prototype; they
 * are left out here.
 */
export const STANDARD_MENUS = [
  {
    id: "A",
    name: "Menu A",
    dishes: [
      { section: "Starter", name: "White bean panzanella salad", allergens: { gluten: "present" }, tags: ["v", "vg"] },
      { section: "Starter", name: "Korean style carrot & cucumber salad", allergens: { sesame: "may" }, tags: ["vg", "ncgi"] },
      { section: "Main", name: "Roasted chicken skewers with hot honey, coconut & lemongrass sauce", allergens: { soya: "may" }, tags: ["ncgi"] },
      { section: "Main", name: "Sweet potato & bell pepper laksa", allergens: { soya: "present", peanuts: "may" }, tags: ["v", "vg", "ncgi"] },
      { section: "Main", name: "Grilled mackerel with soy, ginger, horseradish & lime cream", allergens: { fish: "present", soya: "present", milk: "present" }, tags: ["ncgi"] },
      { section: "Main", name: "'Arroz rojo', Mexican style fried rice", allergens: { sulphites: "may" }, tags: ["v", "vg", "ncgi"] },
      { section: "Main", name: "Maple tahini roast carrots & butternut squash", allergens: { sesame: "present" }, tags: ["v", "vg", "ncgi"] },
      { section: "Dessert", name: "Red velvet cake", allergens: { gluten: "present", eggs: "present", milk: "present" }, tags: ["v"] },
      { section: "Dessert", name: "Chocolate cake", allergens: { gluten: "present", eggs: "present", milk: "present" }, tags: ["v"] },
    ],
  },
  {
    id: "B",
    name: "Menu B",
    dishes: [
      { section: "Starter", name: "Spiced chickpea, spinach & apricot, quinoa salad", tags: ["v", "vg", "ncgi"] },
      { section: "Starter", name: "'Kachumber' salad tomato, cucumber, red onion", tags: ["v", "vg", "ncgi"] },
      { section: "Main", name: "Lamb kofta with tomato baharat", tags: ["ncgi"] },
      { section: "Main", name: "Roasted tofu with green beans, mushrooms served in a black bean sauce", allergens: { soya: "present" }, tags: ["v", "vg", "ncgi"] },
      { section: "Main", name: "Baked salmon with sweet chilli & spring onion glaze", allergens: { fish: "present" }, tags: ["ncgi"] },
      { section: "Main", name: "Stir fried bok choi with sesame, garlic & ginger", allergens: { sesame: "present" }, tags: ["v", "vg", "ncgi"] },
      { section: "Main", name: "Coconut rice, coriander and pickled raisins", allergens: { sulphites: "may" }, tags: ["v", "vg", "ncgi"] },
    ],
  },
  {
    id: "C",
    name: "Menu C",
    dishes: [
      { section: "Starter", name: "Celeriac and carrot slaw with honey & grain mustard", allergens: { mustard: "present" }, tags: ["v", "vg", "ncgi"] },
      { section: "Starter", name: "Nicoise salad romaine, tomato, olive, green bean & herbed potato", tags: ["v", "vg", "ncgi"] },
      { section: "Main", name: "Roasted thigh of chicken with maple, harissa sauce", tags: ["ncgi", "df"] },
      { section: "Main", name: "Moroccan spiced chickpea & mint falafel, lime & coriander dressing", tags: ["v", "vg", "ncgi"] },
      { section: "Main", name: "Tikka spiced pollock with roast peppers", allergens: { fish: "present" }, tags: ["ncgi", "df"] },
      { section: "Main", name: "Garlic & paprika wedges with gremolata", tags: ["v", "vg", "ncgi"] },
      { section: "Main", name: "Lemon & thyme roasted courgettes, spinach & pumpkin seeds", tags: ["v", "vg", "ncgi"] },
    ],
  },
  {
    id: "D",
    name: "Street food menu",
    dishes: [
      { section: "Main", name: "Kobob Koobideh" },
      { section: "Main", name: "Acili Ezme Vegan Kabob" },
      { section: "Main", name: "Chicken & Waffles" },
      { section: "Main", name: "Beef Rendang" },
      { section: "Main", name: "Steamed Rice" },
      { section: "Main", name: "Patatas Bravas & Salsa Verde" },
      { section: "Main", name: "Soya 'Chicken' Gulai Nangka" },
      { section: "Main", name: "Kimchi & Buttermilk Chicken Slider" },
      { section: "Main", name: "Quorn Burger" },
      { section: "Main", name: "Flatbread" },
      { section: "Dessert", name: "Pastels De Nata" },
      { section: "Dessert", name: "Churros, Chocolate Sauce" },
      { section: "Dessert", name: "Gula Melaka Doughnuts" },
    ],
  },
] as const satisfies readonly StandardMenu[];

export type StandardMenuId = (typeof STANDARD_MENUS)[number]["id"];

/** One of the built-in menus (the seed data for the menu editor). */
export function findMenu(id: string): StandardMenu | undefined {
  return STANDARD_MENUS.find((menu) => menu.id === id);
}

/** The menus offered for new events and menu changes. */
export function activeMenus(menus: readonly StandardMenu[]): StandardMenu[] {
  return menus.filter((menu) => !menu.retired);
}

/** Sections a dish can sit in, in menu order (as on the printed menu). */
export const MENU_SECTIONS = ["Starter", "Main", "Side", "Dessert", "AM", "Lunch", "PM", "Other"] as const;

export const MAX_MENU_NAME = 40;
export const MAX_MENU_DISHES = 60;
export const MAX_MENU_DISH_NAME = 120;

export type MenuErrors = { name?: string; dishes?: string; dishNames?: Record<number, string> };

/**
 * Checks a menu from the menu editor; run in the browser and again on the
 * server. `others` are the venue's other menus, for unique names.
 */
export function validateMenu(
  menu: { name: string; dishes: readonly { section: string; name: string }[] },
  others: readonly StandardMenu[],
): MenuErrors {
  const errors: MenuErrors = {};
  const name = menu.name.trim();
  if (!name) errors.name = "Menu name is required";
  else if (name.length > MAX_MENU_NAME) errors.name = `Menu name must be ${MAX_MENU_NAME} characters or fewer`;
  else if (others.some((m) => m.name.trim().toLocaleLowerCase("en-GB") === name.toLocaleLowerCase("en-GB"))) {
    errors.name = "Another menu already has this name";
  }
  if (menu.dishes.length === 0) errors.dishes = "A menu needs at least one dish";
  else if (menu.dishes.length > MAX_MENU_DISHES) errors.dishes = `A menu can hold at most ${MAX_MENU_DISHES} dishes`;
  const dishNames: Record<number, string> = {};
  menu.dishes.forEach((dish, i) => {
    if (!dish.name.trim()) dishNames[i] = "Dish name is required";
    else if (dish.name.trim().length > MAX_MENU_DISH_NAME) dishNames[i] = `Dish name must be ${MAX_MENU_DISH_NAME} characters or fewer`;
    if (!(MENU_SECTIONS as readonly string[]).includes(dish.section)) dishNames[i] ??= "Choose a section";
  });
  if (Object.keys(dishNames).length) errors.dishNames = dishNames;
  return errors;
}

export function hasMenuErrors(errors: MenuErrors): boolean {
  return Boolean(errors.name || errors.dishes || errors.dishNames);
}

/**
 * Fresh, empty dishes for a standard menu: no allergen entry, nothing complete.
 * As in the prototype, recorded allergens are not copied — every event is checked afresh.
 */
export function instantiateMenu(menu: StandardMenu): Dish[] {
  return menu.dishes.map((dish, i) => ({
    id: `d${i + 1}`,
    section: dish.section,
    name: dish.name,
    allergens: {},
    tags: [],
    mayContain: "",
    notes: {},
    complete: false,
  }));
}
