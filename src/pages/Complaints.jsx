import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Button,
    TextField,
    InputAdornment,
    TablePagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    MenuItem,
    CircularProgress,
    Tabs,
    Tab,
    Card,
    CardContent,
    Avatar,
    Divider,
    Tooltip
} from '@mui/material';
import {
    Search,
    FilterList,
    Edit,
    Reply,
    Visibility,
    History,
    CheckCircle,
    Pending,
    Loop,
    AutoFixHigh
} from '@mui/icons-material';
import {
    collection,
    getDocs,
    updateDoc,
    doc,
    query,
    orderBy,
    onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';

const STATUS_OPTIONS = ['pending', 'in_progress', 'resolved'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high'];

const Complaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [tabValue, setTabValue] = useState(0); // 0: All, 1: Pending, 2: In Progress, 3: Resolved
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [openDetails, setOpenDetails] = useState(false);
    const [adminRemarks, setAdminRemarks] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setComplaints(list);
            setLoading(false);
        }, (error) => {
            console.error("Error listening to complaints:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setPage(0);
    };

    const handleViewDetails = (complaint) => {
        setSelectedComplaint(complaint);
        setAdminRemarks(complaint.adminRemarks || '');
        setOpenDetails(true);
    };

    const handleUpdateStatus = async (status) => {
        if (!selectedComplaint) return;
        setUpdateLoading(true);
        try {
            const complaintRef = doc(db, 'complaints', selectedComplaint.id);
            await updateDoc(complaintRef, {
                status,
                adminRemarks,
                resolvedAt: status === 'resolved' ? new Date() : null,
                updatedAt: new Date()
            });
            setOpenDetails(false);
        } catch (error) {
            console.error("Error updating complaint:", error);
        } finally {
            setUpdateLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'error';
            case 'in_progress': return 'warning';
            case 'resolved': return 'success';
            default: return 'default';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#F44336';
            case 'medium': return '#FF9800';
            case 'low': return '#4CAF50';
            default: return '#757575';
        }
    };

    const filteredComplaints = complaints.filter(c => {
        const matchesSearch = c.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.category?.toLowerCase().includes(searchTerm.toLowerCase());

        if (tabValue === 0) return matchesSearch;
        if (tabValue === 1) return matchesSearch && c.status === 'pending';
        if (tabValue === 2) return matchesSearch && c.status === 'in_progress';
        if (tabValue === 3) return matchesSearch && c.status === 'resolved';
        return matchesSearch;
    });

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
                Complaint Management
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2, display: 'flex', gap: 2 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search complaints by student, description or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                            size="small"
                        />
                        <Button startIcon={<FilterList />} variant="outlined">
                            Filters
                        </Button>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', px: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%', textAlign: 'center' }}>
                            <Box>
                                <Typography variant="h6" color="error.main">{complaints.filter(c => c.status === 'pending').length}</Typography>
                                <Typography variant="caption">Pending</Typography>
                            </Box>
                            <Box>
                                <Typography variant="h6" color="warning.main">{complaints.filter(c => c.status === 'in_progress').length}</Typography>
                                <Typography variant="caption">Active</Typography>
                            </Box>
                            <Box>
                                <Typography variant="h6" color="success.main">{complaints.filter(c => c.status === 'resolved').length}</Typography>
                                <Typography variant="caption">Resolved</Typography>
                            </Box>
                        </Box>
                    </Card>
                </Grid>
            </Grid>

            <Paper sx={{ mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label={`All (${complaints.length})`} />
                    <Tab label={`Pending (${complaints.filter(c => c.status === 'pending').length})`} />
                    <Tab label={`In Progress (${complaints.filter(c => c.status === 'in_progress').length})`} />
                    <Tab label={`Resolved (${complaints.filter(c => c.status === 'resolved').length})`} />
                </Tabs>

                <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Student</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Priority</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Created Date</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : filteredComplaints.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((complaint) => (
                                <TableRow key={complaint.id} hover>
                                    <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                        #{complaint.id.substring(0, 6).toUpperCase()}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2">{complaint.studentName}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {complaint.determinedCategory && (
                                                <Tooltip title="AI Classified">
                                                    <AutoFixHigh sx={{ fontSize: 16, color: 'primary.main' }} />
                                                </Tooltip>
                                            )}
                                            {complaint.category}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: getPriorityColor(complaint.priority), mr: 1 }} />
                                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{complaint.priority}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={complaint.status?.replace('_', ' ')}
                                            size="small"
                                            color={getStatusColor(complaint.status)}
                                            sx={{ textTransform: 'capitalize' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {complaint.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<Reply />}
                                            onClick={() => handleViewDetails(complaint)}
                                        >
                                            Respond
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!loading && filteredComplaints.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                        No complaints found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredComplaints.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </TableContainer>
            </Paper>

            {/* Details Dialog */}
            <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
                {selectedComplaint && (
                    <>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6">Complaint Details</Typography>
                                <Typography variant="caption" color="text.secondary">ID: {selectedComplaint.id}</Typography>
                            </Box>
                            <Chip
                                label={selectedComplaint.status?.replace('_', ' ')}
                                color={getStatusColor(selectedComplaint.status)}
                                sx={{ textTransform: 'capitalize' }}
                            />
                        </DialogTitle>
                        <DialogContent dividers>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={7}>
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="overline" color="text.secondary">Description</Typography>
                                        <Typography variant="body1" sx={{ mt: 1, p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                                            {selectedComplaint.description}
                                        </Typography>
                                    </Box>

                                    {selectedComplaint.imageUrl && (
                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="overline" color="text.secondary">Attached Evidence</Typography>
                                            <Box sx={{ mt: 1, borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd' }}>
                                                <img
                                                    src={selectedComplaint.imageUrl}
                                                    alt="Complaint Evidence"
                                                    style={{ width: '100%', maxHeight: 400, objectFit: 'contain', background: '#f5f5f5' }}
                                                />
                                            </Box>
                                        </Box>
                                    )}

                                    <Box>
                                        <Typography variant="overline" color="text.secondary" gutterBottom>Admin Remarks</Typography>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={4}
                                            placeholder="Add your notes or response here..."
                                            value={adminRemarks}
                                            onChange={(e) => setAdminRemarks(e.target.value)}
                                            sx={{ mt: 1 }}
                                        />
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={5}>
                                    <Card variant="outlined" sx={{ bgcolor: 'rgba(0,0,0,0.01)', borderRadius: 2 }}>
                                        <CardContent>
                                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>Student Info</Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Avatar sx={{ mr: 2 }}>{selectedComplaint.studentName?.charAt(0)}</Avatar>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedComplaint.studentName}</Typography>
                                                    <Typography variant="caption" color="text.secondary">ID: {selectedComplaint.studentId}</Typography>
                                                </Box>
                                            </Box>
                                            <Divider sx={{ my: 2 }} />

                                            <Grid container spacing={1}>
                                                <Grid item xs={5}><Typography variant="caption">Category:</Typography></Grid>
                                                <Grid item xs={7}><Typography variant="body2">{selectedComplaint.category}</Typography></Grid>

                                                <Grid item xs={5}><Typography variant="caption">AI Prediction:</Typography></Grid>
                                                <Grid item xs={7}><Typography variant="body2">{selectedComplaint.determinedCategory || 'N/A'}</Typography></Grid>

                                                <Grid item xs={5}><Typography variant="caption">Priority:</Typography></Grid>
                                                <Grid item xs={7}>
                                                    <Chip
                                                        label={selectedComplaint.priority}
                                                        size="small"
                                                        sx={{ height: 20, fontSize: '0.65rem', bgcolor: getPriorityColor(selectedComplaint.priority) + '20', color: getPriorityColor(selectedComplaint.priority) }}
                                                    />
                                                </Grid>

                                                <Grid item xs={5}><Typography variant="caption">Created:</Typography></Grid>
                                                <Grid item xs={7}><Typography variant="body2">{selectedComplaint.createdAt?.toDate().toLocaleString()}</Typography></Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 3, gap: 1 }}>
                            <Button onClick={() => setOpenDetails(false)}>Cancel</Button>
                            {selectedComplaint.status === 'pending' && (
                                <Button
                                    variant="outlined"
                                    color="warning"
                                    disabled={updateLoading}
                                    onClick={() => handleUpdateStatus('in_progress')}
                                >
                                    Start Progress
                                </Button>
                            )}
                            {selectedComplaint.status !== 'resolved' && (
                                <Button
                                    variant="contained"
                                    color="success"
                                    disabled={updateLoading}
                                    onClick={() => handleUpdateStatus('resolved')}
                                >
                                    Mark Resolved
                                </Button>
                            )}
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default Complaints;
