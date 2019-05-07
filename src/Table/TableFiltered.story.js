import React from 'react';
import Paper from '@material-ui/core/Paper';
import { storiesOf } from '@storybook/react';
import Table from './Table';
import { cars } from './exampleData';
import { GROUPS } from '../../.storybook/hierarchySeparators';

const columns = [
  {
    title: 'Brand',
    field: 'brand',
    options: {
      filter: true,
    },
  },
  {
    title: 'Model',
    field: 'model.name',
    options: {
      filter: true,
    },
  },
  {
    title: 'Year',
    field: 'model.year',
    options: {
      filter: true,
      numeric: true,
    },
  },
];

const onFilterData = filteredData => {
  // eslint-disable-next-line no-console
  console.log(filteredData);
};

const FilteringTable = () => (
  <Paper style={{ width: 1000 }}>
    <Table
      columns={columns}
      data={cars}
      rowId={row => row.id}
      onFilterData={onFilterData}
    />
  </Paper>
);

storiesOf(`${GROUPS.COMPONENTS}|Table`, module).add(
  'Filtering Table',
  FilteringTable
);