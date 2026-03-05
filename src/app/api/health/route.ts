import { ok, handle } from '@/lib/api';

export const GET = () => handle(async () => ok({ status: 'ok' }));
