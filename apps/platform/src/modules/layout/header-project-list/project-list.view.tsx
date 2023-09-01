import { DownOutlined, LoadingOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import React from 'react';
import { history, useSearchParams } from 'umi';

import { listProject } from '@/services/secretpad/ProjectController';
import { Model, useModel } from '@/util/valtio-helper';

import styles from './index.less';

export type ProjectVO = API.ProjectVO;

export const ProjectListComponent: React.FC = () => {
  const viewInstance = useModel(HeaderProjectListView);
  const [searchParams] = useSearchParams();

  React.useEffect(() => {
    viewInstance.selectValue = searchParams.get('projectId') || '';
  }, [searchParams, viewInstance]);

  return (
    <div className={styles.projectWrapper}>
      <Select
        disabled={viewInstance.projectList.length === 0}
        onChange={viewInstance.changeProjectList}
        value={viewInstance.loading ? '加载中...' : viewInstance.selectValue}
        suffixIcon={viewInstance.loading ? <LoadingOutlined /> : <DownOutlined />}
        popupClassName={styles.projectDropdown}
        placeholder="请选择"
        showSearch
        optionLabelProp="label"
        optionFilterProp="label"
      >
        {viewInstance.projectList?.map((item) => (
          <Select.Option
            key={item.projectId}
            value={item.projectId}
            label={item.projectName}
          >
            <div>
              <div className={styles.fontBold}>{item.projectName}</div>
              {/* <div className={styles.rows}>
                {item.nodes?.map((node, index) => {
                  return (
                    <>
                      <div className={styles.nodeName}>
                        <Space>
                          <HddOutlined />
                          <span>{node.nodeName}服务节点</span>
                        </Space>
                      </div>
                      {index !== (item.nodes || []).length - 1 ? (
                        <span className={styles.line} />
                      ) : (
                        ''
                      )}
                    </>
                  );
                })}
              </div> */}
            </div>
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export class HeaderProjectListView extends Model {
  projectList: ProjectVO[] = [];

  selectValue = '';

  loading = false;

  getListProject = async () => {
    const { data } = await listProject();
    this.projectList = data as ProjectVO[];
    return this.projectList.reverse();
  };

  onViewMount = async () => {
    this.loading = true;
    await this.getListProject();
    this.loading = false;
  };

  changeProjectList = (value: string) => {
    this.selectValue = value;
    const pathname = window.location.pathname;

    const project = this.projectList?.find((item) => item.projectId === value);

    if (!project) {
      history.push('/');
      return;
    }

    history.push({ pathname, search: `projectId=${value}` });
  };
}
