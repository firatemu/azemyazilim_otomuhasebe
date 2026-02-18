import { SetMetadata } from '@nestjs/common';

export const MODULE_KEY = 'module';
export const RequireModule = (moduleSlug: string) => SetMetadata(MODULE_KEY, moduleSlug);


