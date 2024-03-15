import { Emitter } from '@secretflow/utils';

import { Model } from '@/util/valtio-helper';

import type { ModalItem, ModalManager } from './modal-manger-protocol';

export class DefaultModalManager extends Model implements ModalManager<any> {
  // 保存所有 modal 的信息：包括 id、visible、data、close
  modals: Record<string, ModalItem<any>> = {};

  modalsChanged = new Emitter();

  onModalsChanged = this.modalsChanged.on;

  registerModal<T>(modalItem: ModalItem<T>) {
    this.modals[modalItem.id] = {
      close: () => {
        this.modals[modalItem.id].visible = false;
      },
      ...modalItem,
    };
  }

  openModal = (modalId: string, data?: any) => {
    this.modals[modalId] = {
      ...this.modals[modalId],
      visible: true,
      data,
    };

    // 把所有的 modal 信息都发送出去
    this.modalsChanged.fire(this.modals);
  };

  closeModal = (modalId: string) => {
    this.modals[modalId] = {
      ...this.modals[modalId],
      visible: false,
    };

    // 把所有的 modal 信息都发送出去
    this.modalsChanged.fire(this.modals);
  };

  closeAllModals: () => void = () => {
    for (const modalId in this.modals) {
      this.closeModal(modalId);
    }
  };

  closeAllModalsBut: (modalId: string) => void = (modalId) => {
    for (const id in this.modals) {
      if (id !== modalId) {
        this.closeModal(id);
      }
    }
  };
}

export enum ModalsEnum {
  ComponentConfigDrawer = 'component-config',
  RecordListDrawer = 'RecordListDrawer',
  ResultDrawer = 'component-result',
  ModelSubmissionDrawer = 'ModelSubmissionDrawer',
}

export const ModalsWidth = {
  [ModalsEnum.ComponentConfigDrawer]: 300,
  [ModalsEnum.RecordListDrawer]: 320,
  [ModalsEnum.ResultDrawer]: 600,
  [ModalsEnum.ModelSubmissionDrawer]: 560,
};
