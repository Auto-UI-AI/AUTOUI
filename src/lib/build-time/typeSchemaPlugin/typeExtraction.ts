import type { Type } from 'ts-morph';
import { Node } from 'ts-morph';
import type { ExtractionContext } from './types';
import { isPropertyOptional, extractNonOptionalType } from './optionalDetection';
import { getTypeName } from './typeNameResolution';

export function extractType(type: Type, context: ExtractionContext): string {
  const typeName = getTypeName(type, context);
  
  if (context.types.has(typeName)) {
    return typeName;
  }

  // Preventing from infinite recursion here
  if (context.visitedTypes.has(type)) {
    return typeName;
  }
  context.visitedTypes.add(type);

  if (type.isString() || type.isStringLiteral()) {
    
    context.types.set(typeName, { type: 'primitive' });
    return typeName;
  }
  if (type.isNumber() || type.isNumberLiteral()) {
    
    context.types.set(typeName, { type: 'primitive' });
    return typeName;
  }
  if (type.isBoolean() || type.isBooleanLiteral()) {
    
    context.types.set(typeName, { type: 'primitive' });
    return typeName;
  }

  if (type.isArray()) {
    const elementType = type.getArrayElementType();
    if (elementType) {
      
      const elementTypeName = extractType(elementType, context);
      context.types.set(typeName, {
        type: 'array',
        items: { type: elementTypeName },
        refs: [elementTypeName],
      });
      
      return typeName;
    }
  }

  if (type.isEnum()) {
    const symbol = type.getSymbol();
    if (symbol) {
      const enumDeclaration = symbol.getValueDeclaration();
      if (enumDeclaration && Node.isEnumDeclaration(enumDeclaration)) {
        const values = enumDeclaration.getMembers().map((m) => m.getName());
        
        context.types.set(typeName, {
          type: 'enum',
          values,
        });
        return typeName;
      }
    }
  }

  if (type.isUnion()) {
    const unionTypes = type.getUnionTypes();
    
    
    const stringLiterals: string[] = [];
    let hasOnlyStringLiterals = true;
    let hasUndefined = false;
    
    for (const unionType of unionTypes) {
      if (unionType.isUndefined() || unionType.isNull()) {
        hasUndefined = true;
        continue;
      }
      if (unionType.isStringLiteral()) {
        const literalValue = unionType.getLiteralValue();
        if (typeof literalValue === 'string') {
          stringLiterals.push(literalValue);
        } else {
          hasOnlyStringLiterals = false;
        }
      } else {
        hasOnlyStringLiterals = false;
      }
    }
    
    if (hasOnlyStringLiterals && stringLiterals.length > 0 && !hasUndefined) {
      const symbol = type.getSymbol();
      if (symbol) {
        const declarations = symbol.getDeclarations();
        if (declarations && declarations.length > 0) {
          const decl = declarations[0];
          if (Node.isTypeAliasDeclaration(decl)) {
            const aliasName = symbol.getName();
            
            context.types.set(aliasName, {
              type: 'enum',
              values: stringLiterals,
            });
            context.typeNames.set(type, aliasName);
            return aliasName;
          }
        }
      }
    }
    
    const refs: string[] = [];
    for (const unionType of unionTypes) {
      if (!unionType.isUndefined() && !unionType.isNull()) {
        const unionTypeName = extractType(unionType, context);
        if (!refs.includes(unionTypeName)) {
          refs.push(unionTypeName);
        }
      }
    }
    
    
    
    if (refs.length > 1) {
      context.types.set(typeName, {
        type: 'union',
        refs,
      });
      return typeName;
    } else if (refs.length === 1) {
      
      return refs[0];
    }
  }

  const properties: Record<string, { type: string; required: boolean }> = {};
  const refs: string[] = [];
  
  const propertiesSymbol = type.getProperties();
  
  
  
  
  for (const prop of propertiesSymbol) {
    const propName = prop.getName();
    
    if (propName.startsWith('__') || propName === 'toString' || propName === 'valueOf') {
      continue;
    }

    const propDecl = prop.getValueDeclaration() || prop.getDeclarations()[0];
    if (!propDecl) continue;
    const propType = context.checker.getTypeAtLocation(propDecl);
    
    
    
    
    const isOptional = isPropertyOptional(prop, propType);
    const isRequired = !isOptional;
    
    if (isOptional) {
      
    }
    
    const typeToExtract = extractNonOptionalType(propType);
    if (typeToExtract !== propType) {
      
    }

    const propTypeName = extractType(typeToExtract, context);
    properties[propName] = { type: propTypeName, required: isRequired };
    
    if (!refs.includes(propTypeName)) {
      refs.push(propTypeName);
    }
  }

  context.types.set(typeName, {
    type: 'object',
    properties,
    refs,
  });

  return typeName;
}

