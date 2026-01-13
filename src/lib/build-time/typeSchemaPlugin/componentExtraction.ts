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
    console.log(`[AutoUI Type Schema] Extracting component props from generic type argument: ${propsType.getText()}`);
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
          console.log(`[AutoUI Type Schema] Extracting component props from call signature parameter: ${propsType.getText()}`);
        }
      }
    }
  }
  
  if (!propsType) {
    console.log(`[AutoUI Type Schema] Could not extract props type from component`);
    return props;
  }
  
  const propertiesSymbol = propsType.getProperties();
  console.log(`[AutoUI Type Schema] Extracting component props from type: ${propsType.getText()}`);
  console.log(`[AutoUI Type Schema] Properties count: ${propertiesSymbol.length}`);
  
  for (const prop of propertiesSymbol) {
    const propName = prop.getName();
    
    if (propName.startsWith('__') || propName === 'toString' || propName === 'valueOf') {
      continue;
    }

    const propDecl = prop.getValueDeclaration() || prop.getDeclarations()[0];
    if (!propDecl) continue;
    const propType = context.checker.getTypeAtLocation(propDecl);
    
    console.log(`  [Component Prop] ${propName}:`);
    console.log(`    Raw type: ${propType.getText()}`);
    
    const isOptional = isPropertyOptional(prop, propType);
    const isRequired = !isOptional;
    
    if (isOptional) {
      console.log(`    Detected as optional (question token, union with undefined/null, or default value)`);
    }
    
    const typeToExtract = extractNonOptionalType(propType);
    if (typeToExtract !== propType) {
      console.log(`    Extracting non-optional type: ${typeToExtract.getText()}`);
    }

    const propTypeName = extractType(typeToExtract, context);
    props[propName] = { type: propTypeName, required: isRequired };
    console.log(`    → Evaluated type: "${propTypeName}" (required: ${isRequired})`);
  }
  
  return props;
}

