import { add, formatDate } from '@03white/my-utils';
import { subtract } from '@03white/my-utils/math';

console.log('add:', add(1, 2));
console.log('subtract:', subtract(5, 2));
console.log('date:', formatDate(new Date('2026-01-02')));
