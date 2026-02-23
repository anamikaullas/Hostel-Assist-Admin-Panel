import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Divider,
    Chip
} from '@mui/material';
import {
    Users,
    Home,
    AlertTriangle,
    Wallet,
    Star,
    TrendingUp
} from 'lucide-react';
import {
    collection,
    query,
    where,
    getDocs,
    limit,
    orderBy,
    onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

const StatCard = ({ title, value, icon, color, loading }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="overline" color="text.secondary" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {loading ? <CircularProgress size={24} /> : value}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: `${color}15`,
                        color: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {icon}
                </Box>
            </Box>
        </CardContent>
        <Box sx={{ height: 4, bgcolor: color }} />
    </Card>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalRooms: 0,
        availableRooms: 0,
        pendingComplaints: 0,
        feeCollectionRate: 0,
        avgFeedback: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentActivities, setRecentActivities] = useState([]);
    const [complaintStats, setComplaintStats] = useState({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Total Students
                const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
                const studentsSnapshot = await getDocs(studentsQuery);

                // Total Rooms & Availability
                const roomsQuery = collection(db, 'rooms');
                const roomsSnapshot = await getDocs(roomsQuery);
                let availableCount = 0;
                roomsSnapshot.forEach(doc => {
                    if (doc.data().currentOccupancy < doc.data().capacity) {
                        availableCount++;
                    }
                });

                // Pending Complaints
                const complaintsQuery = query(collection(db, 'complaints'), where('status', '==', 'pending'));
                const complaintsSnapshot = await getDocs(complaintsQuery);

                // Feedback Average
                const feedbackQuery = collection(db, 'feedback');
                const feedbackSnapshot = await getDocs(feedbackQuery);
                let totalRating = 0;
                feedbackSnapshot.forEach(doc => totalRating += doc.data().rating);
                const avgRating = feedbackSnapshot.size > 0 ? (totalRating / feedbackSnapshot.size).toFixed(1) : 0;

                setStats({
                    totalStudents: studentsSnapshot.size,
                    totalRooms: roomsSnapshot.size,
                    availableRooms: availableCount,
                    pendingComplaints: complaintsSnapshot.size,
                    feeCollectionRate: 85, // Placeholder/Calculated from backend
                    avgFeedback: avgRating
                });

                // Recently Complaints for Activities
                const recentComplaintsQuery = query(
                    collection(db, 'complaints'),
                    orderBy('createdAt', 'desc'),
                    limit(5)
                );
                const recentSnapshot = await getDocs(recentComplaintsQuery);
                const activities = recentSnapshot.docs.map(doc => ({
                    id: doc.id,
                    type: 'complaint',
                    title: `New complaint from ${doc.data().studentName}`,
                    time: doc.data().createdAt?.toDate().toLocaleString() || 'Just now',
                    status: doc.data().status
                }));
                setRecentActivities(activities);

                // Complaint Category Stats
                const categories = {};
                const allComplaints = await getDocs(collection(db, 'complaints'));
                allComplaints.forEach(doc => {
                    const cat = doc.data().category || 'Other';
                    categories[cat] = (categories[cat] || 0) + 1;
                });

                setComplaintStats({
                    labels: Object.keys(categories),
                    datasets: [{
                        data: Object.values(categories),
                        backgroundColor: [
                            '#1976D2', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#00BCD4'
                        ],
                    }]
                });

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Set up real-time listener for pending complaints count
        const unsubscribe = onSnapshot(
            query(collection(db, 'complaints'), where('status', '==', 'pending')),
            (snapshot) => {
                setStats(prev => ({ ...prev, pendingComplaints: snapshot.size }));
            }
        );

        return () => unsubscribe();
    }, []);

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
                Dashboard Overview
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <StatCard
                        title="Students"
                        value={stats.totalStudents}
                        icon={<Users size={20} />}
                        color="#1976D2"
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <StatCard
                        title="Rooms (Avail)"
                        value={`${stats.availableRooms}/${stats.totalRooms}`}
                        icon={<Home size={20} />}
                        color="#4CAF50"
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <StatCard
                        title="Pending Actions"
                        value={stats.pendingComplaints}
                        icon={<AlertTriangle size={20} />}
                        color="#F44336"
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <StatCard
                        title="Fees Collected"
                        value={`${stats.feeCollectionRate}%`}
                        icon={<Wallet size={20} />}
                        color="#FF9800"
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <StatCard
                        title="Mess Rating"
                        value={stats.avgFeedback}
                        icon={<Star size={20} />}
                        color="#9C27B0"
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <StatCard
                        title="Enrollment Growth"
                        value="+12%"
                        icon={<TrendingUp size={20} />}
                        color="#00BCD4"
                        loading={loading}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                            Complaints by Category
                        </Typography>
                        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                            {loading ? (
                                <CircularProgress />
                            ) : (
                                <Pie data={complaintStats} options={{ maintainAspectRatio: false }} />
                            )}
                        </Box>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                            Recent Activities
                        </Typography>
                        <List>
                            {recentActivities.map((activity, index) => (
                                <React.Fragment key={activity.id}>
                                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                        <ListItemText
                                            primary={activity.title}
                                            secondary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {activity.time}
                                                    </Typography>
                                                    <Chip
                                                        label={activity.status}
                                                        size="small"
                                                        color={activity.status === 'pending' ? 'error' : 'success'}
                                                        variant="outlined"
                                                    />
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {index < recentActivities.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                            {recentActivities.length === 0 && !loading && (
                                <Typography variant="body2" color="text.secondary" align="center">
                                    No recent activities found.
                                </Typography>
                            )}
                        </List>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                            Room Occupancy
                        </Typography>
                        {/* Simple Bar Chart for occupancy */}
                        <Box sx={{ height: 400 }}>
                            <Bar
                                data={{
                                    labels: ['Block A', 'Block B', 'Block C', 'Block D'],
                                    datasets: [{
                                        label: 'Occupancy %',
                                        data: [80, 95, 60, 40],
                                        backgroundColor: 'rgba(25, 118, 210, 0.6)'
                                    }]
                                }}
                                options={{
                                    indexAxis: 'y',
                                    maintainAspectRatio: false,
                                    scales: {
                                        x: {
                                            beginAtZero: true,
                                            max: 100
                                        }
                                    }
                                }}
                            />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
