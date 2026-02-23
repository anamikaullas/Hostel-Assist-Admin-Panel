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
    Avatar,
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
    CircularProgress
} from '@mui/material';
import {
    Search,
    FilterList,
    Edit,
    Delete,
    Add,
    Download,
    Visibility
} from '@mui/icons-material';
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    query,
    where
} from 'firebase/firestore';
import { db } from '../firebase';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        enrollmentId: '',
        year: 1,
        role: 'student'
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'users'), where('role', '==', 'student'));
            const snapshot = await getDocs(q);
            const studentList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setStudents(studentList);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleOpenDialog = (student = null) => {
        if (student) {
            setSelectedStudent(student);
            setFormData({
                fullName: student.fullName || '',
                email: student.email || '',
                phoneNumber: student.phoneNumber || '',
                enrollmentId: student.enrollmentId || '',
                year: student.year || 1,
                role: 'student'
            });
        } else {
            setSelectedStudent(null);
            setFormData({
                fullName: '',
                email: '',
                phoneNumber: '',
                enrollmentId: '',
                year: 1,
                role: 'student'
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedStudent(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            if (selectedStudent) {
                // Update existing
                const studentRef = doc(db, 'users', selectedStudent.id);
                await updateDoc(studentRef, {
                    ...formData,
                    updatedAt: serverTimestamp()
                });
            } else {
                // Create new
                await addDoc(collection(db, 'users'), {
                    ...formData,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            }
            handleCloseDialog();
            fetchStudents();
        } catch (error) {
            console.error("Error saving student:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this student?")) {
            try {
                await deleteDoc(doc(db, 'users', id));
                fetchStudents();
            } catch (error) {
                console.error("Error deleting student:", error);
            }
        }
    };

    const filteredStudents = students.filter(s =>
        s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.enrollmentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Student Management
                </Typography>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<Download />}
                        sx={{ mr: 2 }}
                    >
                        Export
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                    >
                        Add Student
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ mb: 4, p: 2, display: 'flex', gap: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search by name, ID or email..."
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

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                        <TableRow>
                            <TableCell>Student</TableCell>
                            <TableCell>ID / Roll No</TableCell>
                            <TableCell>Year</TableCell>
                            <TableCell>Room</TableCell>
                            <TableCell>Contact</TableCell>
                            <TableCell>Status</TableCell>
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
                        ) : filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((student) => (
                            <TableRow key={student.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                            {student.fullName?.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                {student.fullName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {student.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>{student.enrollmentId || 'N/A'}</TableCell>
                                <TableCell>{student.year ? `Year ${student.year}` : 'N/A'}</TableCell>
                                <TableCell>
                                    {student.roomNumber ? (
                                        <Chip label={student.roomNumber} size="small" variant="outlined" color="primary" />
                                    ) : (
                                        <Chip label="Unallocated" size="small" variant="outlined" color="warning" />
                                    )}
                                </TableCell>
                                <TableCell>{student.phoneNumber || 'N/A'}</TableCell>
                                <TableCell>
                                    <Chip
                                        label="Active"
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => handleOpenDialog(student)}>
                                        <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDelete(student.id)}>
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!loading && filteredStudents.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    No students found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredStudents.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>
                    {selectedStudent ? 'Edit Student' : 'Add New Student'}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Enrollment ID"
                                name="enrollmentId"
                                value={formData.enrollmentId}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Academic Year"
                                name="year"
                                value={formData.year}
                                onChange={handleInputChange}
                            >
                                {[1, 2, 3, 4].map((year) => (
                                    <MenuItem key={year} value={year}>
                                        Year {year}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        {selectedStudent ? 'Update' : 'Add Student'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Students;
