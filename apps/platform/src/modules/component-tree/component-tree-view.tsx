import { HolderOutlined } from '@ant-design/icons';
import { Popover, Tree } from 'antd';
import { useCallback } from 'react';

import { DefaultComponentInterpreterService as ComponentInterpreterService } from '@/modules/component-interpreter/component-interpreter-service';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import { ComponentIcons } from './component-icon';
import type { ComponentTreeItem } from './component-tree-protocol';
import { DefaultComponentTreeService as ComponentTreeService } from './component-tree-service';
import SearchInput from './components/search-input';
import style from './index.less';

const { DirectoryTree } = Tree;

export const ComponentTree = () => {
  const viewInstance = useModel(ComponentTreeView);
  const interpreter = viewInstance.componentInterpreter;
  const treeNodeRender = useCallback(
    (treeNode: ComponentTreeItem) => {
      const { isLeaf, docString, title: titleElement, category, version } = treeNode;

      const title = titleElement.val;

      if (isLeaf) {
        const interpretion =
          interpreter.getComponentTranslationMap({
            domain: category,
            name: title,
            version,
          }) || {};
        return (
          <Popover
            content={interpretion[docString] || docString}
            placement="right"
            overlayStyle={{
              width: 200,
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
            }}
          >
            <div
              className={style.node}
              onMouseDown={(e) => viewInstance.startDrag(e, treeNode)}
            >
              <div className={style.nodeTitle}>
                <span className={style.icon}>
                  {ComponentIcons[category] || ComponentIcons['default']}
                </span>
                <span>{interpretion[title] || title}</span>
              </div>
              <div className={style.nodeDragHolder}>
                <HolderOutlined />
              </div>
            </div>
          </Popover>
        );
      } else {
        const child = treeNode.children?.[0];
        const { category: _category, title: name, version: _version } = child || {};
        const interpretion =
          interpreter.getComponentTranslationMap({
            domain: _category || '',
            name: name?.val || '',
            version: _version,
          }) || {};

        return <span className={style.dir}>{interpretion[title] || title}</span>;
      }
    },
    [interpreter, viewInstance],
  );

  return (
    <div className={`${style.components} component-tree-for-tour`}>
      <div className={style.action}>
        <SearchInput
          className={style.search}
          placeholder="请输入搜索关键字"
          onSearch={viewInstance.handleSearchComponent}
        ></SearchInput>
      </div>
      {viewInstance.componentTreeData.length && (
        <DirectoryTree
          rootClassName={style.tree}
          blockNode
          showIcon={false}
          defaultExpandAll
          titleRender={(node) => treeNodeRender(node)}
          treeData={
            viewInstance.searchComponents.length
              ? viewInstance.searchComponents
              : viewInstance.componentTreeData
          }
        ></DirectoryTree>
      )}
    </div>
  );
};

export class ComponentTreeView extends Model {
  componentTreeData: ComponentTreeItem[] = [];

  searchComponents: ComponentTreeItem[] = [];

  componentTreeService = getModel(ComponentTreeService);
  componentInterpreter = getModel(ComponentInterpreterService);

  onViewMount = () => {
    this.componentTreeData = this.componentTreeService.convertToTree();
  };

  handleSearchComponent = (keyword?: string) => {
    if (!keyword) {
      this.searchComponents = [];
      return;
    }
    const { componentList } = this.componentTreeService;
    const searchRes = componentList
      .map(({ name, desc, domain, version }) => ({
        isLeaf: true,
        title: { val: name },
        key: name,
        docString: desc,
        category: domain,
        version,
      }))
      .filter(({ category, version, key }) => {
        const interpretion =
          this.componentInterpreter.getComponentTranslationMap({
            domain: category,
            name: key,
            version,
          }) || {};

        return (interpretion[key] || key).toLowerCase().includes(keyword.toLowerCase());
      });

    this.searchComponents = searchRes;
  };
  startDrag = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    treeNode: ComponentTreeItem,
  ) => {
    e.persist();
    const { title, category } = treeNode;

    this.componentTreeService.dragComponent({ title: title.val, category }, e);
  };
}
