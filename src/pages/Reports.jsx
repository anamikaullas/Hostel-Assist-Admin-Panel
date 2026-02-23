import React, { useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip
} from '@mui/material';
import {
    PictureAsPdf,
    TableChart,
    Feed,
    DateRange,
    FilterAlt,
    CloudDownload,
    BarChart,
    PieChart as PieChartIcon
} from '@mui/icons-material';

const REPORTS = [
    { id: 1, title: 'Student Enrollment Report', category: 'Students', icon: <Feed /> },
    { id: 2, title: 'Room Occupancy Ledger', category: 'Rooms', icon: <TableChart /> },
    { id: 3, title: 'Fee Collection Summary', category: 'Finance', icon: <BarChart /> },
    { id: 4, title: 'Complaint Resolution Analytics', category: 'Management', icon: <PieChartIcon /> },
    { id: 5, title: 'Mess Feedback Trends', category: 'Mess', icon: <DateRange /> }
];

const Reports = () => {
    const [reportType, setReportType] = useState('');
    const [dateRange, setDateRange] = useState('monthly');

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
                Reports & Data Export
            </Typography>

            <Grid container spacing={3}>
                {/* Report Generator */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 4, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Custom Report Builder</Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Data Source</InputLabel>
                                    <Select
                                        value={reportType}
                                        onChange={(e) => setReportType(e.target.value)}
                                        label="Data Source"
                                    >
                                        <MenuItem value="students">Students Database</MenuItem>
                                        <MenuItem value="rooms">Room Inventory</MenuItem>
                                        <MenuItem value="fees">Financial Transactions</MenuItem>
                                        <MenuItem value="complaints">Complaint Logs</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Date Range</InputLabel>
                                    <Select
                                        value={dateRange}
                                        onChange={(e) => setDateRange(e.target.value)}
                                        label="Date Range"
                                    >
                                        <MenuItem value="daily">Today</MenuItem>
                                        <MenuItem value="weekly">Last 7 Days</MenuItem>
                                        <MenuItem value="monthly">This Month</MenuItem>
                                        <MenuItem value="yearly">Financial Year</MenuItem>
                                        <MenuItem value="custom">Custom Range</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {dateRange === 'custom' && (
                                <>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth type="date" label="Start Date" InputLabelProps={{ shrink: true }} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth type="date" label="End Date" InputLabelProps={{ shrink: true }} />
                                    </Grid>
                                </>
                            )}

                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="subtitle2" sx={{ mb: 2 }}>Export Formats</Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button variant="outlined" startIcon={<PictureAsPdf />}>PDF</Button>
                                    <Button variant="outlined" startIcon={<TableChart />}>Excel</Button>
                                    <Button variant="outlined">CSV</Button>
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    startIcon={<CloudDownload />}
                                    sx={{ mt: 2 }}
                                >
                                    Generate & Download
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Pre-built Reports */}
                <Grid item xs={12} md={7}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Pre-configured Reports</Typography>
                    <Grid container spacing={2}>
                        {REPORTS.map((report) => (
                            <Grid item xs={12} key={report.id}>
                                <Card variant="outlined" sx={{ '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.02)', borderColor: 'primary.main' }, cursor: 'pointer' }}>
                                    <CardContent sx={{ display: 'flex', alignItems: 'center', p: '16px !important' }}>
                                        <Avatar sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)', color: 'primary.main', mr: 2 }}>
                                            {report.icon}
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{report.title}</Typography>
                                            <Typography variant="caption" color="text.secondary">{report.category}</Typography>
                                        </Box>
                                        <Chip label="Ready" size="small" color="success" variant="outlined" />
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <Paper sx={{ mt: 4, p: 3, bgcolor: 'primary.main', color: 'white' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>Periodic Auto-Reports</Typography>
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                    Schedule weekly data backups and performance summaries to your email.
                                </Typography>
                            </Box>
                            <Button variant="contained" sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f0f0f0' } }}>
                                Configure
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Reports;
