import { useCallback, useEffect, useReducer, useState } from 'react';
import {
    Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, TextField,
    Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    Snackbar, Alert, IconButton, MenuItem,
    InputLabel, Select, FormControl, FormHelperText,
} from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import axios from 'axios';
import api from '../../api/axiosConfig';
import { ROLE_OPTIONS } from '../../constants/roleIds';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

type AdminUserRow = {
    id: string;
    roleId: string;
    firstName: string;
    lastName: string;
    email: string;
    roleName: string;
    gjinia?: string;
};

type ListState = {
    rows: AdminUserRow[];
    loading: boolean;
    search: string;
};

type ListAction =
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; rows: AdminUserRow[] }
    | { type: 'FETCH_FAIL' }
    | { type: 'SET_SEARCH'; value: string };

type UserForm = {
    firstName: string;
    lastName: string;
    email: string;
    gjinia: string;
    roleId: string;
};

function listReducer(state: ListState, action: ListAction): ListState {
    switch (action.type) {
        case 'FETCH_START': return { ...state, loading: true };
        case 'FETCH_SUCCESS': return { ...state, loading: false, rows: action.rows };
        case 'FETCH_FAIL': return { ...state, loading: false, rows: [] };
        case 'SET_SEARCH': return { ...state, search: action.value };
        default: return state;
    }
}

