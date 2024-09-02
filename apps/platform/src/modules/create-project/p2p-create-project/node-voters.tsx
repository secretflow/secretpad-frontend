import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Select, Space, Tooltip } from 'antd';
import styles from './index.less';
import { AddNodeTag } from '../add-node-tag';
import { useModel } from '@/util/valtio-helper';
import { P2PCreateProjectService } from './p2p-create-project.service';

export const NodeVoters = () => {
  const viewInstance = useModel(P2PCreateProjectService);
  const form = Form.useFormInstance();
  const nodeVotersValue = Form.useWatch('nodeVoters', form);
  const handleNodeChange = (value: string) => {
    // 获取本方节点与之授权的节点
    viewInstance.getNodeVoters(value);
    const newNodeVoters = form
      .getFieldValue('nodeVoters')
      .map((item: { nodeId: string }) => {
        if (item?.nodeId && item.nodeId === value) {
          return {
            ...item,
            nodeId: value,
            nodes: undefined,
          };
        } else {
          return item;
        }
      });
    form.setFieldsValue({ nodeVoters: newNodeVoters });
  };
  const nodeOptionsFilter = viewInstance.nodeListOptions.map((item) => {
    if (
      (nodeVotersValue || []).some(
        (node: { nodeId: string }) => node?.nodeId === item.value,
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

  const getNodeList = (name: number) => {
    if (!nodeVotersValue) return [];
    const currentNodeId = nodeVotersValue[name]?.nodeId;
    return viewInstance.nodeVotersMaps[currentNodeId] || [];
  };

  return (
    <Form.List name="nodeVoters" initialValue={[{}]}>
      {(fields, { add, remove }) => (
        <Space direction="vertical">
          <div>
            {fields.map(({ key, name, ...restField }) => (
              <Space
                key={key}
                style={{
                  display: 'flex',
                }}
                align="baseline"
                direction="vertical"
                className={styles.nodeVotersContent}
              >
                <Form.Item
                  {...restField}
                  label={`本方节点`}
                  name={[name, 'nodeId']}
                  rules={[{ required: true, message: '请选择' }]}
                >
                  <Select
                    placeholder="请选择"
                    options={nodeOptionsFilter}
                    size="middle"
                    style={{ width: 260 }}
                    onChange={(value) => handleNodeChange(value)}
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  className={styles.nodeInfoformLabel}
                  label="受邀节点"
                  name={[name, 'nodes']}
                  required
                  tooltip="只能选择已建立好授权的节点，最多可选9个"
                >
                  <AddNodeTag
                    nodeList={getNodeList(name)}
                    className={styles.addTag}
                    max={9}
                  />
                </Form.Item>
                {fields.length > 1 && (
                  <DeleteOutlined
                    className={styles.deleteBtn}
                    onClick={() => remove(name)}
                  />
                )}
              </Space>
            ))}
          </div>
          <div>
            <Tooltip placement="right" title={fields.length >= 5 ? '最多可建5组' : ''}>
              <Button
                disabled={fields.length >= 5}
                onClick={() => add()}
                icon={<PlusOutlined />}
                className={styles.addBtn}
              >
                新增一组节点
              </Button>
            </Tooltip>
          </div>
        </Space>
      )}
    </Form.List>
  );
};
