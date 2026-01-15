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
    
    
    for (const param of parameters) {
      const paramName = param.getName();
      if (paramName && !paramName.startsWith('__')) {
        const paramDecl = param.getValueDeclaration();
        if (!paramDecl) continue;
        const paramType = context.checker.getTypeAtLocation(paramDecl);
        
        
        const isOptional = isPropertyOptional(param, paramType);
        const isRequired = !isOptional;
        
        
        const typeToExtract = extractNonOptionalType(paramType);
        
        const paramTypeName = extractType(typeToExtract, context);
        params[paramName] = { type: paramTypeName, required: isRequired };
      } else {
        const paramDecl = param.getValueDeclaration();
        if (!paramDecl) continue;
        const paramType = context.checker.getTypeAtLocation(paramDecl);
        
        if (paramType.isObject()) {
          const propertiesSymbol = paramType.getProperties();
          
          for (const prop of propertiesSymbol) {
            const propName = prop.getName();
            if (propName.startsWith('__')) continue;
            
            
            const propDecl = prop.getValueDeclaration() || prop.getDeclarations()[0];
            if (!propDecl) continue;
            const propType = context.checker.getTypeAtLocation(propDecl);
            
            const isOptional = isPropertyOptional(prop, propType);
            const isRequired = !isOptional;
            
              
            const typeToExtract = extractNonOptionalType(propType);
            
            const propTypeName = extractType(typeToExtract, context);
            params[propName] = { type: propTypeName, required: isRequired };
          }
        } else {
          const paramTypeName = extractType(paramType, context);
          params['param'] = { type: paramTypeName, required: true };
          
        }
      }
    }

    const returnType = signature.getReturnType();
    const returnTypeName = extractType(returnType, context);
    
    
    return { params, returns: { type: returnTypeName } };
  }

  return { params, returns: { type: 'void' } };
}

