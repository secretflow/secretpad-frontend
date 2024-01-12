import { HddOutlined, LoadingOutlined } from '@ant-design/icons';
import { Badge, Empty, Popover, Space, Spin, Tag } from 'antd';
import classNames from 'classnames';

import { formatTimestamp } from '@/modules/dag-result/utils';
import { useModel } from '@/util/valtio-helper';

import { ProjectListModel } from '../../index';

import styles from './index.less';

interface IProps {
  project: API.ProjectVO;
  isP2P?: boolean;
  currentId?: string;
}

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

export const ProjectNodePopover = (props: IProps) => {
  const { project, isP2P = false, currentId } = props;

  return (
    <div>
      <Popover
        title={`参与节点 (${project.nodes?.length || 0})`}
        overlayClassName={styles.popover}
        placement="right"
        content={
          <>
            {project.nodes && project.nodes.length > 0
              ? project.nodes.map((node, nodeIndex: number) => {
                  return (
                    <div key={`node-${nodeIndex}`} className={styles.joinNode}>
                      <Space>
                        {isP2P && (
                          <Tag
                            className={classNames(styles.tag, {
                              [styles.tagProcess]: nodeIndex !== 0,
                            })}
                          >
                            {nodeIndex === 0 ? '发起' : '受邀'}
                          </Tag>
                        )}
                        <HddOutlined />
                        {node.nodeName}服务节点
                        {currentId === node.nodeId && currentId && <div>(我的)</div>}
                      </Space>
                    </div>
                  );
                })
              : '暂无参与节点'}
          </>
        }
      >
        {project.nodes?.length || 0}
      </Popover>
    </div>
  );
};

export const ProjectPipeLinePopover = (props: IProps) => {
  const { project } = props;
  const projectListModel = useModel(ProjectListModel);
  return (
    <div>
      <Popover
        title="训练流"
        overlayClassName={styles.popover}
        placement="right"
        onOpenChange={(visible) => {
          if (visible) {
            projectListModel.getPipelines(project);
          } else {
            projectListModel.pipelines = [];
          }
        }}
        content={
          <div className={styles.jobsList}>
            <Spin indicator={antIcon} spinning={projectListModel.fetchingPipelineList}>
              {projectListModel.pipelines.length > 0
                ? projectListModel.pipelines.map((pipeline, i: number) => {
                    return (
                      <div className={styles.pipeLine} key={`job-${i}`}>
                        {pipeline.name}
                      </div>
                    );
                  })
                : '暂无任务流'}
            </Spin>
          </div>
        }
      >
        {project.graphCount}
      </Popover>
    </div>
  );
};

const mapStatusToBadge = (status: API.GraphJobStatus) => {
  switch (status.toLowerCase()) {
    case 'running':
      return 'processing';
    case 'failed':
      return 'error';
    case 'succeed':
      return 'success';
    case 'stopped':
      return 'warning';
  }
};

export const ProjectTaskPopover = (props: IProps) => {
  const { project } = props;
  const projectListModel = useModel(ProjectListModel);
  return (
    <div>
      <Popover
        title="最新10条运行任务"
        overlayClassName={styles.popover}
        placement="right"
        onOpenChange={(visible) => {
          if (visible) {
            projectListModel.getJobs(project);
          } else {
            projectListModel.jobs = [];
          }
        }}
        content={
          <div className={styles.jobsList}>
            {(() => {
              const data = projectListModel.jobs.map((job, jobIndex: number) => {
                return (
                  <div
                    className={styles.jobItem + ' ' + styles.pipeLine}
                    key={`task-${jobIndex}`}
                  >
                    <Space>
                      <Badge
                        status={mapStatusToBadge(job.status as API.GraphJobStatus)}
                        text=""
                      />
                      <span>{formatTimestamp(job.gmtCreate as string)}</span>
                    </Space>
                    <div className={styles.jobItemID}>ID: {job.jobId}</div>
                  </div>
                );
              });
              if (data.length > 0) return data;

              return <Empty description={false} />;
            })()}
          </div>
        }
      >
        {project.jobCount}
      </Popover>
    </div>
  );
};
