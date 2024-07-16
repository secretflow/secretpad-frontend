import { DatabaseOutlined, PlusOutlined, ProfileOutlined } from '@ant-design/icons';
import {
  Alert,
  Space,
  Tree,
  Tooltip,
  Empty,
  Tour,
  Typography,
  Tag,
  Button,
} from 'antd';
import { parse } from 'query-string';
import { useRef, useEffect } from 'react';
import { useLocation } from 'umi';

import { DatatablePreview } from '@/components/datatable-preview';
import { EdgeAuthWrapper } from '@/components/edge-wrapper-auth';
import { AccessWrapper, Platform, hasAccess } from '@/components/platform-wrapper';
import { LoginService } from '@/modules/login/login.service';
import { getProjectDatatable } from '@/services/secretpad/ProjectController';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import { DatatableTreeService } from './datatable-tree.service';
import styles from './index.less';
import { openNewTab } from '@/util/path';
import { ProjectEditService } from '../layout/header-project-list/project-edit.service';

const { Text } = Typography;

export const DatatableTreeComponent = () => {
  const viewInstance = useModel(DatatableTreeView);
  const projectEditService = useModel(ProjectEditService);

  const ref1 = useRef(null);
  const { pathname, search } = useLocation();
  const { projectId } = parse(search);
  const currentLoginNodeId = viewInstance.loginService.userInfo?.ownerId;
  useEffect(() => {
    viewInstance.getDatatables();
  }, [projectId]);

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
        // tableInfo={viewInstance.previewDatatable || {}}
        node={item}
        key={item.nodeId}
        datatableId={table?.datatableId || ''}
      >
        <div
        // onMouseEnter={() =>
        //   viewInstance.getDatatableInfo(item.nodeId || '', table?.datatableId || '')
        // }
        >
          <Text style={{ width: 150 }} ellipsis={{ tooltip: node.title }}>
            {node.title}
          </Text>
        </div>
      </DatatablePreview>
    ) : (
      <div className={styles.treeRootNode}>
        <span style={{ flex: 1, width: 140 }}>
          <Space>
            {/* 需要服务端增加type字段 */}
            {node?.nodeType === 'embedded' && (
              <Tag
                bordered={false}
                style={{ marginRight: '0', backgroundColor: '#ECFFF4' }}
              >
                内置
              </Tag>
            )}
            <DatabaseOutlined />
            <Text style={{ width: 120 }} ellipsis={{ tooltip: node.title }}>
              {node.title}
            </Text>
          </Space>
        </span>
        <span className={styles.treeRootNodeActions}>
          {node.nodeType === 'embedded' && (
            <EdgeAuthWrapper>
              <Space>
                <Tooltip title="查看详情">
                  <ProfileOutlined
                    onClick={() =>
                      viewInstance.gotoNodeCenter(item.nodeId as string, pathname)
                    }
                  />
                </Tooltip>
                <Tooltip title="添加数据">
                  <PlusOutlined
                    onClick={() =>
                      viewInstance.gotoNodeCenter(item.nodeId as string, pathname)
                    }
                  />
                </Tooltip>
              </Space>
            </EdgeAuthWrapper>
          )}
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
                    {(item as API.NodeVO & { nodeType?: 'embedded' }).nodeType ===
                      'embedded' && (
                      <EdgeAuthWrapper>
                        <Button
                          type="link"
                          onClick={() => {
                            openNewTab(
                              pathname,
                              '/node',
                              `nodeId=${item.nodeId}&tab=data-management`,
                            );
                          }}
                          style={{
                            fontSize: 12,
                            color: '#0068fa',
                          }}
                        >
                          去节点中心添加
                        </Button>
                      </EdgeAuthWrapper>
                    )}
                    {item.nodeId === currentLoginNodeId &&
                      hasAccess({ type: [Platform.AUTONOMY] }) &&
                      !projectEditService.canEdit.gotoDataManagerDisabled && (
                        <Button
                          type="link"
                          onClick={() => {
                            openNewTab(
                              pathname,
                              '/edge',
                              `nodeId=${item.nodeId}&tab=data-management`,
                            );
                          }}
                          style={{
                            fontSize: 12,
                            color: '#0068fa',
                          }}
                        >
                          去数据管理添加
                        </Button>
                      )}
                  </div>
                }
              />
            </div>,
          );
        }
        return components;
      })}
      <AccessWrapper
        accessType={{
          type: [Platform.CENTER, Platform.EDGE],
        }}
      >
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
      </AccessWrapper>
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
  loginService = getModel(LoginService);

  gotoNodeCenter(nodeId: string, pathname: string) {
    // history.push(`node?nodeId=${nodeId}`);
    const isP2p = this.loginService.userInfo?.platformType === Platform.AUTONOMY;
    const search = isP2p
      ? `tab=data-management&nodeId=${nodeId}`
      : `nodeId=${nodeId}&tab=data-management`;
    const router = isP2p ? '/edge' : '/node';
    openNewTab(pathname, router, search);
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
    const { search } = window.location;
    const { projectId } = parse(search);
    const { data } = await getProjectDatatable({
      nodeId,
      datatableId,
      projectId: projectId as string,
      type: 'CSV',
    });

    // 防止多个数据表预览出现冲突
    if (nodeId + datatableId !== this.currentDatatableFetch) {
      return;
    }

    this.previewDatatable = data;
    this.datatableFetching = false;
  }

  buildTableTreeData(nodeInfo: API.NodeVO & { nodeType?: 'embedded' }) {
    const data = [
      {
        title: nodeInfo.nodeName + '节点',
        key: nodeInfo.nodeId + '_root',
        nodeType: nodeInfo.nodeType,
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
