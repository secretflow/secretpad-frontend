import type { ReactNode } from 'react';

import { Model } from '@/util/valtio-helper';

export class HomeLayoutService extends Model {
  // logo边上的页面标题
  subTitle: string | ReactNode = '';

  bgClassName = 'homeBg';

  showBackButton = false;

  public setSubTitle(title: string | ReactNode) {
    this.subTitle = title;
  }

  public setBgClassName(name: string) {
    this.bgClassName = name;
  }
}
