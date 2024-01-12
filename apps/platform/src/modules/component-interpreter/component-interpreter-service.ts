import { listComponentI18n } from '@/services/secretpad/GraphController';
import { Model } from '@/util/valtio-helper';

import type { ComputeMode } from '../component-tree/component-protocol';

import type { ComponentInterpreterService } from './protocol';

export class DefaultComponentInterpreterService
  extends Model
  implements ComponentInterpreterService
{
  translationMap: Record<ComputeMode, Record<string, any>> = { TEE: {}, MPC: {} };

  constructor() {
    super();
    this.getComponentI18n();
  }

  async getComponentI18n() {
    const token = localStorage.getItem('User-Token') || '';
    if (!token) return;
    const { data } = await listComponentI18n();
    if (data) {
      this.translationMap['MPC'] = data['secretflow'];
      this.translationMap['TEE'] = data['trustedflow'];
    }
  }

  getComponentTranslationMap(
    component:
      | {
          domain: string;
          name: string;
          version?: string;
        }
      | string,
    mode: ComputeMode,
  ) {
    if (typeof component === 'string') return this.translationMap[mode][component];
    const { domain, name, version } = component;
    const key = `${domain}/${name}:${version}`;
    return this.translationMap[mode][key];
  }
}
