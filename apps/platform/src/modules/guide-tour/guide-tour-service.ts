import { Model } from '@/util/valtio-helper';

export enum GuideTourKeys {
  ProjectListTour = 'ProjectListTour',
  CreateProjectTour = 'CreateProjectTour',
  DatatableAuthTour = 'DatatableAuthTour',
  DAGGuideTourOne = 'DAGGuideTourOne',
  DAGGuideTourTwo = 'DAGGuideTourTwo',
  RecordGuideTour = 'RecordGuideTour',
}

export class GuideTourService extends Model {
  // 默认已经提示过
  ProjectListTour = true;

  CreateProjectTour = true;

  DatatableAuthTour = true;

  DAGGuideTourOne = true;

  DAGGuideTourTwo = true;

  RecordGuideTour = true;

  constructor() {
    super();
    this.restoreStatusFromLocalstorage();
  }

  restoreStatusFromLocalstorage() {
    if (!window.localStorage) return;
    this.ProjectListTour = !!localStorage.getItem('ProjectListTour');
    this.CreateProjectTour = !!localStorage.getItem('CreateProjectTour');
    this.DatatableAuthTour = !!localStorage.getItem('DatatableAuthTour');
    this.DAGGuideTourOne = !!localStorage.getItem('DAGGuideTourOne');
    this.DAGGuideTourTwo = !!localStorage.getItem('DAGGuideTourTwo');
    this.RecordGuideTour = !!localStorage.getItem('RecordGuideTour');
  }

  reOpenTour(key: GuideTourKeys) {
    localStorage.removeItem(key);
    this[key] = false;
  }

  finishTour(key: GuideTourKeys) {
    localStorage.setItem(key, '1');
    this[key] = true;
  }

  finishAll() {
    this.finishTour(GuideTourKeys.CreateProjectTour);
    this.finishTour(GuideTourKeys.DAGGuideTourOne);
    this.finishTour(GuideTourKeys.DAGGuideTourTwo);
    this.finishTour(GuideTourKeys.DatatableAuthTour);
    this.finishTour(GuideTourKeys.ProjectListTour);
    this.finishTour(GuideTourKeys.RecordGuideTour);
  }

  reset() {
    this.reOpenTour(GuideTourKeys.CreateProjectTour);
    this.reOpenTour(GuideTourKeys.DAGGuideTourOne);
    this.reOpenTour(GuideTourKeys.DAGGuideTourTwo);
    this.reOpenTour(GuideTourKeys.DatatableAuthTour);
    this.reOpenTour(GuideTourKeys.ProjectListTour);
    this.reOpenTour(GuideTourKeys.RecordGuideTour);
  }
}
