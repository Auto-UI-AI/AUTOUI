import type { Project, Type } from 'ts-morph';
import { Node } from 'ts-morph';

export function findRegistrations(project: Project): {
  components: Array<{ name: string; type: Type }>;
  functions: Array<{ name: string; type: Type }>;
} {
  const components: Array<{ name: string; type: Type }> = [];
  const functions: Array<{ name: string; type: Type }> = [];

  const sourceFiles = project.getSourceFiles();
  const checker = project.getTypeChecker();

  for (const sourceFile of sourceFiles) {
    if (sourceFile.isDeclarationFile() || sourceFile.getFilePath().includes('node_modules')) {
      continue;
    }

    sourceFile.forEachDescendant((node) => {
      if (Node.isCallExpression(node)) {
        const expression = node.getExpression();
        
        if (Node.isIdentifier(expression)) {
          const funcName = expression.getText();
          
          if (funcName === 'autouiRegisterComponentPropsSchema') {
            const args = node.getArguments();
            if (args.length > 0) {
              const arg = args[0];
              const type = checker.getTypeAtLocation(arg);
              const symbol = checker.getSymbolAtLocation(arg);
              
              let componentName = 'Unknown';
              if (symbol) {
                componentName = symbol.getName();
              } else {
                const typeSymbol = type.getSymbol();
                if (typeSymbol) {
                  componentName = typeSymbol.getName();
                }
              }
              
              console.log(`[AutoUI Type Schema] Found component registration: "${componentName}"`);
              components.push({ name: componentName, type });
            }
          }
          
          if (funcName === 'autouiRegisterFunctionParamsSchema') {
            const args = node.getArguments();
            if (args.length > 0) {
              const arg = args[0];
              const type = checker.getTypeAtLocation(arg);
              const symbol = checker.getSymbolAtLocation(arg);
              
              let functionName = 'Unknown';
              if (symbol) {
                functionName = symbol.getName();
              } else {
                const typeSymbol = type.getSymbol();
                if (typeSymbol) {
                  functionName = typeSymbol.getName();
                }
              }
              
              console.log(`[AutoUI Type Schema] Found function registration: "${functionName}"`);
              functions.push({ name: functionName, type });
            }
          }
        }
      }
    });
  }

  return { components, functions };
}

