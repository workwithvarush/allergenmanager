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

export function findMenu(id: string): StandardMenu | undefined {
  return STANDARD_MENUS.find((menu) => menu.id === id);
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
    complete: false,
  }));
}
