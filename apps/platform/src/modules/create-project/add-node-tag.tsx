import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Checkbox, Popover, Tag, Space, Input, message } from 'antd';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';
import classNames from 'classnames';
import { difference } from 'lodash';
import type { ChangeEvent } from 'react';
import React, { useEffect, useState } from 'react';

import { LoginService } from '@/modules/login/login.service';
import { useModel } from '@/util/valtio-helper';

import styles from './add-node-tag.less';

export type Datatable = API.DatatableVO;

export const AddNodeTag: React.FC<{
  nodeList: API.NodeVO[];
  value?: CheckboxValueType[];
  onChange?: (type: CheckboxValueType[]) => void;
  className?: string;
  max?: number;
}> = (props) => {
  const { nodeList, value, onChange, className, max = 10 } = props;
  const [searchValue, setSearchValue] = useState('');
  const loginService = useModel(LoginService);

  useEffect(() => {
    if (
      loginService.userInfo?.platformType === 'CENTER' &&
      loginService.userInfo?.ownerType === 'EDGE'
    ) {
      if (loginService.userInfo.ownerId) {
        setTags([...tags, loginService.userInfo.ownerId]);
      }
    }
  }, []);

  const [tags, setTags] = React.useState<CheckboxValueType[]>(value || []);

  const [nodes, setNodes] = React.useState<API.NodeVO[]>(nodeList);

  useEffect(() => {
    setNodes(nodeList);
  }, [nodeList]);

  const handleClose = (removedTag: CheckboxValueType) => {
    if (
      loginService.userInfo?.platformType === 'CENTER' &&
      loginService.userInfo?.ownerType === 'EDGE' &&
      loginService.userInfo.ownerId
    ) {
      if (loginService.userInfo.ownerId === removedTag) {
        message.warning('当前节点不可取消');
        return;
      }
    }
    const newTags = tags.filter((tag) => tag !== removedTag);
    setTags(newTags);
    onChange && onChange(newTags);
  };

  const handleCheckChange = (checkList: CheckboxValueType[]) => {
    if (searchValue) {
      const searchList = nodeList
        .filter((node) => node.nodeName && node.nodeName.indexOf(searchValue) >= 0)
        .map((item) => item.nodeId);
      const difList = difference(tags, searchList) as CheckboxValueType[];
      const newList = [...difList, ...checkList];
      setTags(newList);
      onChange && onChange(newList);
    } else {
      setTags(checkList);
      onChange && onChange(checkList);
    }
  };

  const handleSearchNode = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      setNodes(nodeList);
      setSearchValue('');
    } else {
      setSearchValue(e.target.value);
      setNodes(
        nodeList.filter(
          (node) => node.nodeName && node.nodeName.indexOf(e.target.value) >= 0,
        ),
      );
    }
  };

  return (
    <div
      className={classNames(styles.addNodeTagContent, className, {
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
                <Tag className={styles.embeddedTag} color="cyan">
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
                const disabled =
                  tags.length >= max && !tags.includes(item.nodeId || '');
                let isEdgeNode = false;
                if (
                  loginService.userInfo?.platformType === 'CENTER' &&
                  loginService.userInfo?.ownerType === 'EDGE' &&
                  loginService.userInfo.ownerId
                ) {
                  if (item.nodeId === loginService.userInfo.ownerId) {
                    isEdgeNode = true;
                  }
                }
                return (
                  <div key={item.nodeId} className={styles.checkItem}>
                    <Checkbox value={item.nodeId} disabled={disabled || isEdgeNode}>
                      {item.type === 'embedded' && (
                        <Tag className={styles.embeddedTag} color="cyan">
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
