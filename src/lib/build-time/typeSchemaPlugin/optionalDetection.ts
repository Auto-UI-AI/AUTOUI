import type { Type, Symbol } from 'ts-morph';
import { Node } from 'ts-morph';


export function isPropertyOptional(
  prop: Symbol,
  propType: Type,
): boolean {
  const declarations = prop.getDeclarations();
  
  for (const decl of declarations) {
    if (Node.isPropertySignature(decl)) {
      if (decl.hasQuestionToken()) {
        return true;
      }
    }
    
    if (Node.isParameterDeclaration(decl)) {
      if (decl.hasQuestionToken()) {
        return true;
      }
      if (decl.hasInitializer()) {
        return true;
      }
    }
    
    if (Node.isBindingElement(decl)) {
      if (decl.hasInitializer()) {
        return true;
      }
    }
  }
  
  if (propType.isUnion()) {
    const unionTypes = propType.getUnionTypes();
    const hasUndefined = unionTypes.some((t: Type) => {
      if (t.isUndefined()) return true;
      const typeText = t.getText();
      if (typeText === 'undefined' || typeText === 'void') return true;
      try {
        const flags = t.getFlags();
        if ((flags & 0x100) !== 0) return true;
      } catch {
      }
      return false;
    });
    
    const hasNull = unionTypes.some((t: Type) => {
      if (t.isNull()) return true;
      const typeText = t.getText();
      if (typeText === 'null') return true;
      return false;
    });
    
    if (hasUndefined || hasNull) {
      return true;
    }
  }
  
  if (propType.isUndefined()) {
    return true;
  }
  
  const typeText = propType.getText();
  if (typeText === 'undefined' || typeText === 'void') {
    return true;
  }
  
  return false;
}

export function extractNonOptionalType(propType: Type): Type {
  if (propType.isUnion()) {
    const unionTypes = propType.getUnionTypes();
    const nonOptionalType = unionTypes.find((t: Type) => {
      if (t.isUndefined() || t.isNull()) return false;
      
      const typeText = t.getText();
      if (typeText === 'undefined' || typeText === 'null' || typeText === 'void') {
        return false;
      }
      
      try {
        const flags = t.getFlags();
        if ((flags & 0x100) !== 0) return false;
      } catch {
      }
      
      return true;
    });
    
    if (nonOptionalType) {
      return nonOptionalType;
    }
  }
  
  return propType;
}

