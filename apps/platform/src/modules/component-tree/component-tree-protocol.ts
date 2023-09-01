export type ComponentTreeItem = {
  isLeaf: boolean;
  category: string;
  key: string;
  title: Record<'val', string>;
  children?: ComponentTreeItem[];
  docString: string;
  version?: string;
};
