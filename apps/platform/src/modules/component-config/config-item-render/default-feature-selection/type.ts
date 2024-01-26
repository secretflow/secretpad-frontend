export type SchemaType = Record<string, SchemaValueType>;

export interface TableInfoType {
  datatableId: string;
  datatableName: string;
  nodeId: string;
  graphNodeId?: string;
}

export interface SchemaValueType {
  type: string;
  disabled?: boolean;
}

export interface FieldInfoType {
  value?: string;
  type?: string;
  colName: string;
}
