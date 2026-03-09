import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CardActions,
    Chip,
    Button,
    IconButton,
    TextField,
    InputAdornment,
    MenuItem,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    Checkbox,
    ListItemText,
    Badge,
    Tooltip
} from '@mui/material';
import {
    Search,
    Add,
    Edit,
    Delete,
    MeetingRoom,
    People,
    Build,
    Wifi,
    AcUnit,
    Bathtub
} from '@mui/icons-material';
import {
    collection,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    query,
    orderBy,
    where
} from 'firebase/firestore';
import { db } from '../firebase';

const AMENITIES_OPTIONS = [
    { value: 'wifi', label: 'Wi-Fi', icon: <Wifi fontSize="small" /> },
    { value: 'ac', label: 'AC', icon: <AcUnit fontSize="small" /> },
    { value: 'attached_bathroom', label: 'Attached Bathroom', icon: <Bathtub fontSize="small" /> },
    { value: 'heater', label: 'Heater' },
    { value: 'study_table', label: 'Study Table' },
];

const ROOM_TYPES = ['single', 'double', 'triple', 'quad'];
const ROOM_CONDITIONS = ['good', 'fair', 'needs_repair'];

const Rooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBlock, setFilterBlock] = useState('All');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [formData, setFormData] = useState({
        blockName: 'A',
        roomNumber: '',
        floorNumber: 1,
        capacity: 2,
        roomType: 'double',
        condition: 'good',
        amenities: [],
        monthlyRent: 5000,
        currentOccupancy: 0,
        occupantIds: []
    });
    const [studentsWithoutRooms, setStudentsWithoutRooms] = useState([]);
    const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [allocatingRoom, setAllocatingRoom] = useState(null);
    const [allocationLoading, setAllocationLoading] = useState(false);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'rooms'), orderBy('roomNumber', 'asc'));
            const snapshot = await getDocs(q);
            const roomList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRooms(roomList);

            // Fetch students without rooms
            const sq = query(collection(db, 'users'), where('role', '==', 'student'));
            const sSnapshot = await getDocs(sq);
            const availableStudents = sSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(s => !s.roomId);
            setStudentsWithoutRooms(availableStudents);
        } catch (error) {
            console.error("Error fetching rooms/students:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (room = null) => {
        if (room) {
            setSelectedRoom(room);
            setFormData({
                blockName: room.blockName || 'A',
                roomNumber: room.roomNumber || '',
                floorNumber: room.floorNumber || 1,
                capacity: room.capacity || 2,
                roomType: room.roomType || 'double',
                condition: room.condition || 'good',
                amenities: room.amenities || [],
                monthlyRent: room.monthlyRent || 5000,
                currentOccupancy: room.currentOccupancy || 0,
                occupantIds: room.occupantIds || []
            });
        } else {
            setSelectedRoom(null);
            setFormData({
                blockName: 'A',
                roomNumber: '',
                floorNumber: 1,
                capacity: 2,
                roomType: 'double',
                condition: 'good',
                amenities: [],
                monthlyRent: 5000,
                currentOccupancy: 0,
                occupantIds: []
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedRoom(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAmenityChange = (event) => {
        const { value } = event.target;
        setFormData(prev => ({
            ...prev,
            amenities: typeof value === 'string' ? value.split(',') : value,
        }));
    };

    const handleSubmit = async () => {
        try {
            if (selectedRoom) {
                const roomRef = doc(db, 'rooms', selectedRoom.id);
                await updateDoc(roomRef, {
                    ...formData,
                    roomId: selectedRoom.id,
                    updatedAt: serverTimestamp()
                });
            } else {
                const newDocRef = doc(collection(db, 'rooms'));
                await setDoc(newDocRef, {
                    ...formData,
                    roomId: newDocRef.id,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            }
            handleCloseDialog();
            fetchRooms();
        } catch (error) {
            console.error("Error saving room:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this room? Only empty rooms can be deleted.")) {
            try {
                await deleteDoc(doc(db, 'rooms', id));
                fetchRooms();
            } catch (error) {
                console.error("Error deleting room:", error);
            }
        }
    };

    const handleOpenAllocation = (room) => {
        setAllocatingRoom(room);
        setAllocationDialogOpen(true);
    };

    const handleConfirmAllocation = async () => {
        if (!selectedStudentId || !allocatingRoom) return;
        setAllocationLoading(true);
        try {
            const student = studentsWithoutRooms.find(s => s.id === selectedStudentId);
            const roomRef = doc(db, 'rooms', allocatingRoom.id);
            const studentRef = doc(db, 'users', selectedStudentId);

            const newOccupants = [...(allocatingRoom.occupantIds || []), selectedStudentId];

            await updateDoc(roomRef, {
                occupantIds: newOccupants,
                currentOccupancy: newOccupants.length,
                updatedAt: serverTimestamp()
            });

            await updateDoc(studentRef, {
                roomId: allocatingRoom.id,
                roomNumber: `${allocatingRoom.blockName}-${allocatingRoom.roomNumber}`,
                updatedAt: serverTimestamp()
            });

            setAllocationDialogOpen(false);
            setSelectedStudentId('');
            setAllocatingRoom(null);
            fetchRooms();
        } catch (error) {
            console.error("Allocation error:", error);
        } finally {
            setAllocationLoading(false);
        }
    };

    const handleRandomAllocate = async () => {
        if (studentsWithoutRooms.length === 0) {
            alert("No students left to allocate.");
            return;
        }

        const availableRooms = rooms.filter(r => r.currentOccupancy < r.capacity);
        if (availableRooms.length === 0) {
            alert("No rooms available for allocation.");
            return;
        }

        if (window.confirm(`Attempting to automatically allocate ${Math.min(studentsWithoutRooms.length, availableRooms.reduce((acc, r) => acc + (r.capacity - r.currentOccupancy), 0))} students. Continue?`)) {
            setLoading(true);
            try {
                let currentStudents = [...studentsWithoutRooms];
                for (let room of availableRooms) {
                    let vacancies = room.capacity - room.currentOccupancy;
                    let occupantsToAdd = [];

                    while (vacancies > 0 && currentStudents.length > 0) {
                        const student = currentStudents.pop();
                        occupantsToAdd.push(student.id);

                        await updateDoc(doc(db, 'users', student.id), {
                            roomId: room.id,
                            roomNumber: `${room.blockName}-${room.roomNumber}`,
                            updatedAt: serverTimestamp()
                        });

                        vacancies--;
                    }

                    if (occupantsToAdd.length > 0) {
                        const newOccupants = [...(room.occupantIds || []), ...occupantsToAdd];
                        await updateDoc(doc(db, 'rooms', room.id), {
                            occupantIds: newOccupants,
                            currentOccupancy: newOccupants.length,
                            updatedAt: serverTimestamp()
                        });
                    }

                    if (currentStudents.length === 0) break;
                }
                fetchRooms();
            } catch (error) {
                console.error("Random allocation error:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const getConditionColor = (condition) => {
        switch (condition) {
            case 'good': return 'success';
            case 'fair': return 'warning';
            case 'needs_repair': return 'error';
            default: return 'default';
        }
    };

    const filteredRooms = rooms.filter(room => {
        const matchesSearch = room.roomNumber?.toString().includes(searchTerm) ||
            room.blockName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBlock = filterBlock === 'All' || room.blockName === filterBlock;
        return matchesSearch && matchesBlock;
    });

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Room Management
                </Typography>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<People />}
                        onClick={handleRandomAllocate}
                        sx={{ mr: 2 }}
                    >
                        Random Allocation
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                    >
                        Add Room
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ mb: 4, p: 2, display: 'flex', gap: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search by Room Number..."
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
                <TextField
                    select
                    label="Block"
                    value={filterBlock}
                    onChange={(e) => setFilterBlock(e.target.value)}
                    size="small"
                    sx={{ minWidth: 120 }}
                >
                    {['All', 'A', 'B', 'C', 'D'].map(block => (
                        <MenuItem key={block} value={block}>{block === 'All' ? 'All Blocks' : `Block ${block}`}</MenuItem>
                    ))}
                </TextField>
            </Paper>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {filteredRooms.map((room) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={room.id}>
                            <Card sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                borderTop: 4,
                                borderColor: getConditionColor(room.condition) + '.main'
                            }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                            Room {room.blockName}-{room.roomNumber}
                                        </Typography>
                                        <Chip
                                            label={room.roomType}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <MeetingRoom sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">
                                            Floor {room.floorNumber}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>Occupancy</Typography>
                                            <Typography variant="caption">{room.currentOccupancy} / {room.capacity}</Typography>
                                        </Box>
                                        <Box sx={{ width: '100%', height: 8, bgcolor: 'divider', borderRadius: 4, overflow: 'hidden' }}>
                                            <Box sx={{
                                                width: `${(room.currentOccupancy / room.capacity) * 100}%`,
                                                height: '100%',
                                                bgcolor: room.currentOccupancy >= room.capacity ? 'error.main' : 'primary.main',
                                                borderRadius: 4
                                            }} />
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                        {room.amenities?.map(amenity => (
                                            <Tooltip key={amenity} title={amenity}>
                                                <Chip
                                                    icon={AMENITIES_OPTIONS.find(a => a.value === amenity)?.icon}
                                                    label={amenity}
                                                    size="small"
                                                    sx={{ fontSize: '0.65rem' }}
                                                />
                                            </Tooltip>
                                        ))}
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                            ₹{room.monthlyRent} <Typography component="span" variant="caption">/mo</Typography>
                                        </Typography>
                                        <Chip
                                            label={room.condition.replace('_', ' ')}
                                            size="small"
                                            color={getConditionColor(room.condition)}
                                        />
                                    </Box>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                                    <Button
                                        size="small"
                                        startIcon={<Add />}
                                        onClick={() => handleOpenAllocation(room)}
                                        disabled={room.currentOccupancy >= room.capacity}
                                    >
                                        Allocate
                                    </Button>
                                    <Box>
                                        <IconButton size="small" onClick={() => handleOpenDialog(room)}>
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(room.id)}
                                            disabled={room.currentOccupancy > 0}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                    {filteredRooms.length === 0 && (
                        <Grid item xs={12}>
                            <Paper sx={{ py: 8, textAlign: 'center' }}>
                                <Typography color="text.secondary">No rooms found matching your criteria.</Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>
                    {selectedRoom ? 'Edit Room' : 'Add New Room'}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Block</InputLabel>
                                <Select
                                    name="blockName"
                                    value={formData.blockName}
                                    onChange={handleInputChange}
                                    label="Block"
                                >
                                    {['A', 'B', 'C', 'D'].map(b => (
                                        <MenuItem key={b} value={b}>{b}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Room Number"
                                name="roomNumber"
                                value={formData.roomNumber}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Floor Number"
                                name="floorNumber"
                                type="number"
                                value={formData.floorNumber}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Monthly Rent"
                                name="monthlyRent"
                                type="number"
                                value={formData.monthlyRent}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Room Type</InputLabel>
                                <Select
                                    name="roomType"
                                    value={formData.roomType}
                                    onChange={handleInputChange}
                                    label="Room Type"
                                >
                                    {ROOM_TYPES.map(type => (
                                        <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Capacity"
                                name="capacity"
                                type="number"
                                value={formData.capacity}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Condition</InputLabel>
                                <Select
                                    name="condition"
                                    value={formData.condition}
                                    onChange={handleInputChange}
                                    label="Condition"
                                >
                                    {ROOM_CONDITIONS.map(cond => (
                                        <MenuItem key={cond} value={cond}>{cond.replace('_', ' ').charAt(0).toUpperCase() + cond.replace('_', ' ').slice(1)}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Amenities</InputLabel>
                                <Select
                                    multiple
                                    value={formData.amenities}
                                    onChange={handleAmenityChange}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={value} size="small" />
                                            ))}
                                        </Box>
                                    )}
                                    label="Amenities"
                                >
                                    {AMENITIES_OPTIONS.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            <Checkbox checked={formData.amenities.indexOf(option.value) > -1} />
                                            <ListItemText primary={option.label} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        {selectedRoom ? 'Update' : 'Add Room'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Allocation Dialog */}
            <Dialog open={allocationDialogOpen} onClose={() => setAllocationDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>Allocate Room {allocatingRoom?.blockName}-{allocatingRoom?.roomNumber}</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Select a student to allocate to this room. Only students without currently assigned rooms are shown.
                    </Typography>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel>Select Student</InputLabel>
                        <Select
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                            label="Select Student"
                        >
                            {studentsWithoutRooms.map((student) => (
                                <MenuItem key={student.id} value={student.id}>
                                    {student.fullName} ({student.enrollmentId})
                                </MenuItem>
                            ))}
                            {studentsWithoutRooms.length === 0 && (
                                <MenuItem disabled>No students available</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setAllocationDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmAllocation}
                        disabled={!selectedStudentId || allocationLoading}
                    >
                        {allocationLoading ? <CircularProgress size={20} color="inherit" /> : 'Confirm Allocation'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Rooms;
