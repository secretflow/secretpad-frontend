import { Model } from '@/util/valtio-helper';

export class HomeLayoutService extends Model {
  // logo边上的页面标题
  subTitle = '';

  bgClassName = 'homeBg';

  showBackButton = false;

  public setSubTitle(title: string) {
    this.subTitle = title;
  }

  public setBgClassName(name: string) {
    this.bgClassName = name;
  }
}
