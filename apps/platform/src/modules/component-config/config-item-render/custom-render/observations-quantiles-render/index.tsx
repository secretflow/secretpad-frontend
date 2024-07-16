import { QuestionCircleOutlined } from '@ant-design/icons';
import { Empty, Form, Input, InputNumber, Select, Space, Tooltip } from 'antd';
import classNames from 'classnames';

import type {
  AtomicConfigNode,
  ConfigItem,
} from '@/modules/component-config/component-config-protocol';

import type { RenderProp } from '../../config-render-protocol';
import { getComponentByRenderStrategy } from '../../helper';

import { isValidQuantilesString, roundToTwoDecimals } from './helper';
import styles from './index.less';

const getFieldName = (node: ConfigItem, name: string) => {
  return node.prefixes && node.prefixes.length > 0
    ? node.prefixes.join('/') + '/' + name
    : name;
};

const QuatitiesWrapper = (props: { children: React.ReactNode }) => {
  const { children } = props;
  return (
    <div style={{ background: '#fafafa', padding: 4, marginBottom: 8 }}>
      <div className={classNames(styles.layout, styles.font)}>
        <span className={styles.layoutItem}>分位点</span>
        <Space className={styles.layoutItem} size={2}>
          采样方式
          <Tooltip
            placement={'top'}
            title={'如采样倍率>1，但选择不放回采样则会报错处理。'}
          >
            <QuestionCircleOutlined />
          </Tooltip>
        </Space>
        <Space className={styles.layoutItem} size={2}>
          权重
          <Tooltip
            placement={'top'}
            title={
              '即采样后样本的占比。填写范围为(0, 1)之间数值，所有分位区间权重之和需等于1；如不配置时采样后不改变各区间占比；默认保留两位小数。'
            }
          >
            <QuestionCircleOutlined />
          </Tooltip>
        </Space>
      </div>
      {children}
    </div>
  );
};

