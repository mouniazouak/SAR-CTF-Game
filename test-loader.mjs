import { access } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

async function resolveFile(candidate) {
  try {
    await access(fileURLToPath(candidate));
    return candidate;
  } catch {
    return pathToFileURL(`${fileURLToPath(candidate)}.ts`).href;
  }
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const candidate = new URL(`./src/${specifier.slice(2)}`, import.meta.url);
    return { url: await resolveFile(candidate), shortCircuit: true };
  }

  if (specifier.startsWith('.') && context.parentURL?.endsWith('.ts')) {
    try {
      return await nextResolve(specifier, context);
    } catch {
      const candidate = new URL(specifier, context.parentURL);
      return { url: await resolveFile(candidate), shortCircuit: true };
    }
  }

  return nextResolve(specifier, context);
}

