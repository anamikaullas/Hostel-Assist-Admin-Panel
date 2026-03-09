import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Button,
    TextField,
    MenuItem,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Divider,
    Switch,
    FormControlLabel,
    Alert,
    Snackbar,
    Avatar,
    Chip
} from '@mui/material';
import {
    Send,
    NotificationsActive,
    History,
    Groups,
    Person,
    Campaign
} from '@mui/icons-material';
import {
    collection,
    getDocs,
    setDoc,
    addDoc,
    doc,
    query,
    orderBy,
    limit,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

const NotificationSystem = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sendLoading, setSendLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [formData, setFormData] = useState({
        title: '',
        message: '',
        targetType: 'all', // all, year, block, individual
        targetValue: '',
        isPush: true
    });

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(10));
            const snapshot = await getDocs(q);
            setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        setSendLoading(true);
        try {
            const newDocRef = doc(collection(db, 'notifications'));
            await setDoc(newDocRef, {
                ...formData,
                notificationId: newDocRef.id,
                createdAt: serverTimestamp(),
                sentBy: 'Admin'
            });

            setSnackbar({ open: true, message: 'Notification sent successfully!', severity: 'success' });
            setFormData({ title: '', message: '', targetType: 'all', targetValue: '', isPush: true });
            fetchHistory();
        } catch (error) {
            setSnackbar({ open: true, message: 'Failed to send notification.', severity: 'error' });
        } finally {
            setSendLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
                Notifications & Broadcast
            </Typography>

            <Grid container spacing={4}>
                {/* Send Notification Form */}
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 4, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Campaign sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>Create New Announcement</Typography>
                        </Box>

                        <form onSubmit={handleSend}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Title"
                                        placeholder="e.g., Mess Fee Reminder"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        label="Message Content"
                                        placeholder="Type your message here..."
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Target Audience"
                                        value={formData.targetType}
                                        onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                                    >
                                        <MenuItem value="all">All Students</MenuItem>
                                        <MenuItem value="year">Specific Year</MenuItem>
                                        <MenuItem value="block">Specific Block</MenuItem>
                                        <MenuItem value="individual">Individual Student</MenuItem>
                                    </TextField>
                                </Grid>

                                {formData.targetType !== 'all' && (
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label={formData.targetType === 'year' ? 'Year (1-4)' : (formData.targetType === 'block' ? 'Block (A-D)' : 'Student UID')}
                                            value={formData.targetValue}
                                            onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                                            required
                                        />
                                    </Grid>
                                )}

                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.isPush}
                                                onChange={(e) => setFormData({ ...formData, isPush: e.target.checked })}
                                            />
                                        }
                                        label="Send as Push Notification (Mobile App)"
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        startIcon={sendLoading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                                        disabled={sendLoading}
                                        sx={{ px: 4 }}
                                    >
                                        Broadcast Message
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Grid>

                {/* Recent History */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 4, borderRadius: 3, height: '100%', maxHeight: 600, overflowY: 'auto' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <History sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>Sent History</Typography>
                        </Box>

                        <List>
                            {loading ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
                            ) : history.map((item, idx) => (
                                <React.Fragment key={item.id}>
                                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{item.title}</Typography>
                                                    <Chip
                                                        label={item.targetType}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ height: 16, fontSize: '0.6rem' }}
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="body2" color="text.secondary" sx={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {item.message}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                                        Sent: {item.createdAt?.toDate().toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {idx < history.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                            {!loading && history.length === 0 && (
                                <Typography align="center" color="text.secondary" sx={{ py: 4 }}>No history found.</Typography>
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default NotificationSystem;
