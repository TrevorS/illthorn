// ABOUTME: Type definitions for constructor functions used in mixins
// ABOUTME: Provides proper typing for mixin patterns in TypeScript

/**
 * Generic constructor type for mixin patterns
 */
export type Constructor<T = Record<string, unknown>> = new (...args: Array<unknown>) => T;

/**
 * Constructor type for abstract classes
 */
export type AbstractConstructor<T = Record<string, unknown>> = abstract new (...args: Array<unknown>) => T;

/**
 * Constructor type with specific parameters
 */
export type ParameterizedConstructor<T, P extends Array<unknown> = Array<unknown>> = new (...args: P) => T;
