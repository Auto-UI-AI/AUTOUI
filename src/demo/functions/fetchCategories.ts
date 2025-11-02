/**
 * Return product categories.
 * Retrieves all available product categories for filtering.
 *
 * @returns Promise resolving to an array of category strings
 *
 * @example
 * ```ts
 * const categories = await fetchCategories();
 * // Returns: ["All", "Tops", "Bottoms", "Shoes", "Accessories"]
 * ```
 */
export async function fetchCategories(): Promise<string[]> {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(['All', 'Tops', 'Bottoms', 'Shoes', 'Accessories']);
    }, 100);
  });
}
