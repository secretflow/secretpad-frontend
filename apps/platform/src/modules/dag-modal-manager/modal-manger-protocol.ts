import type { Emitter } from '@secretflow/utils';

import { componentConfigDrawer } from '@/modules/component-config/config-modal';
import { resultDrawer } from '@/modules/dag-result/result-modal';
import { RecordListDrawerItem } from '@/modules/pipeline-record-list/record-list-drawer-view';

export interface ModalItem<T> {
  id: string;
  visible: boolean;
  data?: T;
  close?: () => void;
}

export interface ModalManager<T> {
  modals: Record<string, ModalItem<T>>;

  openModal: (modalId: string, data: any) => void;
  closeModal: (modalId: string) => void;
  closeAllModals: () => void;
  closeAllModalsBut: (modalId: string) => void;

  onModalsChanged: Emitter<any>['on'];
}

export const ModalWidth = {
  [componentConfigDrawer.id]: 300,
  [RecordListDrawerItem.id]: 320,
  [resultDrawer.id]: 600,
};
