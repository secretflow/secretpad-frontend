import { HddFilled } from '@ant-design/icons';

import { DatatablePreview } from '@/components/datatable-preview';

import type { Datatable } from './create-project.service';
import styles from './node.less';

export const AuthorizationNode = (prop: IProp) => {
  const { nodeInfo, nodeId, getDatatableInfo, dataTable, showTable } = prop;

  return (
    <div className={styles.nodeData}>
      <p>
        <div className={styles.statusIcon}>
          <HddFilled style={{ color: '#52C41A' }} />
        </div>
        <span>节点：{nodeInfo.nodeName}</span>
      </p>
      <div className={styles.list}>
        {!showTable ? (
          <span className={styles.authTip}>
            暂无数据授权，请创建完成后到节点中心操作
          </span>
        ) : (
          nodeInfo.datatables &&
          nodeInfo.datatables.slice(0, 1).map((item) => {
            return (
              <DatatablePreview
                key={item.datatableId}
                datatableId={item.datatableId}
                node={nodeInfo}
              >
                <div
                  // onMouseEnter={async () => {
                  //   await getDatatableInfo(nodeId, item.datatableId as string);
                  // }}
                  className={styles.nodeList}
                >
                  {item.datatableName}
                </div>
              </DatatablePreview>
            );
          })
        )}
      </div>
    </div>
  );
};

interface IProp {
  nodeInfo: API.NodeVO;
  nodeId: string;
  getDatatableInfo: (nodeId: string, datatableId: string) => void;
  dataTable: Datatable;
  showTable: boolean;
}
