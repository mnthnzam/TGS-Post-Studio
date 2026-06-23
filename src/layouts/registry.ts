import { layout1 } from './layout1';
import { layout2 } from './layout2';
import { layout3 } from './layout3';
import { layout4 } from './layout4';
import { layout5 } from './layout5';
import type { LayoutId, LayoutModule } from '../model';

export const LAYOUTS: LayoutModule[] = [layout1, layout2, layout3, layout4, layout5];

export const registry: Record<LayoutId, LayoutModule | undefined> = {
  L1: layout1,
  L2: layout2,
  L3: layout3,
  L4: layout4,
  L5: layout5,
};

export function getModule(id: LayoutId): LayoutModule {
  const m = registry[id];
  if (!m) throw new Error(`Layout ${id} not implemented yet`);
  return m;
}