export default function UserManagement() {
    const { t } = useTranslation();
    const { user: currentUser, updateUser } = useAuth();

    const emptyForm: UserForm = {
        firstName: '',
        lastName: '',
        email: '',
        gjinia: '',
        roleId: ROLE_OPTIONS[1].id,
    };

    const [state, dispatch] = useReducer(listReducer, {
        rows: [],
        loading: true,
        search: '',
    });

    const [listVersion, setListVersion] = useState(0);
    const [createOpen, setCreateOpen] = useState<'client' | null>(null);
    const [createForm, setCreateForm] = useState(emptyForm);

    const [editTarget, setEditTarget] = useState<AdminUserRow | null>(null);
    const [editForm, setEditForm] = useState(emptyForm);

    const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);
    const [snackbar, setSnackbar] = useState<{ msg: string; sev: 'success' | 'error' } | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});

    const refetchList = useCallback(() => setListVersion((v) => v + 1), []);

    const formatApiError = (err: unknown): string => {
        if (axios.isAxiosError(err)) {
            return err.response?.data?.message || err.response?.data?.title || t('common.errorOccurred');
        }
        return t('common.errorOccurred');
    };

    useEffect(() => {
        const ctrl = new AbortController();

        const tDelay = window.setTimeout(async () => {
            dispatch({ type: 'FETCH_START' });

            try {
                const response = await api.get('/Admin/GetAllUsers', {
                    params: state.search.trim() ? { term: state.search.trim() } : {},
                    signal: ctrl.signal,
                });

                dispatch({ type: 'FETCH_SUCCESS', rows: response.data || [] });
            } catch (e: unknown) {
                if (axios.isCancel(e)) return;
                dispatch({ type: 'FETCH_FAIL' });
            }
        }, 300);

        return () => {
            ctrl.abort();
            window.clearTimeout(tDelay);
        };
    }, [state.search, listVersion]);

    const handleCloseCreate = () => {
        setFieldErrors({});
        setCreateForm(emptyForm);
        setCreateOpen(null);
    };

    const handleCloseEdit = () => {
        setEditTarget(null);
        setFieldErrors({});
    };

    const handleCloseDelete = () => {
        setDeleteTarget(null);
    };

    const submitCreate = async () => {
        const errors: { [key: string]: boolean } = {
            firstName: !createForm.firstName.trim(),
            lastName: !createForm.lastName.trim(),
            email: !createForm.email.trim(),
            gjinia: !createForm.gjinia,
        };

        if (Object.values(errors).some(Boolean)) {
            setFieldErrors(errors);
            return;
        }

        try {
            await api.post('/Admin/CreateClient', createForm);

            setSnackbar({ msg: t('users.createSuccess'), sev: 'success' });
            setFieldErrors({});
            setCreateOpen(null);
            setCreateForm(emptyForm);
            refetchList();
        } catch (e) {
            setSnackbar({ msg: formatApiError(e), sev: 'error' });
        }
    };

    const openEdit = (user: AdminUserRow) => {
        setEditTarget(user);
        setEditForm({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            gjinia: user.gjinia || '',
            roleId: user.roleId,
        });
    };

    const submitEdit = async () => {
        if (!editTarget) return;

        const errors: { [key: string]: boolean } = {
            firstName: !editForm.firstName?.trim(),
            lastName: !editForm.lastName?.trim(),
            email: !editForm.email.trim(),
            gjinia: !editForm.gjinia,
        };

        if (Object.values(errors).some(Boolean)) {
            setFieldErrors(errors);
            return;
        }

        try {
            await api.put(`/Admin/UpdateUserById/${editTarget.id}`, editForm);

            dispatch({
                type: 'FETCH_SUCCESS',
                rows: state.rows.map((row) =>
                    row.id === editTarget.id ? { ...row, ...editForm } : row
                ),
            });

            if (currentUser && editTarget.id === currentUser.id) {
                updateUser({
                    ...currentUser,
                    ...editForm,
                });
            }

            setSnackbar({ msg: t('users.updateSuccess'), sev: 'success' });
            setEditTarget(null);
            setFieldErrors({});

            setTimeout(() => refetchList(), 500);
        } catch (e) {
            setSnackbar({ msg: formatApiError(e), sev: 'error' });
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            await api.delete(`/Admin/DeleteUserById/${deleteTarget.id}`);
            setSnackbar({ msg: t('users.deleteSuccess'), sev: 'success' });
            setDeleteTarget(null);
            refetchList();
        } catch (e) {
            setSnackbar({ msg: formatApiError(e), sev: 'error' });
        }
    };

    return (
        <Container maxWidth={false} sx={{ width: '100%', px: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 3, mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {t('users.title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('users.subtitle')}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between' }}>
                <TextField
                    size="small"
                    placeholder={t('users.searchPlaceholder')}
                    value={state.search}
                    onChange={(e) => dispatch({ type: 'SET_SEARCH', value: e.target.value })}
                    sx={{ width: { xs: '100%', sm: 300 } }}
                />

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setFieldErrors({});
                            setCreateOpen('client');
                        }}
                    >
                        {t('users.addClient')}
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 2, width: '100%' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>{t('users.table.name')}</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>{t('users.table.email')}</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>{t('users.table.role')}</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>{t('register.gender')}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('users.table.actions')}</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {state.loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        ) : (
                            state.rows.map((u) => (
                                <TableRow key={u.id} hover>
                                    <TableCell>{u.firstName} {u.lastName}</TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell>{u.roleName}</TableCell>
                                    <TableCell>
                                        {u.gjinia === 'M'
                                            ? t('register.genderM')
                                            : u.gjinia === 'F'
                                                ? t('register.genderF')
                                                : '-'}
                                    </TableCell>

                                    <TableCell align="right">
                                        <IconButton color="primary" onClick={() => openEdit(u)}>
                                            <EditOutlinedIcon />
                                        </IconButton>

                                        <IconButton color="error" onClick={() => setDeleteTarget(u)}>
                                            <DeleteOutlineOutlinedIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={createOpen !== null} onClose={handleCloseCreate} fullWidth maxWidth="xs">
                <DialogTitle>{t('users.addClient')}</DialogTitle>

                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <TextField
                        label={t('users.form.firstName')}
                        fullWidth
                        value={createForm.firstName}
                        onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                        error={fieldErrors.firstName}
                        helperText={fieldErrors.firstName ? t('users.table.firstNamex') : undefined}
                    />

                    <TextField
                        label={t('users.form.lastName')}
                        fullWidth
                        value={createForm.lastName}
                        onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                        error={fieldErrors.lastName}
                        helperText={fieldErrors.lastName ? t('users.table.lastNamex') : undefined}
                    />

                    <TextField
                        label={t('users.form.email')}
                        fullWidth
                        value={createForm.email}
                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                        error={fieldErrors.email}
                        helperText={fieldErrors.email ? t('users.table.emailx') : undefined}
                    />

                    <FormControl fullWidth error={!!fieldErrors.gjinia}>
                        <InputLabel id="gender-select-label">{t('register.gender')}</InputLabel>

                        <Select
                            labelId="gender-select-label"
                            id="gender-select"
                            label={t('register.gender')}
                            fullWidth
                            value={createForm.gjinia}
                            onChange={(e) => {
                                setCreateForm({ ...createForm, gjinia: e.target.value });
                                if (fieldErrors.gjinia) {
                                    setFieldErrors({ ...fieldErrors, gjinia: false });
                                }
                            }}
                            displayEmpty
                        >
                            <MenuItem value="M">{t('register.genderM')}</MenuItem>
                            <MenuItem value="F">{t('register.genderF')}</MenuItem>
                        </Select>

                        {fieldErrors.gjinia && (
                            <FormHelperText>{t('users.table.genderx')}</FormHelperText>
                        )}
                    </FormControl>

                    <DialogActions sx={{ p: 0, justifyContent: 'flex-end' }}>
                        <Button variant="contained" onClick={handleCloseCreate} color="inherit">
                            {t('users.form.Cancel')}
                        </Button>

                        <Button variant="contained" onClick={submitCreate} color="success">
                            {t('users.form.Save')}
                        </Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>

            <Dialog open={editTarget !== null} onClose={handleCloseEdit} fullWidth maxWidth="xs">
                <DialogTitle>{t('users.editUser')}</DialogTitle>

                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <TextField
                        label={t('users.form.firstName')}
                        fullWidth
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        error={fieldErrors.firstName}
                        helperText={fieldErrors.firstName ? t('users.table.firstNamex') : ''}
                    />

                    <TextField
                        label={t('users.form.lastName')}
                        fullWidth
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        error={fieldErrors.lastName}
                        helperText={fieldErrors.lastName ? t('users.table.lastNamex') : ''}
                    />

                    <TextField
                        label={t('users.form.email')}
                        fullWidth
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        error={fieldErrors.email}
                        helperText={fieldErrors.email ? t('users.table.emailx') : ''}
                    />

                    <FormControl fullWidth error={!!fieldErrors.gjinia} sx={{ mt: 1 }}>
                        <InputLabel id="edit-gender-label">{t('register.gender')}</InputLabel>

                        <Select
                            labelId="edit-gender-label"
                            label={t('register.gender')}
                            value={editForm.gjinia}
                            onChange={(e) => {
                                setEditForm({ ...editForm, gjinia: e.target.value });
                                if (fieldErrors.gjinia) {
                                    setFieldErrors({ ...fieldErrors, gjinia: false });
                                }
                            }}
                        >
                            <MenuItem value="M">{t('register.genderM')}</MenuItem>
                            <MenuItem value="F">{t('register.genderF')}</MenuItem>
                        </Select>

                        {fieldErrors.gjinia && (
                            <FormHelperText>{t('users.table.genderx')}</FormHelperText>
                        )}
                    </FormControl>

                    <TextField
                        select
                        label={t('users.table.role')}
                        fullWidth
                        value={editForm.roleId}
                        onChange={(e) => setEditForm({ ...editForm, roleId: e.target.value })}
                    >
                        {ROLE_OPTIONS.map((option) => (
                            <MenuItem key={option.id} value={option.id}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </DialogContent>

                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseEdit} color="inherit">
                        {t('users.form.Cancel')}
                    </Button>

                    <Button variant="contained" onClick={submitEdit} color="success">
                        {t('users.form.Save')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteTarget !== null} onClose={handleCloseDelete}>
                <DialogTitle>{t('users.dialog.deleteTitle')}</DialogTitle>

                <DialogContent>
                    <Typography>
                        {t('users.dialog.deleteConfirm', {
                            name: `${deleteTarget?.firstName} ${deleteTarget?.lastName}`,
                        })}
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseDelete}>
                        {t('users.dialog.deleteCancelButton')}
                    </Button>

                    <Button color="error" variant="contained" onClick={confirmDelete}>
                        {t('users.dialog.deleteConfirmButton')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar !== null}
                autoHideDuration={5000}
                onClose={() => setSnackbar(null)}
            >
                <Box>
                    {snackbar && (
                        <Alert severity={snackbar.sev}>
                            {snackbar.msg}
                        </Alert>
                    )}
                </Box>
            </Snackbar>
        </Container>
    );
}