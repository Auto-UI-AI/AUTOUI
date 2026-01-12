import type { ComponentType } from 'react';

export function autouiRegisterComponentPropsSchema<T = any>(_component: ComponentType<T>): void {
  // this function is not operating at runtime, it is only for extracting the component props types at build time
}

export function autouiRegisterFunctionParamsSchema<T extends (...args: any[]) => any>(
  _fn: T,
): void {
  // this function is not operating at runtime, it is only for extracting the function parameters types at build time
}

//these functions are like markers for our plugin to know which components and functions to extract the types from into schema json file
