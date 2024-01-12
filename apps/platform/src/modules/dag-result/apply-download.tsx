import { Alert, Button, message, Modal, Spin, Tag, Typography } from 'antd';
import classnames from 'classnames';
import { parse } from 'query-string';
import { useEffect, useState } from 'react';

import { LoginService } from '@/modules/login/login.service';
import {
  pullStatus,
  create as createAudit,
} from '@/services/secretpad/ApprovalController';
import { useModel } from '@/util/valtio-helper';

import styles from './index.less';

export const ApplyDownloadModal = ({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: API.PullStatusRequest;
  onOk?: () => void;
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [applyList, setApplyList] = useState<API.PullStatusVO>({});
  const [loading, setLoading] = useState(false);
  const { projectId } = parse(window.location.search);

  const getApplyList = async (parmas: API.PullStatusRequest) => {
    setLoading(true);
    const res = await pullStatus(parmas);
    setLoading(false);
    if (res.status && res.status.code === 0) {
      setApplyList(res?.data || {});
    }
  };

  useEffect(() => {
    if (open) {
      getApplyList({
        taskID: data.taskID,
        jobID: data.jobID,
        resourceID: data.resourceID,
        resourceType: data.resourceType,
        projectID: projectId as string,
      });
    }
  }, [data, open]);

  const handleDownload = async (node: API.Participant) => {
    const { status } = await createAudit({
      nodeID: node.nodeID,
      voteType: 'TEE_DOWNLOAD',
      voteConfig: {
        jobID: applyList.jobID,
        taskID: applyList.taskID,
        resourceType: applyList.resourceType,
        resourceID: applyList.resourceID,
        projectID: projectId,
        graphID: applyList.graphID,
      },
    });
    if (status && status.code !== 0) {
      message.error(status.msg);
    } else {
      messageApi.success('申请成功');
      getApplyList({
        taskID: data.taskID,
        jobID: data.jobID,
        resourceType: data.resourceType,
        resourceID: data.resourceID,
        projectID: projectId as string,
      });
    }
  };

  return (
    <>
      <Modal
        title="申请下载"
        open={open}
        onOk={onClose}
        onCancel={onClose}
        wrapClassName={styles.model}
        footer={null}
      >
        <Spin spinning={loading}>
          <Alert
            message="结果数据需要合作节点审核，审核通过可在本方edge平台的【结果管理】进行下载"
            type="warning"
            showIcon
          />
          {(applyList.parties || []).map((node) => {
            return (
              <div className={styles.downloadContent} key={node.nodeID}>
                <div
                  className={classnames(styles.list, {
                    [styles.listError]: node.status === DownloadEnum.REJECTED,
                  })}
                >
                  <span>
                    {node.nodeID}节点（{node.nodeID}）
                  </span>
                  {node.status === DownloadEnum.NOT_INITIATED && (
                    <Typography.Link
                      className={styles.rightText}
                      onClick={() => handleDownload(node)}
                    >
                      申请下载
                    </Typography.Link>
                  )}
                  {node.status === DownloadEnum.REVIEWING && (
                    <span
                      className={styles.rightText}
                      style={{ color: 'rgba(0,0,0,0.45)' }}
                    >
                      申请中，请等待审核
                    </span>
                  )}
                  {node.status === DownloadEnum.APPROVED && (
                    <Tag className={styles.rightText} color="success">
                      申请成功
                    </Tag>
                  )}
                  {node.status === DownloadEnum.REJECTED && (
                    <>
                      <Tag className={styles.rightText} color="error">
                        申请失败
                      </Tag>
                      <Typography.Link onClick={() => handleDownload(node)}>
                        再次申请
                      </Typography.Link>
                    </>
                  )}
                </div>
                <div className={styles.downloadRejectReason}>
                  {node.voteInfos?.map((item) => {
                    if (item.action !== DownloadEnum.REJECTED) return null;
                    return (
                      <div className={styles.rejectBottom} key={item.nodeID}>
                        <span style={{ color: 'rgba(0,0,0,0.65)', fontSize: '12px' }}>
                          {item.nodeName}节点拒绝。拒绝原因: {item.reason}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </Spin>
      </Modal>
      {contextHolder}
    </>
  );
};

export enum DownloadEnum {
  REVIEWING = 'REVIEWING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NOT_INITIATED = 'NOT_INITIATED',
}

interface ApplyDownloadProps {
  data: {
    nodeID: string;
    taskID: string;
    jobID: string;
    projectID: string;
    resourceType: string;
    resourceID: string;
  };
}

export const ApplyDownload = (props: ApplyDownloadProps) => {
  const { data } = props;
  const [applyList, setApplyList] = useState<API.PullStatusVO>({});
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const getApplyList = async (parmas: API.PullStatusRequest) => {
    setLoading(true);
    const res = await pullStatus(parmas);
    setLoading(false);
    if (res.status && res.status.code === 0) {
      setApplyList(res?.data || {});
    }
  };

  useEffect(() => {
    getApplyList({
      taskID: data.taskID,
      jobID: data.jobID,
      projectID: data.projectID,
      resourceType: data.resourceType,
      resourceID: data.resourceID,
    });
  }, []);

  const handleDownload = async (node: API.Participant) => {
    const { status } = await createAudit({
      nodeID: node.nodeID,
      voteType: 'TEE_DOWNLOAD',
      voteConfig: {
        jobID: applyList.jobID,
        taskID: applyList.taskID,
        resourceType: applyList.resourceType,
        resourceID: applyList.resourceID,
        projectID: data.projectID,
        graphID: applyList.graphID,
      },
    });
    if (status && status.code !== 0) {
      message.error(status.msg);
    } else {
      messageApi.success('申请成功');
      getApplyList({
        taskID: data.taskID,
        jobID: data.jobID,
        projectID: data.projectID,
        resourceType: data.resourceType,
        resourceID: data.resourceID,
      });
    }
  };

  return (
    <Spin spinning={loading}>
      {/* 过滤出当前节点登陆的信息 */}
      {(applyList.parties || [])
        .filter((item) => item.nodeID === data.nodeID)
        .map((node) => {
          return (
            <div className={styles.applyDownloadContent} key={node.nodeID}>
              {node.status === DownloadEnum.NOT_INITIATED && (
                <Typography.Link
                  className={styles.rightText}
                  onClick={() => handleDownload(node)}
                >
                  申请下载
                </Typography.Link>
              )}
              {node.status === DownloadEnum.REVIEWING && (
                <span
                  className={styles.rightText}
                  style={{ color: 'rgba(0,0,0,0.45)' }}
                >
                  申请中，请等待审核
                </span>
              )}
              {node.status === DownloadEnum.APPROVED && (
                <Tag className={styles.rightText} color="success">
                  申请成功
                </Tag>
              )}
              {node.status === DownloadEnum.REJECTED && (
                <>
                  <Tag className={styles.rightText} color="error">
                    申请失败
                  </Tag>
                  <Typography.Link
                    className={styles.rightText}
                    onClick={() => handleDownload(node)}
                  >
                    再次申请
                  </Typography.Link>
                </>
              )}
            </div>
          );
        })}
      {contextHolder}
    </Spin>
  );
};

interface DownloadIProps {
  params: {
    nodeID: string;
    taskID: string;
    jobID: string;
    projectID: string;
    resourceType: string;
    resourceID: string;
  };
}

/**
 * 申请下载时，当登录用户为admin，才需要展示选择节点modal，选择向某个节点发起申请；
 * 当为edge时，不需要展示modal，点击申请下载就直接发起审批
 * @param DownloadIProps
 * @returns
 */
export const Download = (props: DownloadIProps) => {
  const loginService = useModel(LoginService);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { params } = props;

  return (
    <>
      {loginService.userInfo?.platformType === 'CENTER' &&
        loginService.userInfo?.ownerType === 'CENTER' && (
          <Button
            type="link"
            size="small"
            onClick={() => setIsModalOpen(true)}
            className={styles.applyDownloadBtn}
          >
            申请下载
          </Button>
        )}
      {loginService.userInfo?.platformType === 'CENTER' &&
        loginService.userInfo?.ownerType === 'EDGE' && (
          <ApplyDownload
            data={{
              nodeID: loginService.userInfo?.ownerId, // 当前登陆用户的节点ID
              taskID: params.taskID,
              jobID: params.jobID,
              projectID: params.projectID,
              resourceType: params.resourceType,
              resourceID: params.resourceID,
            }}
          />
        )}
      <ApplyDownloadModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={{
          taskID: params.taskID,
          jobID: params.jobID,
          resourceType: params.resourceType,
          resourceID: params.resourceID,
        }}
      />
    </>
  );
};
