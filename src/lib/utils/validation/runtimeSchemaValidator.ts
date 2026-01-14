import type { AutoUIConfig } from '../../types';
import type { AutoUIAppSchema, TypeDefinition } from '../../build-time/typeSchemaPlugin';

const schemaCache = new Map<string, AutoUIAppSchema | null>();
const schemaLoadAttempted = new Set<string>();

async function loadRuntimeSchema(schemaPath?: string): Promise<AutoUIAppSchema | null> {
  const path = schemaPath || '.autoui-runtime-schema.json';
  
  if (schemaLoadAttempted.has(path)) {
    return schemaCache.get(path) || null;
  }
  
  schemaLoadAttempted.add(path);
  
  try {
    let schemaData: AutoUIAppSchema | undefined;
    
    if (path.startsWith('http://') || path.startsWith('https://')) {
      console.log(`📥 [Runtime Validation] Fetching schema from URL: ${path}`);
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to fetch schema: ${response.status} ${response.statusText}`);
      }
      schemaData = await response.json();
    }
    else {
      const possiblePaths = [
        path.startsWith('/') ? path : `/${path}`, 
        `/public/${path}`, 
        path, 
      ];
      
      let lastError: Error | null = null;
      for (const tryPath of possiblePaths) {
        try {
          console.log(`📥 [Runtime Validation] Trying to fetch schema from: ${tryPath}`);
          const response = await fetch(tryPath);
          if (response.ok) {
            schemaData = await response.json();
            console.log(`✅ [Runtime Validation] Successfully loaded schema from: ${tryPath}`);
            break;
          } else {
            lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (fetchError) {
          lastError = fetchError instanceof Error ? fetchError : new Error(String(fetchError));
          continue;
        }
      }
      
      if (!schemaData) {
        throw lastError || new Error(`Failed to load schema from any path: ${possiblePaths.join(', ')}`);
      }
    }
    
    if (schemaData && schemaData.types && schemaData.components && schemaData.functions) {
      console.log('✅ [Runtime Validation] Runtime schema loaded successfully', {
        path,
        types: Object.keys(schemaData.types).length,
        components: Object.keys(schemaData.components).length,
        functions: Object.keys(schemaData.functions).length,
      });
      schemaCache.set(path, schemaData);
      return schemaData;
    } else {
      console.warn('⚠️ [Runtime Validation] Runtime schema has invalid structure');
      schemaCache.set(path, null);
      return null;
    }
  } catch (error) {
    console.warn(`⚠️ [Runtime Validation] Runtime schema file not found at "${path}":`, error);
    schemaCache.set(path, null);
    return null;
  }
}

export async function getRuntimeSchemaAsync(config?: AutoUIConfig): Promise<AutoUIAppSchema | null> {
  const schemaPath = config?.runtime?.runtimeSchemaPath || '.autoui-runtime-schema.json';
  return await loadRuntimeSchema(schemaPath);
}

export function resolveType(typeName: string, schema: AutoUIAppSchema): TypeDefinition | null {
  return schema.types[typeName] || null;
}

function validateValueAgainstType(
  value: any,
  typeDef: TypeDefinition,
  typeName: string,
  schema: AutoUIAppSchema,
  path: string = '',
): string[] {
  const errors: string[] = [];
  const displayPath = path || 'value';
  const indent = '  '.repeat((path.match(/\./g) || []).length + 1);

  console.log(`${indent}🔎 [Type Validation] Validating "${displayPath}" against type "${typeName}"`);
  console.log(`${indent}   📦 Value:`, value);
  console.log(`${indent}   🔍 Value type: ${typeof value}, isArray: ${Array.isArray(value)}, isNull: ${value === null}`);
  console.log(`${indent}   📋 Type definition:`, JSON.stringify(typeDef, null, 2));

  if (value === undefined || value === null) {
    console.log(`${indent}   ℹ️  Value is ${value === undefined ? 'undefined' : 'null'} - skipping (optionality checked at prop/param level)`);
    return errors; 
  }

  switch (typeDef.type) {
    case 'primitive':
      console.log(`${indent}   🔍 Checking primitive type: "${typeName}"`);
      if (typeName === 'string' && typeof value !== 'string') {
        const errorMsg = `${displayPath} must be a string, got ${typeof value}`;
        console.log(`${indent}   ❌ ${errorMsg}`);
        errors.push(errorMsg);
      } else if (typeName === 'number' && (typeof value !== 'number' || isNaN(value))) {
        const errorMsg = `${displayPath} must be a number, got ${typeof value}`;
        console.log(`${indent}   ❌ ${errorMsg}`);
        errors.push(errorMsg);
      } else if (typeName === 'boolean' && typeof value !== 'boolean') {
        const errorMsg = `${displayPath} must be a boolean, got ${typeof value}`;
        console.log(`${indent}   ❌ ${errorMsg}`);
        errors.push(errorMsg);
      } else {
        console.log(`${indent}   ✅ Primitive type check passed`);
      }
      break;

    case 'enum':
      console.log(`${indent}   🔍 Checking enum type with values:`, typeDef.values);
      if (typeDef.values && Array.isArray(typeDef.values)) {
        if (!typeDef.values.includes(value)) {
          const errorMsg = `${displayPath} must be one of: ${typeDef.values.join(', ')}, got: ${value}`;
          console.log(`${indent}   ❌ ${errorMsg}`);
          errors.push(errorMsg);
        } else {
          console.log(`${indent}   ✅ Enum value check passed`);
        }
      }
      break;

    case 'array':
      console.log(`${indent}   🔍 Checking array type`);
      if (!Array.isArray(value)) {
        const errorMsg = `${displayPath} must be an array, got ${typeof value}`;
        console.log(`${indent}   ❌ ${errorMsg}`);
        console.log(`${indent}   💡 Value is:`, value);
        console.log(`${indent}   💡 Value constructor:`, value?.constructor?.name);
        if (typeof value === 'string') {
          console.log(`${indent}   💡 String value might be JSON - attempting to parse...`);
          try {
            const parsed = JSON.parse(value);
            console.log(`${indent}   💡 Parsed successfully! Type: ${typeof parsed}, isArray: ${Array.isArray(parsed)}`);
            if (Array.isArray(parsed)) {
              console.log(`${indent}   ⚠️  WARNING: Value is a JSON string that should be parsed before validation!`);
            }
          } catch (e) {
            console.log(`${indent}   💡 String is not valid JSON`);
          }
        }
        errors.push(errorMsg);
      } else {
        console.log(`${indent}   ✅ Array type check passed (length: ${value.length})`);
        if (typeDef.items) {
          const itemTypeName = typeDef.items.type;
          console.log(`${indent}   🔍 Validating array items against type: "${itemTypeName}"`);
          const itemTypeDef = resolveType(itemTypeName, schema);
          if (itemTypeDef) {
            value.forEach((item, index) => {
              console.log(`${indent}   📦 Validating item [${index}]:`, item);
              const itemErrors = validateValueAgainstType(
                item,
                itemTypeDef,
                itemTypeName,
                schema,
                `${path}[${index}]`,
              );
              errors.push(...itemErrors);
            });
          } else {
            console.log(`${indent}   ⚠️  Item type "${itemTypeName}" not found in schema`);
          }
        }
      }
      break;

    case 'object':
      console.log(`${indent}   🔍 Checking object type`);
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        const errorMsg = `${displayPath} must be an object, got ${typeof value}`;
        console.log(`${indent}   ❌ ${errorMsg}`);
        errors.push(errorMsg);
      } else if (typeDef.properties) {
        console.log(`${indent}   ✅ Object type check passed`);
        console.log(`${indent}   🔍 Validating object properties:`, Object.keys(typeDef.properties));
        Object.entries(typeDef.properties).forEach(([propName, propRef]) => {
          const propValue = (value as any)[propName];
          const propPath = path ? `${path}.${propName}` : propName;

          console.log(`${indent}   📦 Property "${propName}":`, propValue);

          if (propRef.required && (propValue === undefined || propValue === null)) {
            const errorMsg = `${propPath} is required but was ${propValue === undefined ? 'undefined' : 'null'}`;
            console.log(`${indent}   ❌ ${errorMsg}`);
            errors.push(errorMsg);
          }

          if (propValue !== undefined && propValue !== null) {
            const propTypeDef = resolveType(propRef.type, schema);
            if (propTypeDef) {
              const propErrors = validateValueAgainstType(
                propValue,
                propTypeDef,
                propRef.type,
                schema,
                propPath,
              );
              errors.push(...propErrors);
            }
          }
        });
      }
      break;

    case 'union':
      console.log(`${indent}   🔍 Checking union type with members:`, typeDef.refs);
      if (typeDef.refs && typeDef.refs.length > 0) {
        const unionErrors: string[] = [];
        for (const refTypeName of typeDef.refs) {
          console.log(`${indent}   🔍 Trying union member: "${refTypeName}"`);
          const refTypeDef = resolveType(refTypeName, schema);
          if (refTypeDef) {
            const refErrors = validateValueAgainstType(value, refTypeDef, refTypeName, schema, path);
            if (refErrors.length === 0) {
              console.log(`${indent}   ✅ Union member "${refTypeName}" validated successfully`);
              return [];
            }
            console.log(`${indent}   ❌ Union member "${refTypeName}" failed:`, refErrors);
            unionErrors.push(...refErrors);
          }
        }
        const errorMsg = `${displayPath} does not match any union member. Errors: ${unionErrors.join('; ')}`;
        console.log(`${indent}   ❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
      break;
  }

  if (errors.length === 0) {
    console.log(`${indent}   ✅ Type validation passed for "${displayPath}"`);
  } else {
    console.log(`${indent}   ❌ Type validation failed for "${displayPath}" with ${errors.length} error(s)`);
  }

  return errors;
}

export function validateComponentPropsRuntime(
  componentName: string,
  props: Record<string, any>,
  schema: AutoUIAppSchema,
): string[] {
  const errors: string[] = [];

  console.log(`\n🔍 [Runtime Validation] ==========================================`);
  console.log(`🔍 [Runtime Validation] Starting validation for component: "${componentName}"`);
  console.log(`🔍 [Runtime Validation] Raw props received:`, JSON.stringify(props, null, 2));
  console.log(`🔍 [Runtime Validation] Props type check:`, Object.entries(props).map(([k, v]) => `${k}: ${typeof v} (${Array.isArray(v) ? 'array' : typeof v})`));

  const component = schema.components[componentName];
  if (!component) {
    console.warn(`⚠️ [Runtime Validation] Component "${componentName}" not found in schema`);
    console.log(`   Available components:`, Object.keys(schema.components));
    return errors;
  }

  console.log(`✅ [Runtime Validation] Found component schema for "${componentName}"`);
  console.log(`📋 [Runtime Validation] Component schema:`, JSON.stringify(component.props, null, 2));

  Object.entries(component.props).forEach(([propName, propRef]) => {
    console.log(`\n  📌 [Runtime Validation] Validating prop: "${propName}"`);
    console.log(`     📥 [Runtime Validation] Prop reference:`, JSON.stringify(propRef, null, 2));
    
    const propValue = props[propName];
    console.log(`     📦 [Runtime Validation] Prop value received:`, propValue);
    console.log(`     🔎 [Runtime Validation] Prop value type: ${typeof propValue}`);
    console.log(`     🔎 [Runtime Validation] Prop value isArray: ${Array.isArray(propValue)}`);
    console.log(`     🔎 [Runtime Validation] Prop value isNull: ${propValue === null}`);
    console.log(`     🔎 [Runtime Validation] Prop value isUndefined: ${propValue === undefined}`);
    
    if (typeof propValue === 'string') {
      console.log(`     📝 [Runtime Validation] String value length: ${propValue.length}`);
      console.log(`     📝 [Runtime Validation] String preview: ${propValue.substring(0, 100)}${propValue.length > 100 ? '...' : ''}`);
      try {
        const parsed = JSON.parse(propValue);
        console.log(`     🔄 [Runtime Validation] String appears to be JSON! Parsed as:`, typeof parsed);
        if (Array.isArray(parsed)) {
          console.log(`     🔄 [Runtime Validation] Parsed JSON is an array with ${parsed.length} items`);
        }
      } catch (e) {
        console.log(`     ℹ️  [Runtime Validation] String is not valid JSON`);
      }
    }

    if (propRef.required && (propValue === undefined || propValue === null)) {
      const errorMsg = `Prop "${propName}" is required but was ${propValue === undefined ? 'undefined' : 'null'}`;
      console.log(`     ❌ [Runtime Validation] ${errorMsg}`);
      errors.push(errorMsg);
      return;
    }

    if (propValue !== undefined && propValue !== null) {
      console.log(`     🔍 [Runtime Validation] Resolving type: "${propRef.type}"`);
      const propTypeDef = resolveType(propRef.type, schema);
      if (propTypeDef) {
        console.log(`     ✅ [Runtime Validation] Type definition found:`, JSON.stringify(propTypeDef, null, 2));
        console.log(`     🔄 [Runtime Validation] Starting type validation...`);
        const propErrors = validateValueAgainstType(
          propValue,
          propTypeDef,
          propRef.type,
          schema,
          propName,
        );
        if (propErrors.length > 0) {
          console.log(`     ❌ [Runtime Validation] Validation failed with ${propErrors.length} error(s):`, propErrors);
        } else {
          console.log(`     ✅ [Runtime Validation] Prop "${propName}" passed validation`);
        }
        errors.push(...propErrors);
      } else {
        console.warn(`     ⚠️ [Runtime Validation] Type "${propRef.type}" not found in schema for prop "${propName}"`);
        console.log(`     📋 [Runtime Validation] Available types:`, Object.keys(schema.types).slice(0, 10));
      }
    } else {
      console.log(`     ℹ️  [Runtime Validation] Prop "${propName}" is ${propValue === undefined ? 'undefined' : 'null'} - skipping validation`);
    }
  });

  console.log(`\n📊 [Runtime Validation] Validation summary for "${componentName}":`);
  if (errors.length === 0) {
    console.log(`   ✅ All props validated successfully`);
  } else {
    console.log(`   ❌ Found ${errors.length} validation error(s):`, errors);
  }
  console.log(`🔍 [Runtime Validation] ==========================================\n`);

  return errors;
}

export interface ParsePropsError {
  propName: string;
  expectedType: string;
  receivedValue: any;
  errorType: 'invalid_json' | 'type_mismatch' | 'parsing_failed';
  message: string;
  suggestion?: string;
}

export interface ParsePropsResult {
  props: Record<string, any>;
  errors: ParsePropsError[];
  warnings: string[];
}

export function parseJsonStringsInProps(
  props: Record<string, any>,
  componentName: string,
  schema: AutoUIAppSchema,
): ParsePropsResult {
  const errors: ParsePropsError[] = [];
  const warnings: string[] = [];
  const parsedProps: Record<string, any> = { ...props };

  const component = schema.components[componentName];
  if (!component) {
    warnings.push(`Component "${componentName}" not found in schema - skipping JSON parsing`);
    return { props: parsedProps, errors, warnings };
  }

  Object.entries(component.props).forEach(([propName, propRef]) => {
    const propValue = parsedProps[propName];
    
    if (typeof propValue === 'string') {
      const propTypeDef = resolveType(propRef.type, schema);
      if (propTypeDef && (propTypeDef.type === 'array' || propTypeDef.type === 'object')) {
        const expectedType = propTypeDef.type;
        const valuePreview = propValue.length > 100 
          ? `${propValue.substring(0, 100)}... (${propValue.length} chars)` 
          : propValue;
        
        console.log(`🔄 [Parse Props] Attempting to parse prop "${propName}" (expected type: ${expectedType}, value: "${valuePreview}")`);
        
        try {
          const parsed = JSON.parse(propValue);
          
          if (expectedType === 'array' && Array.isArray(parsed)) {
            console.log(`✅ [Parse Props] Successfully parsed JSON string for prop "${propName}" as array (${parsed.length} items)`);
            parsedProps[propName] = parsed;
          } else if (expectedType === 'object' && typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            console.log(`✅ [Parse Props] Successfully parsed JSON string for prop "${propName}" as object`);
            parsedProps[propName] = parsed;
          } else {
            const receivedType = Array.isArray(parsed) ? 'array' : typeof parsed;
            errors.push({
              propName,
              expectedType,
              receivedValue: propValue,
              errorType: 'type_mismatch',
              message: `Prop "${propName}" was parsed as JSON but type doesn't match. Expected ${expectedType}, got ${receivedType}`,
              suggestion: `Ensure the context variable contains a valid ${expectedType} JSON string (e.g., ${expectedType === 'array' ? '[...]' : '{...}'})`,
            });
            console.warn(`⚠️ [Parse Props] ${errors[errors.length - 1].message}`);
          }
        } catch (parseError) {
          const isJsonLike = propValue.trim().startsWith('[') || propValue.trim().startsWith('{');
          const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
          
          if (isJsonLike) {
            errors.push({
              propName,
              expectedType,
              receivedValue: propValue,
              errorType: 'parsing_failed',
              message: `Prop "${propName}" appears to be JSON but failed to parse: ${errorMessage}`,
              suggestion: `Check that the JSON string is valid. Received: "${valuePreview}"`,
            });
            console.error(`❌ [Parse Props] Failed to parse JSON string for prop "${propName}" (expected ${expectedType}): ${errorMessage}`);
          } else {    
            errors.push({
              propName,
              expectedType,
              receivedValue: propValue,
              errorType: 'invalid_json',
              message: `Prop "${propName}" is a string but not in JSON format. Expected ${expectedType}, got: "${propValue}"`,
              suggestion: propRef.required 
                ? `The prop "${propName}" is required and should be a ${expectedType} (array or object). Check that the context variable contains the correct data structure.`
                : `The prop "${propName}" should be a ${expectedType} if provided. Current value: "${propValue}"`,
            });
            console.warn(`⚠️ [Parse Props] Prop "${propName}" is a string but not JSON format (expected ${expectedType}, got: "${propValue}")`);
          }
        }
      }
    }
  });

  return { props: parsedProps, errors, warnings };
}

export function validateFunctionParamsRuntime(
  functionName: string,
  params: Record<string, any>,
  schema: AutoUIAppSchema,
): string[] {
  const errors: string[] = [];

  console.log(`\n🔍 [Runtime Validation] ==========================================`);
  console.log(`🔍 [Runtime Validation] Starting validation for function: "${functionName}"`);
  console.log(`🔍 [Runtime Validation] Raw params received:`, JSON.stringify(params, null, 2));
  console.log(`🔍 [Runtime Validation] Params type check:`, Object.entries(params).map(([k, v]) => `${k}: ${typeof v} (${Array.isArray(v) ? 'array' : typeof v})`));

  const func = schema.functions[functionName];
  if (!func) {
    console.warn(`⚠️ [Runtime Validation] Function "${functionName}" not found in schema`);
    console.log(`   Available functions:`, Object.keys(schema.functions));
    return errors;
  }

  console.log(`✅ [Runtime Validation] Found function schema for "${functionName}"`);
  console.log(`📋 [Runtime Validation] Function schema:`, JSON.stringify(func.params, null, 2));

  Object.entries(func.params).forEach(([paramName, paramRef]) => {
    console.log(`\n  📌 [Runtime Validation] Validating param: "${paramName}"`);
    console.log(`     📥 [Runtime Validation] Param reference:`, JSON.stringify(paramRef, null, 2));
    
    const paramValue = params[paramName];
    console.log(`     📦 [Runtime Validation] Param value received:`, paramValue);
    console.log(`     🔎 [Runtime Validation] Param value type: ${typeof paramValue}`);
    console.log(`     🔎 [Runtime Validation] Param value isArray: ${Array.isArray(paramValue)}`);

    if (paramRef.required && (paramValue === undefined || paramValue === null)) {
      const errorMsg = `Param "${paramName}" is required but was ${paramValue === undefined ? 'undefined' : 'null'}`;
      console.log(`     ❌ [Runtime Validation] ${errorMsg}`);
      errors.push(errorMsg);
      return;
    }

    if (paramValue !== undefined && paramValue !== null) {
      console.log(`     🔍 [Runtime Validation] Resolving type: "${paramRef.type}"`);
      const paramTypeDef = resolveType(paramRef.type, schema);
      if (paramTypeDef) {
        console.log(`     ✅ [Runtime Validation] Type definition found:`, JSON.stringify(paramTypeDef, null, 2));
        console.log(`     🔄 [Runtime Validation] Starting type validation...`);
        const paramErrors = validateValueAgainstType(
          paramValue,
          paramTypeDef,
          paramRef.type,
          schema,
          paramName,
        );
        if (paramErrors.length > 0) {
          console.log(`     ❌ [Runtime Validation] Validation failed with ${paramErrors.length} error(s):`, paramErrors);
        } else {
          console.log(`     ✅ [Runtime Validation] Param "${paramName}" passed validation`);
        }
        errors.push(...paramErrors);
      } else {
        console.warn(`     ⚠️ [Runtime Validation] Type "${paramRef.type}" not found in schema for param "${paramName}"`);
      }
    } else {
      console.log(`     ℹ️  [Runtime Validation] Param "${paramName}" is ${paramValue === undefined ? 'undefined' : 'null'} - skipping validation`);
    }
  });

  console.log(`\n📊 [Runtime Validation] Validation summary for "${functionName}":`);
  if (errors.length === 0) {
    console.log(`   ✅ All params validated successfully`);
  } else {
    console.log(`   ❌ Found ${errors.length} validation error(s):`, errors);
  }
  console.log(`🔍 [Runtime Validation] ==========================================\n`);

  return errors;
}

export async function getValidationSchemaRuntime(
  config: AutoUIConfig,
  functionName?: string,
  componentName?: string,
): Promise<{ components: Array<{ name: string; props: Record<string, { type: string; required: boolean }> }>; functions: Array<{ name: string; params: Record<string, { type: string; required: boolean }>; returns: { type: string } }> } | null> {
  const runtimeSchema = await getRuntimeSchemaAsync(config);
  if (!runtimeSchema) {
    console.warn('⚠️ [Runtime Validation] Runtime schema not available');
    return null;
  }

  const version = config.metadata?.appVersion || '1.0.0';
  if (runtimeSchema.appId !== config.appId || runtimeSchema.version !== version) {
    console.warn(
      `⚠️ [Runtime Validation] Schema version mismatch. Expected: ${config.appId}@${version}, Got: ${runtimeSchema.appId}@${runtimeSchema.version}`,
    );
  }

  const components = componentName
    ? runtimeSchema.components[componentName]
      ? [{ name: componentName, props: runtimeSchema.components[componentName].props }]
      : []
    : Object.entries(runtimeSchema.components).map(([name, component]) => ({
        name,
        props: component.props,
      }));

  const functions = functionName
    ? runtimeSchema.functions[functionName]
      ? [{ name: functionName, params: runtimeSchema.functions[functionName].params, returns: runtimeSchema.functions[functionName].returns }]
      : []
    : Object.entries(runtimeSchema.functions).map(([name, func]) => ({
        name,
        params: func.params,
        returns: func.returns,
      }));

  return {
    components,
    functions,
  };
}

