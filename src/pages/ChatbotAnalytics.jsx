import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    CircularProgress,
    TextField,
    InputAdornment,
    MenuItem,
    Chip
} from '@mui/material';
import {
    Search,
    SentimentVerySatisfied,
    SentimentVeryDissatisfied,
    Chat,
    Psychology,
    AutoGraph
} from '@mui/icons-material';
import {
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    count
} from 'firebase/firestore';
import { db } from '../firebase';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const ChatbotAnalytics = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalConversations: 0, accuracy: 92, mostActiveTime: '2 PM' });
    const [intentData, setIntentData] = useState({ labels: [], datasets: [] });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Recent Conversation Logs
            const qLogs = query(collection(db, 'chatbot_logs'), orderBy('timestamp', 'desc'), limit(15));
            const snapshotLogs = await getDocs(qLogs);
            const logList = snapshotLogs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLogs(logList);

            // Simple Intent Stats Mapping
            const intentCounts = {};
            logList.forEach(log => {
                const intent = log.detectedIntent || 'other';
                intentCounts[intent] = (intentCounts[intent] || 0) + 1;
            });

            setIntentData({
                labels: Object.keys(intentCounts).map(i => i.replace('_', ' ')),
                datasets: [{
                    label: 'Intent Hits',
                    data: Object.values(intentCounts),
                    backgroundColor: 'rgba(25, 118, 210, 0.7)',
                    borderRadius: 4
                }]
            });

            setStats(prev => ({ ...prev, totalConversations: logList.length }));
        } catch (error) {
            console.error("Error fetching chatbot logs:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
                Chatbot Analytics & NLP
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                    { title: 'Total Queries', value: stats.totalConversations, icon: <Chat />, color: '#1976D2' },
                    { title: 'Intent Accuracy', value: stats.accuracy + '%', icon: <Psychology />, color: '#4CAF50' },
                    { title: 'Peak Usage', value: stats.mostActiveTime, icon: <AutoGraph />, color: '#9C27B0' }
                ].map((item, idx) => (
                    <Grid item xs={12} md={4} key={idx}>
                        <Card sx={{ bgcolor: 'background.paper' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', py: 3 }}>
                                <Avatar sx={{ bgcolor: `${item.color}20`, color: item.color, mr: 2 }}>{item.icon}</Avatar>
                                <Box>
                                    <Typography variant="overline" color="text.secondary">{item.title}</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{loading ? '...' : item.value}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} lg={7}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Most Frequent Intents</Typography>
                        <Box sx={{ height: 350 }}>
                            <Bar
                                data={intentData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } }
                                }}
                            />
                        </Box>
                    </Paper>

                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ p: 1, fontWeight: 600 }}>Recent Conversations</Typography>
                        <TableContainer sx={{ maxHeight: 500 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Query</TableCell>
                                        <TableCell>Detected Intent</TableCell>
                                        <TableCell>Time</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={3} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                                    ) : logs.map((log) => (
                                        <TableRow key={log.id} hover>
                                            <TableCell sx={{ maxWidth: 300 }}>
                                                <Typography variant="body2" noWrap sx={{ textOverflow: 'ellipsis' }}>{log.message}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={log.detectedIntent?.replace('_', ' ')}
                                                    size="small"
                                                    color={log.detectedIntent === 'other' ? 'default' : 'primary'}
                                                    sx={{ textTransform: 'capitalize' }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                                {log.timestamp?.toDate().toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={5}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>NLP Keywords Explorer</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {['refund', 'slow wifi', 'mess quality', 'late entry', 'broken tap', 'AC issue', 'invoice', 'guest room', 'hot water'].map(word => (
                                <Chip
                                    key={word}
                                    label={word}
                                    clickable
                                    sx={{ bgcolor: 'rgba(0,0,0,0.05)' }}
                                    icon={<SentimentVerySatisfied sx={{ fontSize: '1rem !important' }} />}
                                />
                            ))}
                            {['bad food', 'rude', 'water leak', 'no signal'].map(word => (
                                <Chip
                                    key={word}
                                    label={word}
                                    clickable
                                    sx={{ bgcolor: 'error.light', color: 'white' }}
                                    icon={<SentimentVeryDissatisfied sx={{ fontSize: '1rem !important', color: 'white !important' }} />}
                                />
                            ))}
                        </Box>

                        <Box sx={{ mt: 4 }}>
                            <Typography variant="subtitle2" gutterBottom>Conversation Volume Trend</Typography>
                            <Box sx={{ height: 200 }}>
                                <Line
                                    data={{
                                        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                                        datasets: [{
                                            label: 'Messages',
                                            data: [65, 59, 80, 81, 56, 40, 30],
                                            borderColor: '#1976D2',
                                            tension: 0.4
                                        }]
                                    }}
                                    options={{ maintainAspectRatio: false }}
                                />
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ChatbotAnalytics;
