import { useState } from 'react';
import { Box, Button, InputAdornment, TextField, MenuItem, Stack, IconButton, Typography, Avatar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import { useSnackbar } from 'notistack';
import PageHeader from '../../../components/layout-elements/PageHeader';
import DataTable from '../../../components/data-table/DataTable';
import ConfirmDialog from '../../../components/feedback/ConfirmDialog';
import StatusChip from '../../../components/feedback/StatusChip';
import CustomerFormDialog from '../components/CustomerFormDialog';
import { useCustomersList, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '../hooks/useCustomers';
import { useAuth } from '../../../contexts/AuthContext';

export default function CustomersListPage() {
  const { hasPermission } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const params = { page, pageSize, search: search || undefined, status: status || undefined, sortBy, sortOrder };
  const { data, isLoading } = useCustomersList(params);

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const columns = [
    {
      field: 'companyName',
      headerName: 'Company',
      sortable: true,
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar variant="rounded" sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>
            <BusinessIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.companyName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.contactPerson || '—'}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    { field: 'phone', headerName: 'Phone', sortable: false },
    { field: 'city', headerName: 'City', sortable: true, render: (row) => row.city || '-' },
    { field: 'status', headerName: 'Status', sortable: true, render: (row) => <StatusChip status={row.status} /> },
    {
      field: 'actions',
      headerName: '',
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          {hasPermission('customers:update') && (
            <IconButton size="small" onClick={() => { setEditing(row); setFormOpen(true); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {hasPermission('customers:delete') && (
            <IconButton size="small" onClick={() => setDeleteTarget(row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      ),
    },
  ];

  const handleSortChange = (field) => {
    if (sortBy === field) setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  const handleFormSubmit = async (values) => {
    try {
      if (editing) {
        await updateCustomer.mutateAsync({ id: editing.id, payload: values });
        enqueueSnackbar('Customer updated successfully', { variant: 'success' });
      } else {
        await createCustomer.mutateAsync(values);
        enqueueSnackbar('Customer created successfully', { variant: 'success' });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Something went wrong', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCustomer.mutateAsync(deleteTarget.id);
      enqueueSnackbar('Customer deleted successfully', { variant: 'success' });
      setDeleteTarget(null);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to delete customer', { variant: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Customer Management"
        description="Manage client companies your transport operations serve."
        actions={
          hasPermission('customers:create') && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setFormOpen(true); }}>
              New Customer
            </Button>
          )
        }
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          placeholder="Search by company, contact, phone or email"
          size="small"
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          sx={{ width: { xs: '100%', sm: 340 } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(e) => { setPage(1); setStatus(e.target.value); }}
          sx={{ width: { xs: '100%', sm: 160 } }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
      </Stack>

      <DataTable
        columns={columns}
        rows={data?.data || []}
        totalCount={data?.meta?.total || 0}
        page={page}
        pageSize={pageSize}
        sortBy={sortBy}
        sortOrder={sortOrder}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        onSortChange={handleSortChange}
        emptyMessage="No customers found. Create your first customer to get started."
      />

      <CustomerFormDialog
        open={formOpen}
        customer={editing}
        submitting={createCustomer.isPending || updateCustomer.isPending}
        onSubmit={handleFormSubmit}
        onClose={() => { setFormOpen(false); setEditing(null); }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete customer"
        message={`Are you sure you want to delete ${deleteTarget?.companyName}?`}
        loading={deleteCustomer.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
