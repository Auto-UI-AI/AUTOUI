import type { Type } from 'ts-morph';
import type { ExtractionContext } from './types';
import { extractType } from './typeExtraction';
import { isPropertyOptional, extractNonOptionalType } from './optionalDetection';

export function extractComponentProps(componentType: Type, context: ExtractionContext): Record<string, { type: string; required: boolean }> {
  const props: Record<string, { type: string; required: boolean }> = {};
  
  let propsType: Type | null = null;
  
  const typeArguments = componentType.getTypeArguments();
  if (typeArguments.length > 0) {
    propsType = typeArguments[0];
    
  } else {
    const callSignatures = componentType.getCallSignatures();
    if (callSignatures.length > 0) {
      const signature = callSignatures[0];
      const parameters = signature.getParameters();
      
      if (parameters.length > 0) {
        const propsParam = parameters[0];
        const propsParamDecl = propsParam.getValueDeclaration();
        if (propsParamDecl) {
          propsType = context.checker.getTypeAtLocation(propsParamDecl);
          
        }
      }
    }
  }
  
  if (!propsType) {
    
    return props;
  }
  
  const propertiesSymbol = propsType.getProperties();
  
  
  
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
    
    
    const typeToExtract = extractNonOptionalType(propType);
    

    const propTypeName = extractType(typeToExtract, context);
    props[propName] = { type: propTypeName, required: isRequired };
    
  }
  
  return props;
}

