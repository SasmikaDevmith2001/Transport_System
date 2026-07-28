import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  TablePagination,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';

/**
 * Generic, reusable data table with server-side pagination/sorting.
 * Feature pages configure `columns` and pass paginated data + handlers -
 * no business logic lives here.
 *
 * columns: [{ field, headerName, sortable?, render?(row) }]
 */
export default function DataTable({
  columns,
  rows,
  totalCount,
  page,
  pageSize,
  sortBy,
  sortOrder,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  getRowId = (row) => row.id,
  emptyMessage = 'No records found',
}) {
  return (
    <Paper variant="outlined">
      <TableContainer sx={{ position: 'relative', minHeight: 200 }}>
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.paper',
              opacity: 0.7,
              zIndex: 1,
            }}
          >
            <CircularProgress size={28} />
          </Box>
        )}
        <Table size="medium">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.field}>
                  {col.sortable ? (
                    <TableSortLabel
                      active={sortBy === col.field}
                      direction={sortBy === col.field ? sortOrder.toLowerCase() : 'asc'}
                      onClick={() => onSortChange?.(col.field)}
                    >
                      {col.headerName}
                    </TableSortLabel>
                  ) : (
                    col.headerName
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => (
              <TableRow key={getRowId(row)} hover>
                {columns.map((col) => (
                  <TableCell key={col.field}>{col.render ? col.render(row) : row[col.field]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount}
        page={page - 1}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[10, 20, 50]}
        onPageChange={(_, newPage) => onPageChange(newPage + 1)}
        onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
      />
    </Paper>
  );
}
