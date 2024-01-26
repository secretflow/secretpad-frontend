export interface IDataTable {
  datatableId: string;
  datatableName: string;
  label: string;
  value: string | string[];
  nodeId: string;
}
export interface IOutputDataTable {
  datatableId: string;
  datatableName: string;
  graphNodeId: string;
  nodeId: string;
}
