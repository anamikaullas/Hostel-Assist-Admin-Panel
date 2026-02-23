import React, { useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Button,
    TextField,
    Avatar,
    Divider,
    Switch,
    FormControlLabel,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Tab,
    Tabs,
    IconButton
} from '@mui/material';
import {
    Person,
    Security,
    Palette,
    Notifications,
    AppSettingsAlt,
    CloudUpload,
    Edit,
    Save,
    Lock
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const [tabValue, setTabValue] = useState(0);
    const { userData } = useAuth();

    const [profileForm, setProfileForm] = useState({
        fullName: userData?.fullName || 'Admin User',
        email: userData?.email || 'admin@hostel.com',
        phone: userData?.phoneNumber || '+91 9876543210'
    });

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
                System Settings
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                    <Tab icon={<Person fontSize="small" />} iconPosition="start" label="Profile" />
                    <Tab icon={<Security fontSize="small" />} iconPosition="start" label="Security" />
                    <Tab icon={<Palette fontSize="small" />} iconPosition="start" label="Appearance" />
                    <Tab icon={<AppSettingsAlt fontSize="small" />} iconPosition="start" label="System Config" />
                </Tabs>
            </Box>

            <Grid container spacing={3}>
                {tabValue === 0 && (
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: '2rem' }}>
                                        {profileForm.fullName.charAt(0)}
                                    </Avatar>
                                    <IconButton
                                        sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'background.paper', boxShadow: 2 }}
                                        size="small"
                                    >
                                        <CloudUpload fontSize="small" />
                                    </IconButton>
                                </Box>
                                <Box sx={{ ml: 3 }}>
                                    <Typography variant="h6">{profileForm.fullName}</Typography>
                                    <Typography variant="body2" color="text.secondary">Main Administrator</Typography>
                                    <Chip label="Verified" color="success" size="small" sx={{ mt: 1 }} />
                                </Box>
                            </Box>

                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Full Name"
                                        value={profileForm.fullName}
                                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        value={profileForm.email}
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        value={profileForm.phone}
                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button variant="contained" startIcon={<Save />}>Save Changes</Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                )}

                {tabValue === 1 && (
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 4 }}>
                            <Typography variant="h6" sx={{ mb: 3 }}>Login & Security</Typography>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="subtitle2" gutterBottom>Change Password</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}><TextField fullWidth type="password" label="Current Password" /></Grid>
                                    <Grid item xs={12} sm={6}><TextField fullWidth type="password" label="New Password" /></Grid>
                                    <Grid item xs={12} sm={6}><TextField fullWidth type="password" label="Confirm Password" /></Grid>
                                    <Grid item xs={12}><Button variant="outlined" startIcon={<Lock />}>Update Password</Button></Grid>
                                </Grid>
                            </Box>

                            <Divider sx={{ my: 4 }} />
                            <Typography variant="subtitle2" gutterBottom>Two-Factor Authentication</Typography>
                            <FormControlLabel control={<Switch />} label="Enable SMS Authentication" />
                        </Paper>
                    </Grid>
                )}

                {tabValue === 2 && (
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 4 }}>
                            <Typography variant="h6" sx={{ mb: 3 }}>Interface Customization</Typography>
                            <List>
                                <ListItem sx={{ px: 0 }}>
                                    <ListItemText primary="Dark Mode" secondary="Switch between light and dark theme" />
                                    <Switch />
                                </ListItem>
                                <ListItem sx={{ px: 0 }}>
                                    <ListItemText primary="Compact View" secondary="Show more data on the dashboard" />
                                    <Switch />
                                </ListItem>
                                <ListItem sx={{ px: 0 }}>
                                    <ListItemText primary="Sidebar Navigation" secondary="Keep navigation menu expanded" />
                                    <Switch defaultChecked />
                                </ListItem>
                            </List>
                        </Paper>
                    </Grid>
                )}

                {tabValue === 3 && (
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 4 }}>
                            <Typography variant="h6" sx={{ mb: 3 }}>System Constants</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Hostel Name" defaultValue="HostelAssist Elite" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Currency Code" defaultValue="INR (₹)" />
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" sx={{ mb: 2 }}>Maintenance Mode</Typography>
                                    <FormControlLabel control={<Switch color="error" />} label="Enable System Maintenance Mode (Restricts mobile app access)" />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button variant="contained">Update Configuration</Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default Settings;
