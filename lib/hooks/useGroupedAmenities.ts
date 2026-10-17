"use client";

import { useMemo } from "react";
import type {
  PropertyBuying,
  PropertyBuyingSection,
} from "@/lib/types/propertyBuying";
import type { PropertyBuyingCategory } from "@/lib/types/propertyBuyingCategory";

export type AmenityItem = {
  itemId: string;
  name: string;
  icon: string | null;
  displayOrder: number;
};

export type AmenityGroup = {
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  displayOrder: number;
  items: AmenityItem[];
};

export type UseGroupedAmenitiesResult = {
  groups: AmenityGroup[];
  /** Category titles only — used by the "Basic Amenities" sidebar card. */
  categories: Pick<AmenityGroup, "categoryId" | "categoryName" | "categoryIcon">[];
};

/**
 * Groups a property's `categoryValues` into their parent categories.
 *
 * Single source of truth for both "More Amenities" and the "Basic Amenities"
 * sidebar card, so the two can never drift apart.
 *
 * `fallbackName` is used when a category id isn't in the `categories` list.
 */
export function useGroupedAmenities(
  categoryValues: NonNullable<PropertyBuying["categoryValues"]>,
  categories: PropertyBuyingCategory[],
  fallbackName: string
): UseGroupedAmenitiesResult {
  return useMemo(() => {
    const categoryById = new Map(categories.map((c) => [c.id, c]));
    const groupsMap = new Map<string, AmenityGroup>();

    for (const cv of categoryValues ?? []) {
      const item = cv.propertyBuyingCategoryItem;
      if (!item) continue;

      const catId = item.propertyBuyingCategoryId;
      if (!groupsMap.has(catId)) {
        const category = categoryById.get(catId);
        groupsMap.set(catId, {
          categoryId: catId,
          categoryName: category?.name || fallbackName,
          categoryIcon: category?.defaultIcon || category?.icon || null,
          displayOrder: category?.displayOrder || 0,
          items: [],
        });
      }

      groupsMap.get(catId)!.items.push({
        itemId: item.id,
        name: item.name,
        icon: item.icon,
        displayOrder: item.displayOrder || 0,
      });
    }

    const groups = Array.from(groupsMap.values())
      .map((g) => ({
        ...g,
        items: [...g.items].sort((a, b) => a.displayOrder - b.displayOrder),
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder);

    return {
      groups,
      categories: groups.map((g) => ({
        categoryId: g.categoryId,
        categoryName: g.categoryName,
        categoryIcon: g.categoryIcon,
      })),
    };
  }, [categoryValues, categories, fallbackName]);
}