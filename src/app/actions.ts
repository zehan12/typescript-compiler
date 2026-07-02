'use server';

import { generateSteps, TransformationStep } from '@/lib/transformer';

export async function transformCode(code: string): Promise<TransformationStep[]> {
    return generateSteps(code);
}
