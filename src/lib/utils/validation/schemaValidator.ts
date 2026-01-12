export interface TypeSchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  optional?: boolean;
  properties?: Record<string, TypeSchema>;
  items?: TypeSchema; 
}

export interface ComponentSchema {
  name: string;
  props: Record<string, TypeSchema>;
}

export interface FunctionSchema {
  name: string;
  params: Record<string, TypeSchema>;
  returns: TypeSchema;
}

export interface ValidationSchemas {
  components: ComponentSchema[];
  functions: FunctionSchema[];
}

export function validateValue(value: any, schema: TypeSchema, path: string = ''): string[] {
  const errors: string[] = [];
  const displayPath = path || 'value';

  if (schema.optional && (value === undefined || value === null)) {
    console.log(`     ✓ [Validation] ${displayPath} is optional and ${value === undefined ? 'undefined' : 'null'} - skipping validation`);
    return errors;
  }

  if (!schema.optional && (value === undefined || value === null)) {
    const errorMsg = `${displayPath} is required but was ${value === undefined ? 'undefined' : 'null'}`;
    errors.push(errorMsg);
    console.log(`     ✗ [Validation] ${errorMsg}`);
    return errors;
  }

  console.log(`     🔎 [Validation] Validating ${displayPath} as type "${schema.type}"`);

  switch (schema.type) {
    case 'string':
      if (typeof value !== 'string') {
        const errorMsg = `${displayPath} must be a string, got ${typeof value}`;
        errors.push(errorMsg);
        console.log(`     ✗ [Validation] ${errorMsg}`);
      } else {
        console.log(`     ✓ [Validation] ${displayPath} is a valid string`);
      }
      break;

    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        const errorMsg = `${displayPath} must be a number, got ${typeof value}`;
        errors.push(errorMsg);
        console.log(`     ✗ [Validation] ${errorMsg}`);
      } else {
        console.log(`     ✓ [Validation] ${displayPath} is a valid number: ${value}`);
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        const errorMsg = `${displayPath} must be a boolean, got ${typeof value}`;
        errors.push(errorMsg);
        console.log(`     ✗ [Validation] ${errorMsg}`);
      } else {
        console.log(`     ✓ [Validation] ${displayPath} is a valid boolean: ${value}`);
      }
      break;

    case 'array':
      if (!Array.isArray(value)) {
        const errorMsg = `${displayPath} must be an array, got ${typeof value}`;
        errors.push(errorMsg);
        console.log(`     ✗ [Validation] ${errorMsg}`);
      } else {
        console.log(`     ✓ [Validation] ${displayPath} is an array with ${value.length} item(s)`);
        if (schema.items) {
          console.log(`     🔍 [Validation] Validating array items of ${displayPath}...`);
          value.forEach((item, index) => {
            const itemErrors = validateValue(item, schema.items!, `${path}[${index}]`);
            errors.push(...itemErrors);
          });
        }
      }
      break;

    case 'object':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        const errorMsg = `${displayPath} must be an object, got ${typeof value}`;
        errors.push(errorMsg);
        console.log(`     ✗ [Validation] ${errorMsg}`);
      } else if (schema.properties) {
        console.log(`     ✓ [Validation] ${displayPath} is an object, validating properties...`);
        Object.entries(schema.properties).forEach(([propName, propSchema]) => {
          const propValue = (value as any)[propName];
          const propPath = path ? `${path}.${propName}` : propName;
          const propErrors = validateValue(propValue, propSchema, propPath);
          errors.push(...propErrors);
        });
      } else {
        console.log(`     ✓ [Validation] ${displayPath} is an object (no properties schema to validate)`);
      }
      break;
  }

  return errors;
}

export function validateFunctionParams(
  params: Record<string, any>,
  schema: FunctionSchema,
): string[] {
  const errors: string[] = [];

  console.log(`🔍 [Validation] Validating function "${schema.name}" parameters:`, params);
  console.log(`📋 [Validation] Using schema:`, JSON.stringify(schema.params, null, 2));

  Object.entries(schema.params).forEach(([paramName, paramSchema]) => {
    const paramValue = params[paramName];
    const paramErrors = validateValue(paramValue, paramSchema, paramName);
    errors.push(...paramErrors);
  });

  if (errors.length === 0) {
    console.log(`✅ [Validation] Function "${schema.name}" parameters validated successfully`);
  } else {
    console.log(`❌ [Validation] Function "${schema.name}" parameter validation found ${errors.length} error(s):`, errors);
  }

  return errors;
}

export function validateComponentProps(
  props: Record<string, any>,
  schema: ComponentSchema,
): string[] {
  const errors: string[] = [];

  console.log(`🔍 [Validation] Validating component "${schema.name}" props:`, props);
  console.log(`📋 [Validation] Using schema:`, JSON.stringify(schema.props, null, 2));

  Object.entries(schema.props).forEach(([propName, propSchema]) => {
    const propValue = props[propName];
    
    console.log(`\n  📌 [Validation] Validating prop "${propName}":`);
    console.log(`     Value:`, propValue, `(type: ${typeof propValue})`);
    console.log(`     Schema:`, JSON.stringify(propSchema, null, 2));
    
    const propErrors = validateValue(propValue, propSchema, propName);
    
    if (propErrors.length === 0) {
      console.log(`     ✅ [Validation] Prop "${propName}" passed validation`);
    } else {
      console.log(`     ❌ [Validation] Prop "${propName}" failed validation:`, propErrors);
    }
    
    errors.push(...propErrors);
  });

  console.log(`\n📊 [Validation] Component "${schema.name}" validation summary:`);
  if (errors.length === 0) {
    console.log(`   ✅ All props validated successfully`);
  } else {
    console.log(`   ❌ Found ${errors.length} validation error(s):`, errors);
  }

  return errors;
}

