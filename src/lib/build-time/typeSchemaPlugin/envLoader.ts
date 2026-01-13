import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadEnvFile(filePath: string): Record<string, string> {
  const env: Record<string, string> = {};
  
  if (!existsSync(filePath)) {
    return env;
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const match = trimmed.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        env[key] = value;
      }
    }
  } catch (error) {
    // THINK ABOUT THIS: HOW IMPORTANT IS THIS ERROR? SHOULD WE THROW AN ERROR HERE?
  }

  return env;
}

export function loadEnvVars(mode: string = 'development'): Record<string, string> {
  const root = process.cwd();
  const env: Record<string, string> = {};

  const envBase = loadEnvFile(resolve(root, '.env'));
  Object.assign(env, envBase);

  const envMode = loadEnvFile(resolve(root, `.env.${mode}`));
  Object.assign(env, envMode);

  const envLocal = loadEnvFile(resolve(root, '.env.local'));
  Object.assign(env, envLocal);

  const nodeEnv = process.env.NODE_ENV || mode;
  if (nodeEnv !== mode) {
    const envNodeEnv = loadEnvFile(resolve(root, `.env.${nodeEnv}`));
    Object.assign(env, envNodeEnv);
  }

  return env;
}