const ObservationsQuantilesRender: React.FC<RenderProp<string>> = (prop) => {
  const { node, componentConfig, form, translation } = prop;

  const { list_min_length_inclusive = 0, list_max_length_inclusive = -1 } =
    node as AtomicConfigNode;

  const { prefixes } = node;

  const quantilesFieldName = getFieldName(node, node.name);

  const quantilesStringFieldName = getFieldName(node, 'quantiles_string');

  const replacementsFieldName = getFieldName(node, 'replacements');

  const weightsFieldName = getFieldName(node, 'weights');

  let replacements, weights;

  const quantilesString = form?.getFieldValue(quantilesFieldName)?.join(',');

  if (quantilesString && form) {
    const rawList = quantilesString.split(',');
    rawList.push('');

    replacements =
      form.getFieldValue(replacementsFieldName) || rawList.map((_) => true);
    weights = form.getFieldValue(weightsFieldName) || rawList.map((_) => null);

    form.setFieldValue(quantilesStringFieldName, quantilesString);
    form.setFieldValue(replacementsFieldName, replacements);
    form.setFieldValue(weightsFieldName, weights);
    weights.forEach((w: number, i: number) => {
      form.setFieldValue(`weight-${i}`, w);
    });
  }

  const item = (
    <Form.Item noStyle>
      <Form.Item style={{ display: 'none' }} name={quantilesFieldName}></Form.Item>
      <Form.Item
        name={quantilesStringFieldName}
        tooltip={translation[node.docString!] || node.docString}
        label={
          <span className={styles.font}>{translation[node.name] || node.name}</span>
        }
        labelCol={{ span: 12 }}
        rules={[
          { required: true, message: '请输入观测值分位点' },
          {
            validator: async () => {
              const quantilesString = form?.getFieldValue(quantilesStringFieldName);

              if (!isValidQuantilesString(quantilesString)) {
                return Promise.reject(new Error(`请输入合法格式，如：1,2`));
              }

              const list = quantilesString.split(',');

              if (list.length < list_min_length_inclusive) {
                return Promise.reject(
                  new Error(`分位点数量不能小于${list_min_length_inclusive}`),
                );
              }

              if (
                list.length > list_max_length_inclusive &&
                list_max_length_inclusive !== -1
              ) {
                return Promise.reject(
                  new Error(`分位点数量不能超过${list_max_length_inclusive}`),
                );
              }

              return Promise.resolve();
            },
          },
        ]}
      >
        <Input placeholder="示例：1,2" />
      </Form.Item>
      <Form.Item noStyle dependencies={[quantilesStringFieldName]}>
        {() => {
          const quantilesString = form?.getFieldValue(quantilesStringFieldName);

          if (quantilesString) {
            const rawList = quantilesString.split(',');
            rawList.push('');

            const quantilesList = rawList.map((item: string, index: number) => {
              if (index === 0) {
                return `(-∞, ${item}]`;
              }

              if (!item) {
                return `(${rawList[index - 1]}, +∞)`;
              }

              return `(${rawList[index - 1]}, ${item}]`;
            });

            const quantiles =
              quantilesString.split(',')?.map((quantile: string) => {
                return Number(quantile);
              }) || [];

            form?.setFieldValue(quantilesFieldName, quantiles);

            const prevReplacements = form?.getFieldValue(replacementsFieldName) || [];
            const replacements =
              quantilesList?.map((_: string, index: number) => {
                if (prevReplacements[index] !== undefined) {
                  return prevReplacements[index];
                } else {
                  return true;
                }
              }) || [];

            form?.setFieldValue(replacementsFieldName, replacements);

            const prevWeights = form?.getFieldValue(weightsFieldName) || [];
            const weights =
              quantilesList?.map((_: string, index: number) => {
                if (prevWeights[index] !== undefined) {
                  return prevWeights[index];
                } else {
                  return null;
                }
              }) || [];

            form?.setFieldValue(weightsFieldName, weights);

            return (
              <QuatitiesWrapper>
                {quantilesList.map((item: string, index: number) => {
                  return (
                    <div key={index} className={styles.layout}>
                      <span className={styles.layoutItem}>{item}</span>

                      <Select
                        className={styles.layoutItem}
                        style={{ minWidth: '84px' }}
                        defaultValue={replacements?.[index]}
                        onChange={(val) => {
                          const replacements =
                            form?.getFieldValue(replacementsFieldName);

                          form?.setFieldValue(
                            replacementsFieldName,
                            replacements.map((item: number, i: number) => {
                              if (i === index) {
                                return val;
                              } else {
                                return item;
                              }
                            }),
                          );
                        }}
                        options={[
                          {
                            value: true,
                            label: '放回',
                          },
                          {
                            value: false,
                            label: '不放回',
                          },
                        ]}
                      />

                      <Form.Item
                        name={`weight-${index}`}
                        className={styles.layoutItem}
                        rules={[
                          {
                            validator: async (_, val) => {
                              // 获取实时表单的值
                              const weights = quantilesList.map((w, i) =>
                                form?.getFieldValue(`weight-${i}`),
                              );

                              // 计算总和，除了最后一位（最后一位自动分配
                              const copyWeights = [...weights];
                              copyWeights.pop();
                              const sum = copyWeights.reduce((acc, _, i) => {
                                const value = form?.getFieldValue(`weight-${i}`) || 0;

                                return value + acc;
                              }, 0);

                              // 报错，不更新值
                              if (val !== null && val <= 0) {
                                return Promise.reject(
                                  new Error(`分桶权重不能小于等于 0`),
                                );
                              }

                              // 不允许其他有值，但存在 null，会报错
                              if (val === null && sum !== 0) {
                                return Promise.reject(
                                  new Error(`分桶权重不能小于等于 0`),
                                );
                              }

                              // 允许什么都不传，引擎识别 [] 后会自动分配权重
                              if (sum === 0) {
                                form?.setFieldValue(weightsFieldName, []);

                                weights.forEach((_: number, i: number) => {
                                  form?.setFieldValue(`weight-${i}`, null);
                                });

                                return Promise.resolve();
                              }

                              // 报错，不更新值
                              if (sum > 1) {
                                return Promise.reject(
                                  new Error(`各分桶权重之和等于 1`),
                                );
                              }

                              // 没报错，更新值
                              const newWeights = weights.map(
                                (item: number, i: number) => {
                                  if (i === weights.length - 1) {
                                    return roundToTwoDecimals(1 - sum);
                                  }

                                  if (item === null || item === undefined) {
                                    return null;
                                  }

                                  if (i === index) {
                                    return roundToTwoDecimals(val);
                                  }

                                  return roundToTwoDecimals(item);
                                },
                              );

                              form?.setFieldValue(weightsFieldName, newWeights);

                              newWeights.forEach((w: number, i: number) => {
                                form?.setFieldValue(`weight-${i}`, w);
                              });

                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <InputNumber
                          precision={2}
                          controls={false}
                          placeholder="请输入"
                          defaultValue={weights?.[index]}
                        />
                      </Form.Item>
                    </div>
                  );
                })}
              </QuatitiesWrapper>
            );
          } else {
            return (
              <QuatitiesWrapper>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="请先输入观测值分位点"
                  style={{ padding: 32, marginBlock: 0 }}
                />
              </QuatitiesWrapper>
            );
          }
        }}
      </Form.Item>
    </Form.Item>
  );

  return getComponentByRenderStrategy({
    prefixes,
    componentConfig,
    component: item,
    form,
    type: node.type!,
    name: node.name,
  });
};

export default ObservationsQuantilesRender;
