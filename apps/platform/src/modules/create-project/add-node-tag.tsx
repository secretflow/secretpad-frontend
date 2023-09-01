import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Checkbox, Popover, Tag, Space, Input } from 'antd';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';
import classNames from 'classnames';
import type { ChangeEvent } from 'react';
import React from 'react';

import styles from './add-node-tag.less';

export type Datatable = API.DatatableVO;

export const AddNodeTag: React.FC<{
  nodeList: API.NodeVO[];
  value?: CheckboxValueType[];
  onChange?: (type: CheckboxValueType[]) => void;
}> = (props) => {
  const { nodeList, value, onChange } = props;

  const [tags, setTags] = React.useState<CheckboxValueType[]>(value || []);
  const [nodes, setNodes] = React.useState<API.NodeVO[]>(nodeList);

  const handleClose = (removedTag: CheckboxValueType) => {
    const newTags = tags.filter((tag) => tag !== removedTag);
    setTags(newTags);
    onChange && onChange(newTags);
  };

  const handleCheckChange = (checkList: CheckboxValueType[]) => {
    setTags(checkList);
    onChange && onChange(checkList);
  };

  const handleSearchNode = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      setNodes(nodeList);
    } else {
      setNodes(
        nodes.filter(
          (node) => node.nodeName && node.nodeName.indexOf(e.target.value) >= 0,
        ),
      );
    }
  };

  return (
    <div
      className={classNames(styles.addNodeTagContent, {
        [styles.addNodePosition]: tags.length === 0,
      })}
    >
      <Space size={[0, 8]} wrap>
        {tags.map((tag) => {
          const tagCurrent = nodeList.find((item) => item.nodeId === tag);
          const type = tagCurrent?.type;
          const tagName = tagCurrent
            ? `${tagCurrent.nodeName}(${tagCurrent.nodeId})`
            : '';
          return (
            <Tag
              key={tag as string}
              closable
              style={{
                userSelect: 'none',
                backgroundColor: '#fff',
                display: 'flex',
                alignItems: 'center',
                height: 26,
              }}
              onClose={() => handleClose(tag)}
            >
              {type === 'embedded' && (
                <Tag bordered={false} color="cyan">
                  内置
                </Tag>
              )}
              {tagName.length > 20 ? `${tagName.slice(0, 20)}...` : tagName}
            </Tag>
          );
        })}
      </Space>
      <Popover
        trigger="click"
        placement="left"
        title="添加节点"
        overlayClassName={styles.popverNodeContent}
        content={
          <div className={styles.popverContent}>
            <Input
              placeholder="输入关键字搜索节点"
              suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
              onChange={(e) => handleSearchNode(e)}
            />
            <Checkbox.Group
              className={styles.checkBoxGroup}
              value={tags}
              onChange={(checkList: CheckboxValueType[]) =>
                handleCheckChange(checkList)
              }
            >
              {nodes.map((item) => {
                const disabled = tags.length >= 10 && !tags.includes(item.nodeId || '');
                return (
                  <div key={item.nodeId} className={styles.checkItem}>
                    <Checkbox value={item.nodeId} disabled={disabled}>
                      {item.type === 'embedded' && (
                        <Tag bordered={false} color="cyan">
                          内置
                        </Tag>
                      )}
                      {`${item.nodeName} (${item.nodeId})`}
                    </Checkbox>
                  </div>
                );
              })}
            </Checkbox.Group>
          </div>
        }
      >
        <Space
          className={classNames(styles.addNode, {
            [styles.addNodePosition]: tags.length === 0,
          })}
        >
          <PlusOutlined />
          <span>添加节点</span>
        </Space>
      </Popover>
    </div>
  );
};
