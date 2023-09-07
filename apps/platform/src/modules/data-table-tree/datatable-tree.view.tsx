import { DatabaseOutlined, PlusOutlined, ProfileOutlined } from '@ant-design/icons';
import { Alert, Space, Tree, Tooltip, Empty, Tour, Typography } from 'antd';
import { parse } from 'query-string';
import { useRef, useEffect } from 'react';

import { DatatablePreview } from '@/components/datatable-preview';
import { getDatatable } from '@/services/secretpad/DatatableController';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import { DatatableTreeService } from './datatable-tree.service';
import styles from './index.less';

const { Text } = Typography;

export const DatatableTreeComponent = () => {
  const viewInstance = useModel(DatatableTreeView);
  const ref1 = useRef(null);

  const useUpdateEffect = (
    effect: () => void,
    dependencies: React.DependencyList | undefined,
  ) => {
    const isFirstRender = useRef(true);

    useEffect(() => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
      } else {
        effect();
      }
    }, dependencies);
  };

  useUpdateEffect(() => {
    const { search } = window.location;
    const { projectId } = parse(search);

    const str = localStorage.getItem(projectId as string);

    if (str && JSON.parse(str) === projectId) {
      viewInstance.showTour = false;
    } else {
      localStorage.setItem(projectId as string, JSON.stringify(projectId));
    }
  }, [viewInstance.showTour]);

  const titleRender = (item: API.NodeVO, node: any) => {
    const isTable = node.isTable;
    const table = item.datatables?.find((i) => i.datatableId === node.id);

    return isTable ? (
      <DatatablePreview
        tableInfo={viewInstance.previewDatatable || {}}
        node={item}
        loading={viewInstance.datatableFetching}
      >
        <div
          onMouseEnter={() =>
            viewInstance.getDatatableInfo(item.nodeId || '', table?.datatableId || '')
          }
        >
          <Text style={{ width: 150 }} ellipsis={{ tooltip: node.title }}>
            {node.title}
          </Text>
        </div>
      </DatatablePreview>
    ) : (
      <div className={styles.treeRootNode}>
        <span style={{ flex: 1, width: 150 }}>
          <Space>
            <DatabaseOutlined />
            <Text style={{ width: 120 }} ellipsis={{ tooltip: node.title }}>
              {node.title}
            </Text>
          </Space>
        </span>
        <span className={styles.treeRootNodeActions}>
          <Space>
            <Tooltip title="查看详情">
              <ProfileOutlined
                onClick={() => viewInstance.gotoNodeCenter(item.nodeId as string)}
              />
            </Tooltip>
            <Tooltip title="添加数据">
              <PlusOutlined
                onClick={() => viewInstance.gotoNodeCenter(item.nodeId as string)}
              />
            </Tooltip>
          </Space>
        </span>
      </div>
    );
  };
  return (
    <div className={styles.treeRoot}>
      <div className={styles.alert}>
        <Alert
          showIcon={true}
          message="仅展示该项目已授权的数据表"
          type="info"
          closable
        />
      </div>
      {viewInstance.projectNodes?.map((item, index) => {
        const treeData = viewInstance.buildTableTreeData(item) as any;
        const components = [
          <Tree
            key={item.nodeId}
            blockNode
            rootClassName={styles.tree}
            treeData={treeData}
            titleRender={(treeNode: any) => titleRender(item, treeNode)}
          ></Tree>,
        ];
        if (
          !treeData[0] ||
          !treeData[0].children ||
          treeData[0].children?.length === 0
        ) {
          const extendProps: any = {};
          if (index === 0) {
            extendProps['ref'] = ref1;
          }
          components.push(
            <div style={{ padding: '5px 0' }} {...extendProps}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.4)' }}>
                      暂无数据授权
                    </div>
                    <a
                      href={`/node?nodeId=${item.nodeId}&tab=data-management`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: 12,
                        color: '#0068fa',
                      }}
                    >
                      去节点中心添加
                    </a>
                  </div>
                }
              />
            </div>,
          );
        }
        return components;
      })}
      <Tour
        open={viewInstance.tourInited && viewInstance.showTour}
        onClose={() => (viewInstance.showTour = false)}
        mask={false}
        type="primary"
        placement="right"
        prefixCls="data-tree"
        steps={[
          {
            title: '去这里添加节点数据授权',
            description: '空白画布暂无节点数据',
            nextButtonProps: {
              children: '知道了',
            },
            target: () => {
              if (ref1.current) {
                if (!viewInstance.tourInited) {
                  viewInstance.showTour = true;
                }
                viewInstance.tourInited = true;
              }
              return ref1.current;
            },
          },
        ]}
      />
    </div>
  );
};

type DatatableVO = API.DatatableVO;

export class DatatableTreeView extends Model {
  projectNodes?: API.NodeVO[] = [];

  previewDatatable?: DatatableVO;

  datatableFetching = false;

  currentDatatableFetch = '';

  tourInited = false;

  showTour = false;

  projectInfo?: API.ProjectVO;

  datatableTreeService = getModel(DatatableTreeService);

  onViewMount() {
    this.getDatatables();
  }

  gotoNodeCenter(nodeId: string) {
    // history.push(`node?nodeId=${nodeId}`);
    const a = document.createElement('a');
    a.href = `/node?nodeId=${nodeId}&tab=data-management`;
    a.target = '_blank';
    a.click();
  }

  async getDatatables() {
    const { search } = window.location;
    const { projectId } = parse(search);
    this.projectInfo = await this.datatableTreeService.getProjectNodes(
      projectId as string,
    );

    this.projectNodes = this.projectInfo?.nodes || [];
  }

  async getDatatableInfo(nodeId: string, datatableId: string) {
    this.datatableFetching = true;
    this.currentDatatableFetch = nodeId + datatableId;
    const { data } = await getDatatable({
      nodeId,
      datatableId,
    });

    // 防止多个数据表预览出现冲突
    if (nodeId + datatableId !== this.currentDatatableFetch) {
      return;
    }

    this.previewDatatable = data;
    this.datatableFetching = false;
  }

  buildTableTreeData(nodeInfo: API.NodeVO) {
    const data = [
      {
        title: nodeInfo.nodeName + '节点',
        key: nodeInfo.nodeId + '_root',
        children: nodeInfo.datatables?.map((table, index) => {
          return {
            title: table.datatableName,
            key: table.datatableId + '_' + index,
            isTable: true,
            id: table.datatableId,
          };
        }),
      },
    ];
    return data;
  }
}
