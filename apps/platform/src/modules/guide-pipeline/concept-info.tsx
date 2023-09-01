import { Drawer, Table } from 'antd';

export const ConceptInfo = (props: IProps) => {
  const { openInfoDrawer, changeDrawerOpen } = props;

  const dataSource = [
    {
      noun: '数据表',
      desc: '一份数据表有与其对应的一份表结构（即schema）及对应数据地址信息（即数据的访问url，计算节点通过该url访问数据内容）。用户可在项目内使用此数据，但无法获得原始数据。',
    },
    {
      noun: '节点',
      desc: '全称为“隐私计算节点”，计算方执行多方安全计算协议或算法逻辑的软件、计算机、虚拟计算机或集群。节点均部署在机构本地，通过节点实现机构原始数据连接及本地计算。',
    },
    {
      noun: '项目',
      desc: '在隐私计算的数据应用中，以项目的形式对于成员、权限、节点、数据等要素做隔离。项目根据应用的类别，会有不同的类型。一个项目通常服务于某一个特定业务场景的联合数据应用。',
    },
    {
      noun: '组件',
      desc: '指的是可视化建模中用户可操作的功能模块，组件中封装了特定的算法功能，用户可配置组件的输入、输出，及组件中算法的配置。',
    },
    {
      noun: '训练流',
      desc: '画布模式下多个组件结合而成的基于安全协议的一系列计算过程，一个训练流可以有多个组件，产生多份结果。',
    },
    {
      noun: '结果',
      desc: '输出的结果包括数据表（包括统计表）、模型、规则文件三类，不同的组件输出结果不同，可通过点击组件查看输出结果。',
    },
    {
      noun: '训练流模版',
      desc: '目前包括联合圈人、金融风控两个训练流模板，通过新建项目或者新建训练流时可选新建模板。',
    },
    {
      noun: '模型',
      desc: '模型研发是基于建模的样本，训练并保存模型的过程，多方安全计算场景下，模型研发产出的联合模型被拆分保存在参与训练的节点上。',
    },
    {
      noun: '规则',
      desc: '一些统计或者分析的规则文件，训练过程中可通过画布组件完成规则编辑和规则文件生成。',
    },
    {
      noun: '节点授权',
      desc: '用户视角，机构节点与机构节点之间需要授权；系统框架视角，机构节点和中心节点之间需要授权。',
    },
  ];

  const columns = [
    {
      title: '名词',
      dataIndex: 'noun',
      width: '30%',
    },
    {
      title: '描述',
      dataIndex: 'desc',
    },
  ];

  return (
    <Drawer
      width={560}
      open={openInfoDrawer}
      onClose={() => changeDrawerOpen(false)}
      title="概念详细说明"
    >
      <Table dataSource={dataSource} columns={columns} pagination={false} />
    </Drawer>
  );
};

interface IProps {
  openInfoDrawer: boolean;
  changeDrawerOpen: (open: boolean) => void;
}
