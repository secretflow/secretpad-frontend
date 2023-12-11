import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import type { ColumnType } from 'antd/lib/table';

export const getColumnSearchProps = <T,>(
  dataIndex: keyof T,
  placeholder: string,
): ColumnType<T> => ({
  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
    <div style={{ padding: 8 }}>
      <Input.Search
        value={selectedKeys[0]}
        onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
        placeholder={placeholder}
        onSearch={() => confirm()}
        onPressEnter={() => confirm()}
      />
    </div>
  ),
  filterIcon: (filtered: boolean) => (
    <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
  ),
});
