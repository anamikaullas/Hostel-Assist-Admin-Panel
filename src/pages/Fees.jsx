import React, { useState, useEffect } from "react";
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
  Grid,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Avatar,
  Autocomplete,
} from "@mui/material";
import {
  Search,
  FilterList,
  Add,
  Download,
  AccountBalanceWallet,
  TrendingUp,
  ReportProblem,
  CheckCircle,
  MoreVert,
  Pending,
} from "@mui/icons-material";
import {
  collection,
  getDocs,
  setDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const FEE_TYPES = ["room_rent", "mess_fee", "maintenance", "other"];

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [summary, setSummary] = useState({
    total: 0,
    collected: 0,
    pending: 0,
    overdue: 0,
  });
  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    amount: 0,
    feeType: "room_rent",
    dueDate: "",
    status: "pending",
  });

  useEffect(() => {
    fetchFees();
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const q = query(collection(db, "users"), where("role", "==", "student"));
      const snapshot = await getDocs(q);
      setStudents(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchFees = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "fees"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const feeList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFees(feeList);

      // Calculate Summary
      let total = 0,
        collected = 0,
        pending = 0,
        overdue = 0;
      const now = new Date();

      feeList.forEach((fee) => {
        total += fee.amount;
        if (fee.status === "paid") collected += fee.amount;
        else if (fee.dueDate?.toDate() < now) {
          overdue += fee.amount;
          pending += fee.amount;
        } else {
          pending += fee.amount;
        }
      });

      setSummary({ total, collected, pending, overdue });
    } catch (error) {
      console.error("Error fetching fees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      studentId: "",
      studentName: "",
      amount: 0,
      feeType: "room_rent",
      dueDate: "",
      status: "pending",
    });
    setOpenDialog(true);
  };

  const handleStudentSelect = (student) => {
    if (student) {
      setFormData((prev) => ({
        ...prev,
        studentId: student.uid || student.id,
        studentName: student.fullName || "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, studentId: "", studentName: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.studentId || !formData.studentName) {
      alert("Please select a student");
      return;
    }
    if (!formData.amount || formData.amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (!formData.dueDate) {
      alert("Please select a due date");
      return;
    }
    try {
      const newDocRef = doc(collection(db, "fees"));
      await setDoc(newDocRef, {
        ...formData,
        feeId: newDocRef.id,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setOpenDialog(false);
      fetchFees();
    } catch (error) {
      console.error("Error adding fee:", error);
    }
  };

  const markAsPaid = async (feeId) => {
    try {
      await updateDoc(doc(db, "fees", feeId), {
        status: "paid",
        paidDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      fetchFees();
    } catch (error) {
      console.error("Error updating fee status:", error);
    }
  };

  const getStatusColor = (status, dueDate) => {
    if (status === "paid") return "success";
    if (dueDate?.toDate() < new Date()) return "error";
    return "warning";
  };

  const filteredFees = fees.filter((f) => {
    const matchesSearch = f.studentName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (tabValue === 0) return matchesSearch;
    if (tabValue === 1) return matchesSearch && f.status === "paid";
    if (tabValue === 2)
      return (
        matchesSearch &&
        f.status === "pending" &&
        f.dueDate?.toDate() >= new Date()
      );
    if (tabValue === 3)
      return (
        matchesSearch &&
        f.status === "pending" &&
        f.dueDate?.toDate() < new Date()
      );
    return matchesSearch;
  });

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Fee Management
        </Typography>
        <Box>
          <Button variant="outlined" startIcon={<Download />} sx={{ mr: 2 }}>
            Export Report
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenDialog}
          >
            New Fee Entry
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            title: "Total Revenue",
            value: summary.total,
            icon: <AccountBalanceWallet />,
            color: "primary",
          },
          {
            title: "Collected",
            value: summary.collected,
            icon: <CheckCircle />,
            color: "success",
          },
          {
            title: "Pending",
            value: summary.pending,
            icon: <Pending color="action" />,
            color: "warning",
          },
          {
            title: "Overdue",
            value: summary.overdue,
            icon: <ReportProblem />,
            color: "error",
          },
        ].map((item, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card>
              <CardContent sx={{ display: "flex", alignItems: "center" }}>
                <Avatar sx={{ bgcolor: `${item.color}.light`, mr: 2 }}>
                  {item.icon}
                </Avatar>
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    {item.title}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    ₹{item.value.toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ mb: 2 }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="All Entries" />
            <Tab label="Paid" />
            <Tab label="Pending" />
            <Tab label="Overdue" />
          </Tabs>
          <TextField
            placeholder="Search student..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250 }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : (
                filteredFees
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((fee) => (
                    <TableRow key={fee.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              mr: 1.5,
                              bgcolor: "primary.main",
                              fontSize: "0.85rem",
                            }}
                          >
                            {fee.studentName?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {fee.studentName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {fee.studentId?.slice(0, 10)}…
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ textTransform: "capitalize" }}>
                        {fee.feeType.replace("_", " ")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        ₹{fee.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {fee.dueDate?.toDate().toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            fee.status === "paid"
                              ? "Paid"
                              : fee.dueDate?.toDate() < new Date()
                                ? "Overdue"
                                : "Pending"
                          }
                          size="small"
                          color={getStatusColor(fee.status, fee.dueDate)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {fee.status !== "paid" ? (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => markAsPaid(fee.id)}
                          >
                            Mark Paid
                          </Button>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Paid on{" "}
                            {fee.paidDate?.toDate().toLocaleDateString()}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
              )}
              {!loading && filteredFees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    No fee entries found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredFees.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, p) => setPage(p)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(+e.target.value);
              setPage(0);
            }}
          />
        </TableContainer>
      </Paper>

      {/* Add Fee Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Create Fee Entry</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Student picker — searchable dropdown */}
            <Grid item xs={12} width="100%">
              <Autocomplete
                options={students}
                getOptionLabel={(s) =>
                  `${s.fullName} (${s.enrollmentId || s.email})`
                }
                onChange={(_, value) => handleStudentSelect(value)}
                componentsProps={{ popper: { style: { width: 280 } } }}
                renderOption={(props, s) => (
                  <li {...props} key={s.id}>
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        mr: 1.5,
                        bgcolor: "primary.main",
                        fontSize: "0.75rem",
                      }}
                    >
                      {s.fullName?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">{s.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {s.enrollmentId || s.email}
                      </Typography>
                    </Box>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField fullWidth {...params} label="Select Student" required />
                )}
                noOptionsText="No students found"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Fee Type"
                value={formData.feeType}
                onChange={(e) =>
                  setFormData({ ...formData, feeType: e.target.value })
                }
              >
                {FEE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Amount (₹)"
                value={formData.amount || ""}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number(e.target.value) })
                }
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Due Date"
                InputLabelProps={{ shrink: true }}
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Create Entry
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Fees;
