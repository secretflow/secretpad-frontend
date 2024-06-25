import { getModel, Model } from '@/util/valtio-helper';

import type { AtomicConfigNode, ConfigItem } from '../component-config-protocol';

import { DefaultConfigRender } from './config-render-contribution';
import type { ConfigRender } from './config-render-protocol';

export class ConfigRenderRegistry extends Model {
  renders: ConfigRender[] = [];

  configRender = getModel(DefaultConfigRender);

  constructor() {
    super();
    this.setupRenders();
  }

  setupRenders() {
    const renders = this.configRender.registerConfigRenders();
    renders.forEach((render) => this.renders.push(render));
  }

  getRender(config: ConfigItem, exif?: any) {
    // if (
    //   (config as StructConfigNode).children &&
    //   (config as StructConfigNode).children.length > 0 &&
    //   (config as StructConfigNode).selectedName
    // ) {
    //   // TODO: render union node
    //   return;
    // } else {
    const { renderKey } = exif;
    const selectedRenders = this.renders
      .map((render) => ({
        ...render,
        priority: render.canHandle(config as AtomicConfigNode, renderKey),
      }))
      .filter((render) => render.priority !== false);

    if (selectedRenders.length === 0) return;

    // TODO: sort priority
    return selectedRenders[0].component;
  }
  // }
}
