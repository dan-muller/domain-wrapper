const unset = Symbol("unset");

/**
 * @summary
 * The `Unset` type is a utility type that represents a unique symbol `unset`.
 *
 * @desc
 * The `Unset` type is defined as the type of the `unset` symbol. This symbol can be used to represent a unique value that indicates the absence or unsetting of a value.
 *
 * @example
 * ```typescript
 * // Example 1: Using the `Unset` type in a function that can unset a value
 * function unsetValue<T>(value: T | Unset): T | undefined {
 *   return value === unset ? undefined : value;
 * }
 * ```
 **/
export type Unset = typeof unset;
