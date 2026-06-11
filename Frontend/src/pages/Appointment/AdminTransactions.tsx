import { useEffect, useState } from 'react';
import {Box,Typography, Paper,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Chip,CircularProgress,
    Alert,Select,MenuItem,IconButton,Tooltip,Dialog,DialogTitle,DialogContent,DialogActions,Button,Menu } from '@mui/material';

import { Icon } from '@iconify/react';

import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

import {adminGetAllOrders,adminUpdateOrderStatus,adminDeleteOrder,type OrderResponseDto,type OrderStatus,
} from '../../api/orderApi';

import { useTranslation } from 'react-i18next';
import { exportData } from '../../api/reportsApi';

const ORDER_STATUSES = ['Pending', 'Paid', 'Cancelled', 'Refunded'];

function getStatusColor(
    s?: string
): 'default' | 'warning' | 'success' | 'error' | 'info' {
    switch (s?.toLowerCase()) {
        case 'paid':
            return 'success';
        case 'cancelled':
            return 'error';
        case 'refunded':
            return 'info';
        case 'pending':
            return 'warning';
        default:
            return 'default';
    }
}

export default function AdminTransactions() {
    const { t } = useTranslation();

    const [orders, setOrders] = useState<OrderResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] =
        useState<OrderResponseDto | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null);
    const [exporting, setExporting] = useState(false);

    const handleExport = async (format: 'json' | 'csv' | 'excel') => {
        setExportAnchor(null);
        setExporting(true);
        try {
            await exportData('payments', format);
        } catch {
            setError('Export dështoi. Provoni përsëri.');
        } finally {
            setExporting(false);
        }
    };

    useEffect(() => {
        adminGetAllOrders()
            .then(setOrders)
            .catch(() => setError(t('adminTransactions.loadFailed')))
            .finally(() => setLoading(false));
    }, [t]);

    const handleStatusChange = async (
        id: string,
        status: OrderStatus
    ) => {
        setUpdatingId(id);

        try {
            await adminUpdateOrderStatus(id, status);

            setOrders((prev) =>
                prev.map((o) =>
                    o.id === id ? { ...o, status } : o
                )
            );

            setSuccess(t('adminTransactions.statusUpdated'));

            setTimeout(() => setSuccess(null), 3000);
        } catch {
            setError(t('adminTransactions.statusFailed'));
        } finally {
            setUpdatingId(null);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        setDeleting(true);

        try {
            await adminDeleteOrder(deleteTarget.id);

            setOrders((prev) =>
                prev.filter((o) => o.id !== deleteTarget.id)
            );

            setSuccess(t('adminTransactions.deleteSuccess'));

            setTimeout(() => setSuccess(null), 3000);

            setDeleteTarget(null);
        } catch {
            setError(t('adminTransactions.deleteFailed'));
        } finally {
            setDeleting(false);
        }
    };

    const totalRevenue = orders
        .filter((o) => o.status?.toLowerCase() === 'paid')
        .reduce((s, o) => s + (o.totalAmount || 0), 0);

    const statusChartData = ORDER_STATUSES.map((status) => ({
        name: t(`statuses.${status}`),
        value: orders.filter(
            (o) =>
                o.status?.toLowerCase() ===
                status.toLowerCase()
        ).length,
    }));

    const revenueChartData = orders.map((order, index) => ({
        name: `${t('adminTransactions.charts.orderLabel')} ${index + 1}`,
        total: order.totalAmount || 0,
    }));

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, width: '100%' }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Icon icon="solar:wallet-money-bold-duotone" width={36} style={{ color: '#1976d2' }} />
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                        {t('adminTransactions.title')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {t('adminTransactions.subtitle')}
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<Icon icon="solar:export-bold" width={18} />}
                    endIcon={<Icon icon="solar:alt-arrow-down-bold" width={14} />}
                    onClick={(e) => setExportAnchor(e.currentTarget)}
                    disabled={exporting}
                    sx={{ borderRadius: 2, fontWeight: 600, whiteSpace: 'nowrap' }}
                >
                    {exporting ? t('export.exportingBtn', 'Duke eksportuar...') : t('export.exportBtn', 'Eksporto')}
                </Button>
                <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
                    <MenuItem onClick={() => handleExport('excel')}>
                        <Icon icon="vscode-icons:file-type-excel" width={18} style={{ marginRight: 8 }} />
                        {t('export.downloadExcel', 'Shkarko Excel (.xlsx)')}
                    </MenuItem>
                    <MenuItem onClick={() => handleExport('csv')}>
                        <Icon icon="vscode-icons:file-type-csv" width={18} style={{ marginRight: 8 }} />
                        {t('export.downloadCsv', 'Shkarko CSV (.csv)')}
                    </MenuItem>
                    <MenuItem onClick={() => handleExport('json')}>
                        <Icon icon="vscode-icons:file-type-json" width={18} style={{ marginRight: 8 }} />
                        {t('export.downloadJson', 'Shkarko JSON (.json)')}
                    </MenuItem>
                </Menu>
            </Box>



            {/* Summary Cards */}
            <Box
                sx={{
                    display: 'flex',
                    gap: 2,
                    mb: 4,
                    flexWrap: 'wrap',
                }}
            >
                {[
                    {
                        label: t('adminTransactions.totalOrders', 'Total Orders'),
                        value: orders.length,
                        color: 'primary.main',
                    },
                    {
                        label: t('adminTransactions.totalRevenue', 'Total Revenue'),
                        value: `€${totalRevenue.toFixed(2)}`,
                        color: 'success.main',
                    },
                    {
                        label: t('adminTransactions.pendingOrders', 'Pending Orders'),
                        value: orders.filter(
                            (o) =>
                                o.status?.toLowerCase() ===
                                'pending'
                        ).length,
                        color: 'warning.main',
                    },
                    {
                        label: t('adminTransactions.cancelledOrders', 'Cancelled Orders'),
                        value: orders.filter(
                            (o) =>
                                o.status?.toLowerCase() ===
                                'cancelled'
                        ).length,
                        color: 'error.main',
                    },
                ].map((card) => (
                    <Paper
                        key={card.label}
                        elevation={0}
                        sx={(theme) => ({
                            p: 2.5,
                            borderRadius: 3,
                            border: `1px solid ${theme.palette.divider}`,
                            flex: '1 1 160px',
                        })}
                    >
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {card.label}
                        </Typography>

                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 'bold',
                                color: card.color,
                            }}
                        >
                            {card.value}
                        </Typography>
                    </Paper>
                ))}
            </Box>

            {/* Charts */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        lg: '1fr 1fr',
                    },
                    gap: 3,
                    mb: 4,
                }}
            >
                <Paper
                    elevation={0}
                    sx={(theme) => ({
                        p: 3,
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        height: 360,
                    })}
                >
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 'bold', mb: 2 }}
                    >
                        {t('adminTransactions.charts.revenueByOrder', 'Revenue by Order')}
                    </Typography>

                    <ResponsiveContainer
                        width="100%"
                        height="85%"
                    >
                        <BarChart data={revenueChartData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip />
                            <Bar
                                dataKey="total"
                                fill="#1976d2"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>

                <Paper
                    elevation={0}
                    sx={(theme) => ({
                        p: 3,
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        height: 360,
                    })}
                >
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 'bold', mb: 2 }}
                    >
                        {t('adminTransactions.charts.ordersByStatus', 'Orders by Status')}
                    </Typography>

                    <ResponsiveContainer
                        width="100%"
                        height="85%"
                    >
                        <PieChart>
                            <Pie
                                data={statusChartData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={105}
                                label
                            >
                                {statusChartData.map(
                                    (_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={
                                                [
                                                    '#ed6c02',
                                                    '#2e7d32',
                                                    '#d32f2f',
                                                    '#0288d1',
                                                ][index % 4]
                                            }
                                        />
                                    )
                                )}
                            </Pie>

                            <RechartsTooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Paper>
            </Box>

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2, borderRadius: 2 }}
                >
                    {error}
                </Alert>
            )}

            {success && (
                <Alert
                    severity="success"
                    sx={{ mb: 2, borderRadius: 2 }}
                >
                    {success}
                </Alert>
            )}

            {loading ? (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mt: 8,
                    }}
                >
                    <CircularProgress
                        size={48}
                        thickness={4}
                    />
                </Box>
            ) : orders.length === 0 ? (
                <Paper
                    elevation={0}
                    sx={(theme) => ({
                        p: 6,
                        textAlign: 'center',
                        borderRadius: 3,
                        border: `1px dashed ${theme.palette.divider}`,
                    })}
                >
                    <Icon
                        icon="solar:wallet-broken"
                        width={60}
                        style={{
                            color: document.body.classList.contains(
                                'dark-theme'
                            )
                                ? 'rgba(255,255,255,0.3)'
                                : '#1976d2',
                            marginBottom: 16,
                        }}
                    />

                    <Typography variant="h6">
                        {t('adminTransactions.noData')}
                    </Typography>
                </Paper>
            ) : (
                <Paper
                    elevation={0}
                    sx={(theme) => ({
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: `1px solid ${theme.palette.divider}`,
                    })}
                >
                    <TableContainer>
                        <Table>
                            <TableHead
                                sx={{
                                    bgcolor:
                                        'rgba(25, 118, 210, 0.08)',
                                }}
                            >
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {t(
                                            'adminTransactions.table.userName'
                                        )}
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {t(
                                            'adminTransactions.table.userId'
                                        )}
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {t(
                                            'adminTransactions.table.orderId'
                                        )}
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {t(
                                            'adminTransactions.table.amount'
                                        )}
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {t(
                                            'adminTransactions.table.status'
                                        )}
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            fontWeight: 'bold',
                                        }}
                                        align="right"
                                    >
                                        {t(
                                            'adminTransactions.table.actions'
                                        )}
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow
                                        key={order.id}
                                        hover
                                        sx={{
                                            '&:last-child td':
                                            {
                                                border: 0,
                                            },
                                        }}
                                    >
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight:
                                                        'medium',
                                                }}
                                            >
                                                {order.userName ||
                                                    'Unknown'}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontFamily:
                                                        'monospace',
                                                    color: 'text.secondary',
                                                }}
                                            >
                                                {order.userId?.substring(
                                                    0,
                                                    8
                                                )}
                                                ...
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontFamily:
                                                        'monospace',
                                                    color: 'text.secondary',
                                                }}
                                            >
                                                {order.id.substring(
                                                    0,
                                                    8
                                                )}
                                                ...
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography
                                                sx={{
                                                    fontWeight:
                                                        'bold',
                                                    color:
                                                        'primary.main',
                                                }}
                                            >
                                                €
                                                {(
                                                    order.totalAmount ||
                                                    0
                                                ).toFixed(2)}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            {updatingId ===
                                                order.id ? (
                                                <CircularProgress
                                                    size={20}
                                                />
                                            ) : (
                                                <Select
                                                    size="small"
                                                    value={
                                                        order.status ||
                                                        'Pending'
                                                    }
                                                    onChange={(e) =>
                                                        handleStatusChange(
                                                            order.id,
                                                            e.target
                                                                .value as OrderStatus
                                                        )
                                                    }
                                                    sx={{
                                                        borderRadius: 2,
                                                        fontSize:
                                                            '0.8rem',
                                                        minWidth: 130,
                                                    }}
                                                >
                                                    {ORDER_STATUSES.map(
                                                        (
                                                            s
                                                        ) => (
                                                            <MenuItem
                                                                key={
                                                                    s
                                                                }
                                                                value={
                                                                    s
                                                                }
                                                            >
                                                                <Chip
                                                                    label={t(
                                                                        `statuses.${s}`
                                                                    )}
                                                                    size="small"
                                                                    color={getStatusColor(
                                                                        s
                                                                    )}
                                                                    sx={{
                                                                        fontWeight:
                                                                            'bold',
                                                                        cursor:
                                                                            'pointer',
                                                                    }}
                                                                />
                                                            </MenuItem>
                                                        )
                                                    )}
                                                </Select>
                                            )}
                                        </TableCell>

                                        <TableCell align="right">
                                            <Tooltip
                                                title={t(
                                                    'adminTransactions.delete'
                                                )}
                                            >
                                                <IconButton
                                                    color="error"
                                                    size="small"
                                                    onClick={() =>
                                                        setDeleteTarget(
                                                            order
                                                        )
                                                    }
                                                >
                                                    <Icon
                                                        icon="solar:trash-bin-trash-bold"
                                                        width={
                                                            20
                                                        }
                                                    />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            <Dialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle
                    sx={{
                        color: 'error.main',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <Icon
                        icon="solar:danger-bold"
                        width={24}
                    />

                    {t(
                        'adminTransactions.deleteDialog.title'
                    )}
                </DialogTitle>

                <DialogContent>
                    <Typography>
                        {t(
                            'adminTransactions.deleteDialog.desc'
                        )}
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ p: 2.5 }}>
                    <Button
                        onClick={() => setDeleteTarget(null)}
                        variant="outlined"
                        color="inherit"
                        sx={{ borderRadius: 2 }}
                    >
                        {t(
                            'adminTransactions.deleteDialog.cancel'
                        )}
                    </Button>

                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        color="error"
                        disabled={deleting}
                        sx={{ borderRadius: 2 }}
                    >
                        {deleting
                            ? t(
                                'adminTransactions.deleteDialog.deleting'
                            )
                            : t(
                                'adminTransactions.deleteDialog.confirm'
                            )}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}