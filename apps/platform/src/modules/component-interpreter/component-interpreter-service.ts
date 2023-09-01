import { listComponentI18n } from '@/services/secretpad/GraphController';
import { Model } from '@/util/valtio-helper';

import type { ComponentInterpreterService } from './protocol';

export class DefaultComponentInterpreterService
  extends Model
  implements ComponentInterpreterService
{
  translationMap: Record<string, any> = {};

  constructor() {
    super();
    this.getComponentI18n();
  }

  async getComponentI18n() {
    const { data } = await listComponentI18n();
    if (data) this.translationMap = data;
  }

  getComponentTranslationMap(
    component:
      | {
          domain: string;
          name: string;
          version?: string;
        }
      | string,
  ) {
    if (typeof component === 'string') return this.translationMap[component];
    const { domain, name, version } = component;
    const key = `${domain}/${name}:${version}`;
    return this.translationMap[key];
  }
}
