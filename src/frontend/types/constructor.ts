// ABOUTME: Type definitions for constructor functions used in mixins
// ABOUTME: Provides proper typing for mixin patterns in TypeScript

/**
 * Generic constructor type for mixin patterns
 */
export type Constructor<T = {}> = new (...args: Array<any>) => T;

/**
 * Constructor type for abstract classes
 */
export type AbstractConstructor<T = {}> = abstract new (...args: Array<any>) => T;

/**
 * Constructor type with specific parameters
 */
export type ParameterizedConstructor<T, P extends Array<any> = Array<any>> = new (...args: P) => T;
