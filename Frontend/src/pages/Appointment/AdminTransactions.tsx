import { useEffect, useState } from 'react';
import {Box, Typography, Paper, Table,TableBody,TableCell,TableContainer,TableHead,
    TableRow,Chip,CircularProgress,Alert,Select,MenuItem,IconButton,Tooltip,
    Dialog,DialogTitle,DialogContent,DialogActions,Button,
} from '@mui/material';

import { Icon } from '@iconify/react';


import {adminGetAllOrders,adminUpdateOrderStatus,adminDeleteOrder,
    type OrderResponseDto,
    type OrderStatus,
} from '../../api/orderApi';

import { useTranslation } from 'react-i18next';

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
            <Box
                sx={{
                    mb: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Icon
                    icon="solar:wallet-money-bold-duotone"
                    width={36}
                    style={{ color: '#1976d2' }}
                />

                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            color: 'primary.main',
                            fontWeight: 'bold',
                        }}
                    >
                        {t('adminTransactions.title')}
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary' }}
                    >
                        {t('adminTransactions.subtitle')}
                    </Typography>
                </Box>
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
                        display: 'flex',
                        flexDirection: 'column',
                    })}
                >
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 'bold', mb: 2 }}
                    >
                        {t('adminTransactions.charts.revenueByOrder', 'Revenue by Order')}
                    </Typography>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
                        {revenueChartData.slice(0, 12).map((item, i) => {
                            const max = Math.max(...revenueChartData.map(d => d.total), 1);
                            const pct = Math.round((item.total / max) * 100);
                            return (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="caption" sx={{ minWidth: 72, color: 'text.secondary', fontSize: '0.7rem' }}>
                                        {item.name}
                                    </Typography>
                                    <Box sx={{ flex: 1, bgcolor: 'action.hover', borderRadius: 1, height: 18, overflow: 'hidden' }}>
                                        <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: '#1976d2', borderRadius: 1, transition: 'width 0.4s' }} />
                                    </Box>
                                    <Typography variant="caption" sx={{ minWidth: 50, textAlign: 'right', fontWeight: 'bold' }}>
                                        €{item.total.toFixed(2)}
                                    </Typography>
                                </Box>
                            );
                        })}
                        {revenueChartData.length === 0 && (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                                {t('adminTransactions.noData', 'No data')}
                            </Typography>
                        )}
                    </Box>
                </Paper>

                <Paper
                    elevation={0}
                    sx={(theme) => ({
                        p: 3,
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        height: 360,
                        display: 'flex',
                        flexDirection: 'column',
                    })}
                >
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 'bold', mb: 2 }}
                    >
                        {t('adminTransactions.charts.ordersByStatus', 'Orders by Status')}
                    </Typography>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center' }}>
                        {statusChartData.map((item, i) => {
                            const colors = ['#ed6c02', '#2e7d32', '#d32f2f', '#0288d1'];
                            const total = statusChartData.reduce((s, d) => s + d.value, 0) || 1;
                            const pct = Math.round((item.value / total) * 100);
                            return (
                                <Box key={i}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: colors[i % 4] }} />
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">{item.value} ({pct}%)</Typography>
                                    </Box>
                                    <Box sx={{ width: '100%', bgcolor: 'action.hover', borderRadius: 1, height: 10, overflow: 'hidden' }}>
                                        <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: colors[i % 4], borderRadius: 1, transition: 'width 0.4s' }} />
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
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