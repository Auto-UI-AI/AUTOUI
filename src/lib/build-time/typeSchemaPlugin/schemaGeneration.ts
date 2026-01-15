import type { Project } from 'ts-morph';
import type { AutoUIAppSchema, ComponentDefinition, FunctionDefinition, ExtractionContext } from './types';
import { findRegistrations } from './registrationDiscovery';
import { extractComponentProps } from './componentExtraction';
import { extractFunctionSignature } from './functionExtraction';

export function generateSchema(
  project: Project,
  appId: string,
  version: string,
): AutoUIAppSchema {
  const checker = project.getTypeChecker();
  
  const context: ExtractionContext = {
    project,
    checker,
    types: new Map(),
    typeNames: new Map(),
    visitedTypes: new Set(),
    anonymousTypeCounter: new Map(),
  };

  
  const { components: componentRegistrations, functions: functionRegistrations } = findRegistrations(project);
  

  const components: Record<string, ComponentDefinition> = {};
  for (const { name, type } of componentRegistrations) {
    
    
    
    const props = extractComponentProps(type, context);
    components[name] = { props };
    
  }

  const functions: Record<string, FunctionDefinition> = {};
  for (const { name, type } of functionRegistrations) {
    
    
    
    const { params, returns } = extractFunctionSignature(type, context);
    functions[name] = { params, returns };
    
  }

  const types: Record<string, import('./types').TypeDefinition> = {};
  for (const [name, definition] of context.types.entries()) {
    types[name] = definition;
  }

  return {
    appId,
    version,
    generatedAt: new Date().toISOString(),
    types,
    components,
    functions,
  };
}

