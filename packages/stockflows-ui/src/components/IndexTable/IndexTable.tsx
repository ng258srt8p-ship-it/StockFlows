import React from 'react';
import { IndexTable as PolarisIndexTable, type IndexTableProps as PolarisIndexTableProps } from '@shopify/polaris';
import { Product } from '../../types';
import './IndexTable.css';

export interface IndexTableProps {
  items: Product[];
  onItemClick?: (item: Product) => void;
  selectedItems?: string[];
  onSelectionChange?: PolarisIndexTableProps['onSelectionChange'];
}

const headings: PolarisIndexTableProps['headings'] = [
  { id: 'sku', title: 'SKU', alignment: 'start' },
  { id: 'product', title: 'Product', alignment: 'start' },
  { id: 'location', title: 'Location', alignment: 'start' },
  { id: 'onHand', title: 'On Hand', alignment: 'end' },
  { id: 'committed', title: 'Committed', alignment: 'end' },
  { id: 'status', title: 'Status', alignment: 'start' },
  { id: 'incoming', title: 'Incoming', alignment: 'end' },
];

export const IndexTable = ({
  items,
  onItemClick,
  selectedItems = [],
  onSelectionChange,
}: IndexTableProps) => {
  return (
    <div className="sf-index-table">
      <PolarisIndexTable
        headings={headings}
        selectable={true}
        itemCount={items.length}
        selectedItemsCount={selectedItems.length}
        resourceName={{ singular: 'product', plural: 'products' }}
        onSelectionChange={onSelectionChange}
      >
        {items.map((item, index) => (
          <PolarisIndexTable.Row
            key={item.id}
            id={item.id}
            selected={selectedItems.includes(item.id)}
            position={index}
            onClick={onItemClick ? () => onItemClick(item) : undefined}
          >
            <PolarisIndexTable.Cell>{item.sku}</PolarisIndexTable.Cell>
            <PolarisIndexTable.Cell>{item.name}</PolarisIndexTable.Cell>
            <PolarisIndexTable.Cell>{item.location}</PolarisIndexTable.Cell>
            <PolarisIndexTable.Cell>{item.onHand.toLocaleString()}</PolarisIndexTable.Cell>
            <PolarisIndexTable.Cell>{item.committed.toLocaleString()}</PolarisIndexTable.Cell>
            <PolarisIndexTable.Cell>
              <span className={`sf-status-badge sf-status-badge--${item.status}`}>
                {item.status === 'in_stock' ? 'In Stock' : item.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
              </span>
            </PolarisIndexTable.Cell>
            <PolarisIndexTable.Cell>{item.incoming > 0 ? item.incoming.toLocaleString() : '—'}</PolarisIndexTable.Cell>
          </PolarisIndexTable.Row>
        ))}
      </PolarisIndexTable>
    </div>
  );
};

IndexTable.displayName = 'IndexTable';