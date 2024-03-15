import {
  Drawer,
  Button,
  Space,
  Form,
  Input,
  Select,
  Empty,
  Spin,
  message,
  Tooltip,
  Alert,
} from 'antd';
import classnames from 'classnames';
import { useEffect, useCallback, useMemo } from 'react';
import { history } from 'umi';
import { DefaultModalManager } from '@/modules/dag-modal-manager';
import submissionLayoutStyle from '@/modules/layout/model-submission-layout/index.less';
import { getModel, useModel } from '@/util/valtio-helper';

import styles from './index.less';
import { PreviewSubmitNode } from './preview-submit-node';
import { SubmissionDrawerService } from './submission-service';
import { parse } from 'query-string';
import { useFormValidateOnly } from './useFormValidateOnly';
import { SubmitGraphService } from '@/modules/dag-submit/graph-service';
import { DagLayoutMenu, DagLayoutView } from '@/modules/layout/dag-layout';
import { QuestionCircleOutlined } from '@ant-design/icons';

const WIDTH = 560;

export const SubmissionDrawer = () => {
  const modalManager = useModel(DefaultModalManager);

  const submissionDrawerService = useModel(SubmissionDrawerService);
  const submitGraphService = useModel(SubmitGraphService);
  const dagLayoutView = useModel(DagLayoutView);

  const {
    modelInfo,
    addressNodeList,
    getModelNodesAddress,
    submitModel,
    checkSubmitModelStatus,
    isSubmitting,
    showAlert,
    currentSubmitParams,
  } = submissionDrawerService;

  const [form] = Form.useForm();

  const { visible } = modalManager.modals[ModelSubmissionDrawerItem.id];

  const addressFormData = Form.useWatch('address', form);

  const { submittable } = useFormValidateOnly(form);

  const [messageApi, contextHolder] = message.useMessage();

  const { projectId, dagId } = parse(window.location.search);

  const modelId = (modelInfo.modelNode[0]?.outputs || []).find(
    (item: { type: string }) => item.type === 'model',
  )?.id;

  // 同时有模型训练和模型预测算子，只展示模型预测算子
  const previewNodes =
    modelInfo.predictNode.length !== 0
      ? [...modelInfo.preNodes, ...modelInfo.predictNode, ...modelInfo.postNodes]
      : [
          ...modelInfo.preNodes,
          ...modelInfo.modelNode,
          ...modelInfo.predictNode,
          ...modelInfo.postNodes,
        ];

  const onCloseDrawer = () => {
    modalManager.closeModal(ModelSubmissionDrawerItem.id);
    submitGraphService.resetSelectNodeIdsObj();
    submitGraphService.clearGraphSelection();
  };

  const onClose = () => {
    onCloseDrawer();
    submissionDrawerService.isSubmitting = false;
  };

  const closeDrawer = () => {
    onCloseDrawer();
    if (isSubmitting) {
      message.warning(`「${currentSubmitParams.name}」模型提交中，请耐心等待`);
    }
  };

  const addressOptions = addressNodeList.map((item) => ({
    value: item.nodeId,
    label: item.nodeName,
  }));

  const getDataSourcePath = (key: number) => {
    if (!addressFormData) return;
    const formItem = addressFormData[key];
    return addressNodeList.find((item) => item.nodeId === formItem.nodeName)
      ?.dataSourcePath;
  };

  const nodeOptionsFilter = addressOptions.map((item) => {
    if (
      (addressFormData || []).some(
        (v: { nodeName: string }) => v.nodeName === item.value,
      )
    ) {
      return {
        ...item,
        disabled: true,
      };
    } else {
      return {
        ...item,
        disabled: false,
      };
    }
  });

  const getAddress = useCallback(
    async (modelId: string) => {
      await getModelNodesAddress(modelId);
    },
    [modelId],
  );

  useEffect(() => {
    const initFormList = addressNodeList.map(() => ({}));
    if (initFormList.length === 0) {
      form.setFieldValue('address', [{}, {}]);
    } else {
      form.setFieldValue('address', initFormList);
    }
  }, [addressNodeList]);

  useEffect(() => {
    if (!visible) return;
    if (isSubmitting) {
      form.setFieldsValue(currentSubmitParams);
    } else {
      form.resetFields();
      if (modelId) {
        getAddress(modelId);
      } else {
        submissionDrawerService.clearAddressNodeList();
      }
    }
  }, [visible, modelId, isSubmitting]);

  const timestamp = useMemo(() => {
    return Date.now();
  }, [modelId, visible]);

  const goToModelManager = () => {
    history.push({
      pathname: '/dag',
      search: window.location.search,
    });
    dagLayoutView.setInitActiveMenu(DagLayoutMenu.MODELMANAGER);
    dagLayoutView.setModelManagerShow();
  };

  const handlePathChange = (value: string) => {
    // 当前只有一个文件地址路径，所以节点文件必须相同
    const newFormAddress = addressFormData.map((item: { nodeName: string }) => ({
      nodeName: item.nodeName,
      path: value,
    }));
    form.setFieldsValue({
      address: newFormAddress,
    });
  };

  const handleSubmit = async () => {
    const value = await form.validateFields();
    submissionDrawerService.currentSubmitParams = {
      ...value,
      timestamp,
    };
    // 如果即有模型训练算子，也有模型预测算子，则modelComponent只提交模型预测算子.trainId提交模型训练算子id
    const submitNodes =
      modelInfo.predictNode.length > 0
        ? [...modelInfo.preNodes, ...modelInfo.predictNode, ...modelInfo.postNodes]
        : [...modelInfo.preNodes, ...modelInfo.modelNode, ...modelInfo.postNodes];
    const params = {
      projectId: projectId as string,
      graphId: dagId as string,
      graphNodeOutPutId: modelId,
      modelName: value.name,
      modelDesc: value.desc,
      modelPartyConfig: value.address.map(
        (item: { nodeName: string; path: string }) => ({
          modelParty: item.nodeName,
          modelDataName: `${item.path}_${timestamp}`,
          modelDataSource: addressNodeList.find((node) => node.nodeId === item.nodeName)
            ?.dataSourcePath,
        }),
      ),
      modelComponent: submitNodes.map((item) => ({
        graphNodeId: item.id,
        domain: item.nodeDef.domain,
        name: item.nodeDef.name,
        version: item.nodeDef.version,
      })),
      trainId: modelInfo.modelNode[0]?.id,
    };
    submissionDrawerService.isSubmitting = true;
    const { status, data } = await submitModel(params);
    if (status?.code === 0 && data?.jobId) {
      await pollingStatus(data.jobId, value.name);
    } else {
      submissionDrawerService.isSubmitting = false;
      messageApi.error(`「${value.name}」模型提交失败, ${status?.msg}`);
    }
  };

  const pollingStatus = async (jobId: string, modelName: string) => {
    const { status, data } = await checkSubmitModelStatus(jobId);
    if (status?.code === 0 && data?.status !== 'SUCCEED' && data?.status !== 'FAILED') {
      submissionDrawerService.isSubmitting = true;
      submissionDrawerService.submitTimer = setTimeout(async () => {
        await pollingStatus(jobId, modelName);
      }, 3000);
    } else {
      if (submissionDrawerService.submitTimer) {
        clearTimeout(submissionDrawerService.submitTimer);
        submissionDrawerService.submitTimer = undefined;
      }
      if (status?.code === 0 && data?.status === 'SUCCEED') {
        submissionDrawerService.isSubmitting = false;
        onClose();
        messageApi.open({
          type: 'success',
          content: (
            <>
              {`「${modelName}」模型提交成功，请到`}
              <a onClick={goToModelManager}> 模型管理 </a>
              查看
            </>
          ),
          duration: 3,
        });
      } else {
        messageApi.error(
          `「${modelName}」模型提交失败, ${data?.errMsg ? data?.errMsg : status?.msg}`,
        );
        submissionDrawerService.isSubmitting = false;
      }
    }
  };

  return (
    <>
      {contextHolder}
      <Drawer
        rootClassName={styles.submissionDrawer}
        title={<div className={styles.title}>提交模型</div>}
        extra={
          <Tooltip title="退出模型提交则会中断提交进程，如需提交需重新发起">
            <Button
              className={styles.extra}
              type="link"
              onClick={() => {
                onClose();
                if (submissionDrawerService.submitTimer) {
                  clearTimeout(submissionDrawerService.submitTimer);
                  submissionDrawerService.submitTimer = undefined;
                }
                history.push({
                  pathname: '/dag',
                  search: window.location.search,
                });
              }}
            >
              退出模型提交
            </Button>
          </Tooltip>
        }
        open={visible}
        onClose={onClose}
        width={WIDTH}
        closable={false}
        mask={false}
        getContainer={() => {
          return document.querySelector(`.${submissionLayoutStyle.center}`) as Element;
        }}
        footer={
          <Space>
            <Button
              disabled={submissionDrawerService.loading || !submittable || showAlert}
              type="primary"
              loading={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? '提交中' : '确认提交'}
            </Button>
            <Button onClick={closeDrawer}>关闭</Button>
          </Space>
        }
      >
        {showAlert && (
          <Alert
            message="非数据参与方，不能提交模型"
            type="error"
            style={{ marginBottom: 8 }}
          />
        )}
        <Form
          form={form}
          disabled={isSubmitting}
          requiredMark="optional"
          layout="vertical"
        >
          <Form.Item
            label="模型名称"
            name="name"
            required
            rules={[
              { required: true, message: '请输入模型名称' },
              { max: 32, message: '长度限制32' },
              {
                pattern: /^[\u4E00-\u9FA5A-Za-z0-9-_]+$/,
                message: '只能包含中文/英文/数字/下划线/中划线',
              },
            ]}
          >
            <Input placeholder="名称可由中文/英文/数字/下划线/中划线组成，长度限制32" />
          </Form.Item>

          <Form.Item
            label="模型描述"
            name="desc"
            rules={[{ max: 200, message: '长度限制200' }]}
          >
            <Input.TextArea placeholder="请输入" showCount maxLength={200} />
          </Form.Item>

          <Form.Item
            label={
              <div className={classnames(styles.formLabel, styles.itemMargin)}>
                存储地址
              </div>
            }
            required
          >
            <Form.List name="address" initialValue={[{}, {}]}>
              {(fields) => {
                return (
                  <Spin spinning={submissionDrawerService.loading}>
                    <div className={styles.itemBlock}>
                      {fields.map(({ key, name, ...restField }) => {
                        return (
                          <div key={key}>
                            <div className={styles.itemRowLabel}>
                              {'存储节点' + (key + 1)}
                            </div>
                            <div className={styles.itemRow}>
                              <Form.Item
                                {...restField}
                                key={'nodeName' + key}
                                name={[name, 'nodeName']}
                                dependencies={[['address', key, 'nodeName']]}
                                rules={[
                                  { required: true, message: '请选择' },
                                  // {
                                  //   validator: (_, value) => {
                                  //     const nodeName = addressFormData.filter(
                                  //       (i: any) => i?.nodeName === value,
                                  //     );
                                  //     if (nodeName.length > 1)
                                  //       return Promise.reject('节点重复');
                                  //     return Promise.resolve();
                                  //   },
                                  // },
                                ]}
                              >
                                <Select
                                  placeholder="请选择"
                                  options={nodeOptionsFilter}
                                  style={{ width: 140 }}
                                  allowClear
                                />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                key={'path' + key}
                                name={[name, 'path']}
                                rules={[
                                  { required: true, message: '请输入' },
                                  {
                                    pattern: /^[\u4E00-\u9FA5A-Za-z0-9-_]+$/,
                                    message: '只能包含中文/英文/数字/下划线/中划线',
                                  },
                                ]}
                              >
                                <Input
                                  addonBefore={getDataSourcePath(key) || '暂无'}
                                  placeholder="请选择节点后输入"
                                  style={{ width: '100%' }}
                                  onChange={(e) => handlePathChange(e.target.value)}
                                  addonAfter={
                                    isSubmitting
                                      ? currentSubmitParams.timestamp
                                      : timestamp
                                  }
                                />
                              </Form.Item>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Spin>
                );
              }}
            </Form.List>
          </Form.Item>

          <Form.Item required label={<div className={styles.formLabel}>提交组件</div>}>
            <div className={styles.canvas}>
              {previewNodes.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={'请点击画布中可提交的组件'}
                />
              ) : (
                <PreviewSubmitNode nodes={previewNodes} />
              )}
            </div>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export const ModelSubmissionDrawerItem = {
  id: 'ModelSubmissionDrawer',
  visible: false,
};

getModel(DefaultModalManager).registerModal(ModelSubmissionDrawerItem);
