import type { Type } from 'ts-morph';
import type { ExtractionContext } from './types';
import { extractType } from './typeExtraction';
import { isPropertyOptional, extractNonOptionalType } from './optionalDetection';

export function extractFunctionSignature(
  functionType: Type,
  context: ExtractionContext,
): { params: Record<string, { type: string; required: boolean }>; returns: { type: string } } {
  const params: Record<string, { type: string; required: boolean }> = {};
  
  const callSignatures = functionType.getCallSignatures();
  if (callSignatures.length > 0) {
    const signature = callSignatures[0];
    const parameters = signature.getParameters();
    
    console.log(`[AutoUI Type Schema] Extracting function parameters (count: ${parameters.length})`);
    
    for (const param of parameters) {
      const paramName = param.getName();
      if (paramName && !paramName.startsWith('__')) {
        const paramDecl = param.getValueDeclaration();
        if (!paramDecl) continue;
        const paramType = context.checker.getTypeAtLocation(paramDecl);
        
        console.log(`  [Function Param] ${paramName}:`);
        console.log(`    Raw type: ${paramType.getText()}`);
        
        const isOptional = isPropertyOptional(param, paramType);
        const isRequired = !isOptional;
        
        if (isOptional) {
          console.log(`    Detected as optional (question token, union with undefined/null, or default value)`);
        }
        
        const typeToExtract = extractNonOptionalType(paramType);
        if (typeToExtract !== paramType) {
          console.log(`    Extracting non-optional type: ${typeToExtract.getText()}`);
        }

        const paramTypeName = extractType(typeToExtract, context);
        params[paramName] = { type: paramTypeName, required: isRequired };
        console.log(`    → Evaluated type: "${paramTypeName}" (required: ${isRequired})`);
      } else {
        const paramDecl = param.getValueDeclaration();
        if (!paramDecl) continue;
        const paramType = context.checker.getTypeAtLocation(paramDecl);
        console.log(`  [Function Param] (destructured):`);
        console.log(`    Raw type: ${paramType.getText()}`);
        
        if (paramType.isObject()) {
          const propertiesSymbol = paramType.getProperties();
          console.log(`    Extracting destructured object properties (count: ${propertiesSymbol.length})`);
          
          for (const prop of propertiesSymbol) {
            const propName = prop.getName();
            if (propName.startsWith('__')) continue;
            
            console.log(`      [Destructured Prop] ${propName}:`);
            
            const propDecl = prop.getValueDeclaration() || prop.getDeclarations()[0];
            if (!propDecl) continue;
            const propType = context.checker.getTypeAtLocation(propDecl);
            console.log(`        Raw type: ${propType.getText()}`);
            
            const isOptional = isPropertyOptional(prop, propType);
            const isRequired = !isOptional;
            
            if (isOptional) {
              console.log(`        Detected as optional (question token, union with undefined/null, or default value)`);
            }
            
            const typeToExtract = extractNonOptionalType(propType);
            if (typeToExtract !== propType) {
              console.log(`        Extracting non-optional type: ${typeToExtract.getText()}`);
            }
            
            const propTypeName = extractType(typeToExtract, context);
            params[propName] = { type: propTypeName, required: isRequired };
            console.log(`        → Evaluated type: "${propTypeName}" (required: ${isRequired})`);
          }
        } else {
          const paramTypeName = extractType(paramType, context);
          params['param'] = { type: paramTypeName, required: true };
          console.log(`    → Evaluated type: "${paramTypeName}" (required: true)`);
        }
      }
    }

    const returnType = signature.getReturnType();
    const returnTypeName = extractType(returnType, context);
    console.log(`  [Function Return] → Evaluated type: "${returnTypeName}"`);
    
    return { params, returns: { type: returnTypeName } };
  }

  return { params, returns: { type: 'void' } };
}

