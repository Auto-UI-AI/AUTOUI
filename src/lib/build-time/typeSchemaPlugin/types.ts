export type TypeKind = 'primitive' | 'object' | 'array' | 'enum' | 'union';

export interface TypeDefinition {
  type: TypeKind;
  properties?: Record<string, { type: string; required: boolean }>;
  items?: { type: string };
  values?: string[];
  refs?: string[];
}

export interface ComponentDefinition {
  props: Record<string, { type: string; required: boolean }>;
}

export interface FunctionDefinition {
  params: Record<string, { type: string; required: boolean }>;
  returns: { type: string };
}

export interface AutoUIAppSchema {
  appId: string;
  version: string;
  generatedAt: string;
  types: Record<string, TypeDefinition>;
  components: Array<{ name: string } & ComponentDefinition>;
  functions: Array<{ name: string } & FunctionDefinition>;
}

import type { Project, Type, TypeChecker } from 'ts-morph';

export interface ExtractionContext {
  project: Project;
  checker: TypeChecker;
  types: Map<string, TypeDefinition>;
  typeNames: Map<Type, string>;
  visitedTypes: Set<Type>;
  anonymousTypeCounter: Map<string, number>;
}

