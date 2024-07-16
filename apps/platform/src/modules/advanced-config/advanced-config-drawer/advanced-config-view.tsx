import { CloseOutlined } from '@ant-design/icons';
import { Button, Drawer, Form, InputNumber, Select, Space, Spin } from 'antd';
import { parse } from 'query-string';
import { useCallback, useEffect } from 'react';
import { useLocation } from 'umi';

import { Platform } from '@/components/platform-wrapper';
import { DefaultModalManager } from '@/modules/dag-modal-manager';
import dagLayoutStyle from '@/modules/layout/dag-layout/index.less';
import { LoginService } from '@/modules/login/login.service';
import { getModel, useModel } from '@/util/valtio-helper';

import { advancedConfigService } from './advanced-config-service';
import styles from './index.less';
import { ProjectEditService } from '@/modules/layout/header-project-list/project-edit.service';

export const AdvancedConfig = () => {
  const modalManager = useModel(DefaultModalManager);
  const projectEditService = useModel(ProjectEditService);
  const service = useModel(advancedConfigService);
  const loginService = useModel(LoginService);

  const { nodeDataSourceOptionsMap, config } = service;

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

  const getAllNodeDataSources = useCallback(async () => {
    await service.queryAllNodeDataSources(projectId as string);
  }, [projectId]);

  useEffect(() => {
    if (visible) {
      getAllNodeDataSources();
      getConfig();
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        maxParallelism: config?.maxParallelism,
        dataSourceConfig: config?.dataSourceConfig,
      });
    }
  }, [config.maxParallelism, visible, config?.dataSourceConfig]);

  const getDataSourceOptions = (key: number) => {
    const currentNodeConfig = config.dataSourceConfig[key];
    return nodeDataSourceOptionsMap[currentNodeConfig?.nodeId];
  };

  const handleDisabled = (key: number) => {
    /**
     * editAllowed 为 true 才可以编辑, 并且要满足下面的条件
     * 1. center 模式下
     *    -  center 账号可以全部编辑
     *    -  -  edge 账号只能编辑自己节点以及内置节点
     * 2. p2p 模式下只能编辑当前节点
     */
    const editAllowed = service.config?.dataSourceConfig[key]?.editEnable;
    const currentNodeId = service.config?.dataSourceConfig[key]?.nodeId;
    const ownerId = loginService?.userInfo?.ownerId;

    if (loginService?.userInfo?.platformType === Platform.CENTER) {
      if (loginService?.userInfo?.ownerType === 'EDGE') {
        // editAllowed 服务端已经做了关于当前登陆用户是不是当前节点的判断了，所有直接返回 editAllowed
        return editAllowed;
      } else if (loginService?.userInfo?.ownerType === 'CENTER') {
        return editAllowed;
      }
    } else if (loginService?.userInfo?.platformType === Platform.AUTONOMY) {
      // p2p 模式下只能编辑当前节点
      return editAllowed && ownerId === currentNodeId;
    }
    return false;
  };

  const handleOk = () => {
    form.validateFields().then(async (value) => {
      const params = {
        maxParallelism: value.maxParallelism,
        graphId: dagId as string,
        projectId: projectId as string,
        dataSourceConfig: value.dataSourceConfig
          .filter((item: { editEnable: boolean }) => item.editEnable === true)
          .map((item: { nodeId: string; dataSourceId: string }) => ({
            nodeId: item.nodeId,
            dataSourceId: item.dataSourceId,
          })),
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
        <Form
          form={form}
          initialValues={{
            maxParallelism: 1,
          }}
        >
          <Form.Item
            name={'maxParallelism'}
            label={<div className={styles.task}>任务并发数</div>}
            tooltip="单个任务流的并发组件数"
            labelCol={{ span: 8 }}
            wrapperCol={{ offset: 4, span: 12 }}
          >
            <InputNumber
              step={1}
              min={1}
              max={100}
              style={{ width: '100%' }}
              precision={0}
            />
          </Form.Item>
          <Form.List name="dataSourceConfig">
            {(fields) => {
              return (
                <>
                  {fields.map((field) => (
                    <div key={field.key} className={styles.nodeStoragePath}>
                      <Form.Item
                        {...field}
                        label={
                          <span className={styles.label}>{`节点${
                            config?.dataSourceConfig[field.key]?.nodeName
                          }默认存储数据源`}</span>
                        }
                        name={[field.name, 'dataSourceId']}
                        rules={[{ required: true, message: '请选择' }]}
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                        extra="保存后将不可修改"
                      >
                        <Select
                          placeholder="请选择"
                          disabled={!handleDisabled(field.key)}
                          options={getDataSourceOptions(field.key)}
                        />
                      </Form.Item>
                    </div>
                  ))}
                </>
              );
            }}
          </Form.List>
          <div className={styles.footer}>
            <Space>
              <Button
                type="primary"
                size="small"
                onClick={handleOk}
                disabled={projectEditService.canEdit.advancedConfigDisabled}
              >
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
