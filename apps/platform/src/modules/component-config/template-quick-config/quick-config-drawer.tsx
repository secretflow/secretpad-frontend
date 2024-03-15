import { CloseOutlined } from '@ant-design/icons';
import { Alert, Button, Drawer, Form, Space } from 'antd';
import { parse } from 'query-string';
import { useEffect } from 'react';
import { useLocation } from 'umi';

import { DefaultModalManager } from '@/modules/dag-modal-manager';
import dagLayoutStyle from '@/modules/layout/dag-layout/index.less';
import { PipelineTemplateType } from '@/modules/pipeline/pipeline-protocol';
import { getModel, useModel } from '@/util/valtio-helper';

import { DefaultComponentConfigService } from '../component-config-service';

import styles from './index.less';
import { QuickConfigPSI } from './quick-config-psi';
import { QuickConfigRisk } from './quick-config-risk';
import { QuickConfigTee } from './quick-config-risk-tee';

const CONFIG_WIDTH = 300;

export const QuickConfigModal = () => {
  const modalManager = useModel(DefaultModalManager);
  const configService = useModel(DefaultComponentConfigService);
  const [form] = Form.useForm();
  const modal = modalManager.modals[quickConfigDrawer.id];
  const { visible, data } = modal;
  const { type } = data;
  const onClose = () => {
    visible && form.resetFields();
    modalManager.closeModal(quickConfigDrawer.id);
  };

  const { search } = useLocation();
  const { dagId } = parse(search);

  useEffect(onClose, [dagId]);
  return (
    <>
      <Drawer
        title={'快速配置'}
        placement="right"
        width={CONFIG_WIDTH}
        closable={false}
        mask={false}
        onClose={onClose}
        open={visible}
        rootClassName={styles.quickConfigDrawer}
        getContainer={() => {
          return document.querySelector(`.${dagLayoutStyle.center}`) as Element;
        }}
        extra={
          <CloseOutlined
            style={{ fontSize: 12 }}
            onClick={() => {
              onClose();
            }}
          />
        }
      >
        <Alert
          message="若无数据集，请先到节点授权数据到项目，再按组件进行配置，配置内容需要保存才能生效"
          type="warning"
        />
        <Form
          layout="vertical"
          form={form}
          onFinish={(val) => {
            configService.saveQuickConfig({
              type,
              options: val,
            });
            onClose();
          }}
        >
          {type === PipelineTemplateType.RISK && <QuickConfigRisk />}
          {type === PipelineTemplateType.PSI && <QuickConfigPSI type="MPC" />}
          {type === PipelineTemplateType.PSI_TEE && <QuickConfigPSI />}
          {type === PipelineTemplateType.TEE && <QuickConfigTee />}

          <div className={styles.footer}>
            <Space>
              <Button type="primary" size="small" htmlType="submit">
                保存
              </Button>
              <Button size="small" onClick={onClose}>
                取消
              </Button>
            </Space>
          </div>
        </Form>
      </Drawer>
    </>
  );
};

export const quickConfigDrawer = {
  id: 'quick-config',
  visible: false,
  data: {},
};

getModel(DefaultModalManager).registerModal(quickConfigDrawer);
