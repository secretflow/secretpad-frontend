import { DownOutlined } from '@ant-design/icons';
import {
  Form,
  Drawer,
  Button,
  Space,
  Select,
  Empty,
  Row,
  Spin,
  Tag,
  InputNumber,
  Col,
  Collapse,
} from 'antd';
import classNames from 'classnames';
import { parse } from 'query-string';
import { useEffect } from 'react';
import { useState } from 'react';

import { Platform, hasAccess } from '@/components/platform-wrapper';
import { LoginService } from '@/modules/login/login.service';
import { useModel } from '@/util/valtio-helper';

import { ModelService } from '../model-service';

import type { FeaturesItem } from './common';
import { FeatureTable, MatchTag, ToggleButton } from './common';
import styles from './index.less';
import { ModelReleaseService } from './model-release.service';

type ModelReleaseModalType = {
  visible: boolean;
  close: () => void;
  modelId?: string;
  data?: Record<string, string>;
  onOk?: () => void;
};

export const ModelReleaseModal = (props: ModelReleaseModalType) => {
  const { visible, modelId, close } = props;
  const { projectId } = parse(window.location.search);
  const [form] = Form.useForm();
  const modelSelect = Form.useWatch('model', form);
  const featuresValue = Form.useWatch('features', form);
  const featureNodes =
    featuresValue?.reduce((prev: string[], next: { node: string }) => {
      if (next.node !== undefined) {
        prev.push(next.node);
      }
      return prev;
    }, []) || [];
  const submitDisabled = (featuresValue || []).every(
    (item: { status: string }) => item.status === 'success',
  );
  const modelService = useModel(ModelService);
  const modelReleaseService = useModel(ModelReleaseService);
  const loginService = useModel(LoginService);
  const isP2p = hasAccess({ type: [Platform.AUTONOMY] });

  const [featuresItemsObj, setFeatureItemsObj] = useState<
    Record<number, FeaturesItem[]>
  >({});

  const modelListFilter = isP2p
    ? modelReleaseService.modelList.filter(
        (item) => item.ownerId === loginService.userInfo?.ownerId,
      )
    : modelReleaseService.modelList;

  const modelOptions = modelListFilter.map((item) => ({
    value: item.modelId,
    label: item.modelName,
  }));

  const nodeOptions = modelReleaseService.predictionNodes.map((item) => ({
    value: item.nodeId,
    label: item.nodeName,
  }));

  const nodeOptionsFilter = nodeOptions.map((item) => {
    if ((featuresValue || []).some((v) => v.node === item.value)) {
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

  const mockOptions = [
    {
      label: (
        <div className={styles.mockStyle}>
          <span>mock服务</span>
          <Tag color="green">Mock</Tag>
        </div>
      ),
      value: 'mock',
      key: 'custom-mock',
    },
  ];

  const getPredictionNodes = async (id: string) => {
    if (!id) return;
    modelReleaseService.loading = true;
    await modelReleaseService.getPredictionNodes(id);
    modelReleaseService.loading = false;
    // 设置初始状态
    const initFormFeature = {
      toggle: false,
      toggleDisabled: true,
      node: undefined,
      featureService: undefined,
      status: 'default',
      matchDisabled: true,
    };
    const InitFormlist = modelReleaseService.predictionNodes.map(() => initFormFeature);
    form.setFieldValue(
      'features',
      InitFormlist.length !== 0 ? InitFormlist : [initFormFeature],
    );
    setFeatureItemsObj({});
  };

  useEffect(() => {
    if (!visible) return;
    if (modelId) {
      form.setFieldValue('model', modelId);
    }
    if (modelSelect) {
      getPredictionNodes(modelSelect);
    }
  }, [visible, modelSelect]);

  useEffect(() => {
    if (!visible) return;
    // 获取模型列表
    const getCanSubmitModels = async () => {
      await modelReleaseService.getCanSubmitModelList();
    };
    getCanSubmitModels();
  }, [visible]);

  const handleClose = () => {
    modelService.submitLoading = false;
    close();
  };

  const handleOk = () => {
    form
      .validateFields()
      .then(async (value) => {
        if (!projectId) return;
        const partyConfigs = value.features.map(
          (item: { node: string; featureService: string }, index: number) => {
            const features = (featuresItemsObj?.[index] || []).map((feature) => ({
              offlineName: feature.into,
              onlineName: feature.online,
            }));
            return {
              nodeId: item.node,
              featureTableId: item.featureService,
              isMock: item.featureService === 'mock',
              features,
              resources: [
                {
                  minCPU: `${value[item.node].min_cpu}`,
                  maxCPU: `${value[item.node].max_cpu}`,
                  minMemory: `${value[item.node].min_memory}Gi`,
                  maxMemory: `${value[item.node].max_memory}Gi`,
                },
              ],
            };
          },
        );
        const paramas = {
          modelId: value.model,
          projectId: projectId as string,
          partyConfigs: partyConfigs,
        };
        await modelService.publish(paramas);
        close();
        await modelService.getModelList();
      })
      .catch((value) => {
        modelReleaseService.changeToggle(true);
      });
  };

  // 预测节点
  const handleNodeChange = async (value: string, key: number) => {
    await modelReleaseService.getFeatureServices(value, key);
    const featuresItem = (modelReleaseService.intoFeatures[value] || []).map(
      (item: string) => ({ into: item, online: undefined }),
    );
    setFeatureItemsObj((prev) => ({ ...prev, [key]: featuresItem }));
    form.setFieldsValue({
      features: {
        [key]: {
          featureService: undefined,
          status: 'default',
          toggle: false,
          toggleDisabled: true,
          matchDisabled: true,
        },
      },
    });
  };

  // 特征服务
  const handleFeatureServiceChange = async (value: string, key: number) => {
    // 如果是 mock, 自动匹配成功
    if (value === 'mock') {
      const newFeatureItem = (featuresItemsObj[key] || []).map((item) => ({
        into: item.into,
        online: item.into,
      }));
      form.setFieldsValue({
        features: {
          [key]: {
            toggle: false,
            toggleDisabled: false,
            matchDisabled: true,
            status: 'success',
          },
        },
      });
      setFeatureItemsObj((prev: Record<number, FeaturesItem[]>) => ({
        ...prev,
        [key]: newFeatureItem,
      }));
    } else {
      // 修改，进行同名匹配
      handleMatch(key, value);
    }
  };

  // 同名匹配
  const handleMatch = (key: number, featureService: string) => {
    const nodeId = featuresValue[key].node;
    const id = `${nodeId}_${featureService}`;
    const arr = modelReleaseService.onlineFeatures[id] || [];
    const featuresItem = featuresItemsObj[key] || [];

    // 同名设置，不同名设置undefined
    const errorLength: number[] = [];
    const newFeatureItem = featuresItem.map((item: FeaturesItem, index: number) => {
      if (arr.includes(item.into)) {
        return {
          into: item.into,
          online: item.into,
        };
      } else {
        errorLength.push(index);
        return {
          into: item.into,
          online: undefined,
        };
      }
    });
    // 在这一步应该计算出匹配成功，匹配失败，以及能不能点击匹配，以及自动展开
    form.setFieldsValue({
      features: {
        [key]: {
          toggle: errorLength.length === 0 ? false : true,
          toggleDisabled: false,
          matchDisabled: false,
          status: errorLength.length === 0 ? 'success' : 'error',
        },
      },
    });
    setFeatureItemsObj((prev: Record<number, FeaturesItem[]>) => ({
      ...prev,
      [key]: newFeatureItem,
    }));
  };

  // 设置在线特征的select options
  const getOnlineFeaturesOptions = (key: number) => {
    const nodeId = featuresValue?.[key]?.node;
    if (!nodeId) return;
    const featureServiceId = featuresValue[key].featureService;
    const id = `${nodeId}_${featureServiceId}`;
    const arr = (modelReleaseService.onlineFeatures[id] || []).map((item) => ({
      label: item,
      value: item,
    }));
    return arr;
  };

  return (
    <Drawer
      title={'模型发布'}
      destroyOnClose
      open={visible}
      onClose={handleClose}
      width={680}
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={handleClose}>取消</Button>
          <Button
            type="primary"
            loading={modelService.submitLoading}
            onClick={handleOk}
            disabled={!submitDisabled}
          >
            发布
          </Button>
        </Space>
      }
    >
      <Form form={form} preserve={false} layout="vertical" requiredMark={'optional'}>
        <Form.Item
          name="model"
          label="选择模型"
          rules={[{ required: true, message: '选择模型' }]}
          style={{ marginBottom: 16 }}
        >
          <Select
            disabled={!!modelId}
            options={modelOptions}
            placeholder="请选择模型"
          />
        </Form.Item>
        <div className={styles.featuresTitle}>特征匹配</div>
        <div className={styles.featureContent}>
          {!modelSelect && (
            <div className={styles.emptyFeature}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={'请先选择要发布的模型'}
              />
            </div>
          )}
          {modelSelect && (
            <Spin spinning={modelReleaseService.loading}>
              <div>
                <div className={styles.tableHeader}>
                  <div className={styles.tableHeaderNode}>预测节点</div>
                  <div className={styles.tableHeaderService}>特征服务</div>
                  <div className={styles.tableHeaderStatus}>匹配结果</div>
                  <div className={styles.tableHeaderOptions}>操作</div>
                </div>
                <Row>
                  <Form.List name="features">
                    {(fields) => (
                      <>
                        {fields.map((field) => (
                          <div
                            className={styles.featuresList}
                            style={{ width: '100%' }}
                            key={field.key}
                          >
                            <div className={styles.featuresListContent}>
                              <Form.Item
                                className={styles.formToggle}
                                name={[field.name, 'toggle']}
                              >
                                <ToggleButton
                                  disabled={featuresValue?.[field.key]?.toggleDisabled}
                                />
                              </Form.Item>
                              <Form.Item name={[field.name, 'node']}>
                                <Select
                                  size="small"
                                  className={styles.formNode}
                                  options={nodeOptionsFilter}
                                  onChange={(value) =>
                                    handleNodeChange(value, field.key)
                                  }
                                  allowClear
                                />
                              </Form.Item>
                              <Form.Item
                                name={[field.name, 'featureService']}
                                dependencies={[field.name, 'node']}
                              >
                                <Select
                                  size="small"
                                  className={styles.formService}
                                  options={
                                    featuresValue?.[field.key]?.node
                                      ? mockOptions.concat(
                                          (modelReleaseService.featureServicesSheets[
                                            field.key
                                          ] as []) || [],
                                        )
                                      : []
                                  }
                                  onChange={(value) =>
                                    handleFeatureServiceChange(value, field.key)
                                  }
                                />
                              </Form.Item>
                              <Form.Item name={[field.name, 'status']}>
                                <MatchTag />
                              </Form.Item>
                              <Form.Item name={[field.name, 'matchDisabled']}>
                                <Button
                                  type="link"
                                  disabled={featuresValue?.[field.key]?.matchDisabled}
                                  onClick={() =>
                                    handleMatch(
                                      field.key,
                                      featuresValue[field.key].featureService,
                                    )
                                  }
                                >
                                  同名匹配
                                </Button>
                              </Form.Item>
                            </div>

                            <div
                              style={{
                                display: featuresValue?.[field.key]?.toggle
                                  ? 'block'
                                  : 'none',
                              }}
                            >
                              <FeatureTable
                                name={field.name}
                                fieldKey={field.key}
                                featureItemsRefData={featuresItemsObj[field.key]}
                                setFeatureItemsObj={setFeatureItemsObj}
                                onlineOptions={getOnlineFeaturesOptions(field.key)}
                              />
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </Form.List>
                </Row>
              </div>
            </Spin>
          )}
        </div>
        <div className={styles.featureTitle}>
          <Space>
            资源配置
            <Space
              onClick={modelReleaseService.setToggle}
              className={classNames(styles.configToggle, {
                [styles.configToggleDisabled]: featureNodes.length === 0,
              })}
            >
              <DownOutlined
                style={{
                  transform:
                    modelReleaseService.toggle && featureNodes.length !== 0
                      ? `rotate(180deg)`
                      : `rotate(0)`,
                }}
              />
              {modelReleaseService.toggle && featureNodes.length !== 0
                ? '收起'
                : '展开'}
            </Space>
          </Space>
        </div>
        <div style={{ display: modelReleaseService.toggle ? 'block' : 'none' }}>
          <>
            {featureNodes.map((nodeId: string) => (
              <div className={styles.nodeOptions} key={nodeId}>
                <div className={styles.nodeOptionsTitle}>
                  {nodeOptions.find((item) => item.value === nodeId)?.label} 预测节点
                </div>
                <div className={styles.nodeSettingContent}>
                  <Row>
                    <Col span={5}>
                      <Form.Item
                        initialValue={0}
                        name={[`${nodeId}`, 'min_cpu']}
                        label="最小 CPU"
                        rules={[
                          { required: true, message: '请输入' },
                          {
                            validator(_, value: string) {
                              const max_cpu = form.getFieldValue([
                                `${nodeId}`,
                                'max_cpu',
                              ]);
                              if (max_cpu && value > max_cpu)
                                return Promise.reject(
                                  new Error(`取值应该小于最大 CPU 值`),
                                );
                              return Promise.resolve();
                            },
                          },
                        ]}
                        style={{ marginBottom: 16 }}
                        dependencies={[[`${nodeId}`, 'max_cpu']]}
                      >
                        <InputNumber
                          defaultValue={0}
                          min={0}
                          max={1000}
                          style={{ width: '100%' }}
                          placeholder="请输入"
                          step={1}
                          precision={0}
                          addonAfter="核"
                        />
                      </Form.Item>
                    </Col>

                    <Col span={5} offset={1}>
                      <Form.Item
                        name={[`${nodeId}`, 'max_cpu']}
                        dependencies={[[`${nodeId}`, 'min_cpu']]}
                        label="最大 CPU"
                        initialValue={0}
                        rules={[
                          { required: true, message: '请输入' },
                          {
                            validator(_, value: string) {
                              const min_cpu = form.getFieldValue([
                                `${nodeId}`,
                                'min_cpu',
                              ]);
                              if (min_cpu && value < min_cpu)
                                return Promise.reject(
                                  new Error(`取值应该大于最小 CPU 值`),
                                );
                              return Promise.resolve();
                            },
                          },
                        ]}
                        style={{ marginBottom: 16 }}
                      >
                        <InputNumber
                          defaultValue={32}
                          placeholder="请输入"
                          min={0}
                          max={1000}
                          style={{ width: '100%' }}
                          step={1}
                          precision={0}
                          addonAfter="核"
                        />
                      </Form.Item>
                    </Col>

                    <Col span={5} offset={1}>
                      <Form.Item
                        name={[`${nodeId}`, 'min_memory']}
                        label="最小 Memory"
                        initialValue={0}
                        rules={[
                          { required: true, message: '请输入' },
                          {
                            validator(_, value: string) {
                              const max_memory = form.getFieldValue([
                                `${nodeId}`,
                                'max_memory',
                              ]);
                              if (max_memory && value > max_memory)
                                return Promise.reject(
                                  new Error(`取值应该小于最大 Memory 值`),
                                );
                              return Promise.resolve();
                            },
                          },
                        ]}
                        style={{ marginBottom: 16 }}
                        dependencies={[[`${nodeId}`, 'max_memory']]}
                      >
                        <InputNumber
                          min={0}
                          defaultValue={0}
                          max={10000}
                          placeholder="请输入"
                          style={{ width: '100%' }}
                          step={1}
                          precision={0}
                          addonAfter="Gi"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={5} offset={1}>
                      <Form.Item
                        name={[`${nodeId}`, 'max_memory']}
                        dependencies={[[`${nodeId}`, 'min_memory']]}
                        initialValue={0}
                        label="最大 Memory"
                        rules={[
                          { required: true, message: '请输入' },
                          {
                            validator(_, value: string) {
                              const min_memory = form.getFieldValue([
                                `${nodeId}`,
                                'min_memory',
                              ]);
                              if (min_memory && value < min_memory)
                                return Promise.reject(
                                  new Error(`取值应该大于最小 Memory 值`),
                                );
                              return Promise.resolve();
                            },
                          },
                        ]}
                        style={{ marginBottom: 16 }}
                      >
                        <InputNumber
                          min={0}
                          max={10000}
                          defaultValue={64}
                          placeholder="请输入"
                          style={{ width: '100%' }}
                          step={1}
                          precision={0}
                          addonAfter="Gi"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </div>
            ))}
          </>
        </div>
      </Form>
    </Drawer>
  );
};
