import { config } from 'hatchable';

// Optional secrets: resolve to null when the owner has not set them.
export async function optional(name) {
  try {
    const value = await config.get(name);
    return typeof value === 'string' && value ? value : null;
  } catch {
    return null;
  }
}
