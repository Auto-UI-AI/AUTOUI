/**
 * Add product to user cart.
 * Adds a product to the current user's shopping cart.
 *
 * @param params - Cart operation parameters
 * @param params.productId - The ID of the product to add
 * @returns Promise resolving to operation result
 *
 * @example
 * ```ts
 * const result = await addToCart({ productId: "123" });
 * if (result.ok) {
 *   console.log("Product added successfully");
 * }
 * ```
 */
export interface AddToCartParams {
  productId: string;
}

export interface AddToCartResult {
  ok: boolean;
  message?: string;
}

export async function addToCart(params: AddToCartParams): Promise<AddToCartResult> {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: true,
        message: `Product ${params.productId} added to cart successfully`,
      });
    }, 100);
  });
}
