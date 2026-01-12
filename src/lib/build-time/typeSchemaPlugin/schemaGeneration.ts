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

  console.log(`[AutoUI Type Schema] Starting schema generation for appId: ${appId}, version: ${version}`);
  const { components: componentRegistrations, functions: functionRegistrations } = findRegistrations(project);
  console.log(`[AutoUI Type Schema] Found ${componentRegistrations.length} component(s) and ${functionRegistrations.length} function(s)`);

  const components: Array<{ name: string } & ComponentDefinition> = [];
  for (const { name, type } of componentRegistrations) {
    console.log(`\n[AutoUI Type Schema] ========================================`);
    console.log(`[AutoUI Type Schema] Processing Component: "${name}"`);
    console.log(`[AutoUI Type Schema] ========================================`);
    const props = extractComponentProps(type, context);
    components.push({ name, props });
    console.log(`[AutoUI Type Schema] ✓ Component "${name}" processed with ${Object.keys(props).length} prop(s)`);
  }

  const functions: Array<{ name: string } & FunctionDefinition> = [];
  for (const { name, type } of functionRegistrations) {
    console.log(`\n[AutoUI Type Schema] ========================================`);
    console.log(`[AutoUI Type Schema] Processing Function: "${name}"`);
    console.log(`[AutoUI Type Schema] ========================================`);
    const { params, returns } = extractFunctionSignature(type, context);
    functions.push({ name, params, returns });
    console.log(`[AutoUI Type Schema] ✓ Function "${name}" processed with ${Object.keys(params).length} param(s), return type: "${returns.type}"`);
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

