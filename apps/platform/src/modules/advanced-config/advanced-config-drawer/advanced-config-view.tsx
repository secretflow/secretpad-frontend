import { getModel, useModel } from '@/util/valtio-helper';
import { DefaultModalManager } from '@/modules/dag-modal-manager';
import { advancedConfigService } from './advanced-config-service';
import { Button, Drawer, Form, InputNumber, Space, Spin } from 'antd';
import { useCallback, useEffect } from 'react';
import dagLayoutStyle from '@/modules/layout/dag-layout/index.less';

import styles from './index.less';
import { CloseOutlined } from '@ant-design/icons';
import { useLocation } from 'umi';
import { parse } from 'query-string';

export const AdvancedConfig = () => {
  const modalManager = useModel(DefaultModalManager);
  const service = useModel(advancedConfigService);

  const { search } = useLocation();
  const { dagId, projectId } = parse(search);

  const [form] = Form.useForm();

  const { visible } = modalManager.modals[AdvancedConfigDrawer.id];

  const onClose = () => {
    modalManager.closeModal(AdvancedConfigDrawer.id);
    form.resetFields();
  };

  const getConfig = useCallback(async () => {
    await service.getSetting(dagId as string, projectId as string);
  }, [dagId]);

  useEffect(() => {
    if (visible) {
      getConfig();
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        maxParallelism: service.config?.maxParallelism,
      });
    }
  }, [service.config.maxParallelism, visible]);

  const handleOk = () => {
    form.validateFields().then(async (value) => {
      const params = {
        maxParallelism: value.maxParallelism,
        graphId: dagId as string,
        projectId: projectId as string,
      };
      await service.setting(params);
      onClose();
    });
  };

  return (
    <Drawer
      title={'全局配置'}
      placement="right"
      width={320}
      destroyOnClose
      closable={false}
      onClose={onClose}
      open={visible}
      rootClassName={styles.configDrawer}
      getContainer={() => {
        return document.querySelector(`.${dagLayoutStyle.center}`) as Element;
      }}
      mask={false}
      extra={
        <CloseOutlined
          style={{ fontSize: 12 }}
          onClick={() => {
            onClose();
          }}
        />
      }
    >
      <Spin spinning={service.loading}>
        <Form form={form}>
          <Form.Item
            name={'maxParallelism'}
            label={<div className={styles.task}>任务并发数</div>}
            tooltip="单个任务流的并发组件数"
            labelCol={{ span: 8 }}
            wrapperCol={{ offset: 4, span: 12 }}
          >
            <InputNumber
              defaultValue={1}
              step={1}
              min={1}
              max={100}
              style={{ width: '100%' }}
              precision={0}
            />
          </Form.Item>
          <div className={styles.footer}>
            <Space>
              <Button type="primary" size="small" onClick={handleOk}>
                保存配置
              </Button>
            </Space>
          </div>
        </Form>
      </Spin>
    </Drawer>
  );
};

export const AdvancedConfigDrawer = {
  id: 'AdvancedConfig',
  visible: false,
  data: {},
};

getModel(DefaultModalManager).registerModal(AdvancedConfigDrawer);
