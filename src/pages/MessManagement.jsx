import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    IconButton,
    Button,
    TextField,
    MenuItem,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    Avatar,
    Divider,
    Rating
} from '@mui/material';
import {
    Add,
    Restaurant,
    Delete,
    Edit,
    ContentCopy,
    Star,
    ThumbUp,
    ThumbDown,
    CalendarMonth
} from '@mui/icons-material';
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    query,
    where,
    orderBy,
    limit
} from 'firebase/firestore';
import { db } from '../firebase';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

const MessManagement = () => {
    const [menu, setMenu] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        breakfast: '',
        lunch: '',
        dinner: '',
        remarks: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Recent Menus
            const qMenu = query(collection(db, 'mess_menu'), orderBy('date', 'desc'), limit(7));
            const snapshotMenu = await getDocs(qMenu);
            setMenu(snapshotMenu.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            // Fetch Recent Feedback
            const qFeedback = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'), limit(10));
            const snapshotFeedback = await getDocs(qFeedback);
            setFeedback(snapshotFeedback.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching mess data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (item = null) => {
        if (item) {
            setSelectedMenu(item);
            setFormData({
                date: item.date?.toDate().toISOString().split('T')[0],
                breakfast: item.breakfast?.join(', ') || '',
                lunch: item.lunch?.join(', ') || '',
                dinner: item.dinner?.join(', ') || '',
                remarks: item.remarks || ''
            });
        } else {
            setSelectedMenu(null);
            setFormData({
                date: new Date().toISOString().split('T')[0],
                breakfast: '',
                lunch: '',
                dinner: '',
                remarks: ''
            });
        }
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                date: new Date(formData.date),
                breakfast: formData.breakfast.split(',').map(i => i.trim()),
                lunch: formData.lunch.split(',').map(i => i.trim()),
                dinner: formData.dinner.split(',').map(i => i.trim()),
                remarks: formData.remarks,
                updatedAt: new Date()
            };

            if (selectedMenu) {
                await updateDoc(doc(db, 'mess_menu', selectedMenu.id), payload);
            } else {
                await addDoc(collection(db, 'mess_menu'), { ...payload, createdAt: new Date() });
            }
            setOpenDialog(false);
            fetchData();
        } catch (error) {
            console.error("Error saving menu:", error);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Mess Management
                </Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
                    Add Daily Menu
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Menu Management Section */}
                <Grid item xs={12} lg={8}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Weekly Menu Overview</Typography>
                    <Grid container spacing={2}>
                        {loading ? (
                            <Grid item xs={12} sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Grid>
                        ) : menu.map((item) => (
                            <Grid item xs={12} md={6} key={item.id}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <CalendarMonth sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                    {item.date?.toDate().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                                </Typography>
                                            </Box>
                                            <IconButton size="small" onClick={() => handleOpenDialog(item)}><Edit fontSize="small" /></IconButton>
                                        </Box>

                                        <Box sx={{ mb: 1 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>Breakfast</Typography>
                                            <Typography variant="body2">{item.breakfast?.join(', ')}</Typography>
                                        </Box>
                                        <Box sx={{ mb: 1 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>Lunch</Typography>
                                            <Typography variant="body2">{item.lunch?.join(', ')}</Typography>
                                        </Box>
                                        <Box sx={{ mb: 1 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>Dinner</Typography>
                                            <Typography variant="body2">{item.dinner?.join(', ')}</Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                        {menu.length === 0 && !loading && (
                            <Grid item xs={12}>
                                <Paper sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography color="text.secondary">No menus scheduled. Start by adding one!</Typography>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                </Grid>

                {/* Feedback Section */}
                <Grid item xs={12} lg={4}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Recent Feedback</Typography>
                    <Paper sx={{ p: 2, maxHeight: 600, overflowY: 'auto' }}>
                        <List>
                            {feedback.map((f, idx) => (
                                <React.Fragment key={f.id}>
                                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="subtitle2">{f.studentName}</Typography>
                                                    <Rating value={f.rating} readOnly size="small" />
                                                </Box>
                                            }
                                            secondary={
                                                <Box sx={{ mt: 1 }}>
                                                    <Chip label={f.mealType} size="small" sx={{ height: 16, fontSize: '0.6rem', mb: 1 }} />
                                                    <Typography variant="body2" color="text.primary">{f.comment || 'No comment'}</Typography>
                                                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                        {f.likedItems?.slice(0, 2).map(i => <Chip key={i} icon={<ThumbUp fontSize="small" />} label={i} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />)}
                                                        {f.dislikedItems?.slice(0, 2).map(i => <Chip key={i} icon={<ThumbDown fontSize="small" />} label={i} size="small" variant="outlined" color="error" sx={{ fontSize: '0.65rem' }} />)}
                                                    </Box>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                                        {f.createdAt?.toDate().toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {idx < feedback.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                            {feedback.length === 0 && !loading && (
                                <Typography align="center" color="text.secondary" sx={{ py: 4 }}>No feedback yet.</Typography>
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>

            {/* Add Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>{selectedMenu ? 'Edit Menu' : 'Add Daily Menu'}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Date"
                                name="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Breakfast Items (comma separated)"
                                placeholder="Idly, Sambar, Chutney, Coffee"
                                value={formData.breakfast}
                                onChange={(e) => setFormData({ ...formData, breakfast: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Lunch Items (comma separated)"
                                placeholder="Rice, Dal, Veg Curry, Curd"
                                value={formData.lunch}
                                onChange={(e) => setFormData({ ...formData, lunch: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Dinner Items (comma separated)"
                                placeholder="Chapati, Paneer Curry, Salads"
                                value={formData.dinner}
                                onChange={(e) => setFormData({ ...formData, dinner: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Special Remarks"
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>Save Menu</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MessManagement;
