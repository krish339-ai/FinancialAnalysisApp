import { z } from 'zod';
import { ranges } from '@/domain/types';
export const rangeSchema = z.enum(ranges);
export function parseRange(input: unknown) { const parsed = rangeSchema.safeParse(input); return parsed.success ? parsed.data : '1M' as const; }
export function textParam(input: unknown) { return typeof input === 'string' ? input.slice(0, 120) : undefined; }
