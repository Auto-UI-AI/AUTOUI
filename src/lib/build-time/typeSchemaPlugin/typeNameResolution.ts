import { createHash } from 'node:crypto';
import type { Type } from 'ts-morph';
import { Node } from 'ts-morph';
import type { ExtractionContext } from './types';

export function getTypeName(type: Type, context: ExtractionContext): string {
 
  if (context.typeNames.has(type)) {
    return context.typeNames.get(type)!;
  }

  const symbol = type.getSymbol();
  if (symbol) {
    const symbolName = symbol.getName();
    if (symbolName && symbolName !== '__type' && symbolName !== '__function') {
      const declarations = symbol.getDeclarations();
      if (declarations && declarations.length > 0) {
        const decl = declarations[0];
        const sourceFile = decl.getSourceFile();
        if (!sourceFile.isDeclarationFile() && !sourceFile.getFilePath().includes('node_modules')) {
          if (Node.isTypeAliasDeclaration(decl)) {
            context.typeNames.set(type, symbolName);
            return symbolName;
          }
          if (Node.isInterfaceDeclaration(decl)) {
            context.typeNames.set(type, symbolName);
            return symbolName;
          }
          if (Node.isEnumDeclaration(decl)) {
            context.typeNames.set(type, symbolName);
            return symbolName;
          }
        }
      }
    }
  }

  if (type.isArray()) {
    const elementType = type.getArrayElementType();
    if (elementType) {
      const elementName = getTypeName(elementType, context);
      return `${elementName}[]`;
    }
  }

  const typeText = type.getText();
  if (typeText === 'string' || typeText === 'number' || typeText === 'boolean') {
    return typeText;
  }

  return generateAnonymousTypeName(type, context);
}

export function generateAnonymousTypeName(type: Type, context: ExtractionContext): string {
  const typeText = type.getText();
  
  const hash = createHash('md5').update(typeText).digest('hex').substring(0, 8);
  
  let prefix = 'Anonymous';
  
  if (typeText.includes('{')) {
    prefix = 'Object';
  } else if (typeText.includes('[')) {
    prefix = 'Array';
  } else if (typeText.includes('|')) {
    prefix = 'Union';
  }
  
  const counter = context.anonymousTypeCounter.get(prefix) || 0;
  context.anonymousTypeCounter.set(prefix, counter + 1);
  
  const name = `${prefix}_${hash}`;
  context.typeNames.set(type, name);
  return name;
}

