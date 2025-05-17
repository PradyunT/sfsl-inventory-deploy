import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Modal,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// modalStyle remains the same
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: 800,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 0,
  borderRadius: 1,
  maxHeight: '90vh',
  display: 'flex',
  outline: 'none',
};

// InventoryLog component structure remains the same
const InventoryLog = ({ open, setLogOpen, editLogs }) => {
  const [logType, setLogType] = useState("edit");
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!editLogs) return;
    console.log("editLogs", editLogs);

    const filteredLogs = logType === "edit"
      ? editLogs.filter((log) => !log.restock)
      : editLogs.filter((log) => log.restock);

    setLogs(filteredLogs);
  }, [editLogs, logType]);

  useEffect(() => {
    if (open) {
      setLogType('edit');
    }
  }, [open]);


  const handleTabChange = (event, newValue) => {
    setLogType(newValue);
  };

  return (
    <Modal
      open={open}
      onClose={() => setLogOpen(false)}
      aria-labelledby="inventory-log-modal"
      aria-describedby="inventory-logs-history"
    >
      <Box sx={modalStyle}>
        <Paper elevation={0} sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          // Add overflow hidden to Paper to ensure it respects modal bounds
          overflow: 'hidden',
        }}>
          {/* Header Box */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: '#2D3621',
            color: 'white',
            px: 2,
            flexShrink: 0
          }}>
            <Tabs
              value={logType}
              onChange={handleTabChange}
              textColor="inherit"
              indicatorColor="secondary"
              sx={{ minHeight: '48px' }}
            >
              <Tab label="Edit History" value="edit" sx={{minHeight: '48px'}}/>
              <Tab label="Restock History" value="restock" sx={{minHeight: '48px'}}/>
            </Tabs>
            <Button
              onClick={() => setLogOpen(false)}
              color="inherit"
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <CloseIcon />
            </Button>
          </Box>

          {/* Content Box (Scrollable Area) */}
          <Box sx={{
            // Keep padding inside the scrollable area
            // but apply overflow outside the padding
            flexGrow: 1,
            overflowY: 'auto',
            minHeight: 0,
            p: 2, // Apply padding here
          }}>
            {/* The content inside will now scroll */}
            {logType === "edit" ? (
              <EditLogTable logs={logs} />
            ) : (
              <RestockLogTable logs={logs} />
            )}
          </Box>
        </Paper>
      </Box>
    </Modal>
  );
};


// --- EditLogTable ---
const EditLogTable = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return <Typography variant="body1" sx={{p: 0}}>No edit logs available.</Typography>; // Padding is handled by parent Box
  }

  return (
    // Outer TableContainer is needed for stickyHeader relative to the scrolling Box
    <TableContainer component={Paper} elevation={0} sx={{ border: 'none' }}>
      <Table stickyHeader aria-label="Edit history table" size="small">
        <TableHead sx={{ backgroundColor: "#F1F1F1" }}>
          <TableRow>
            <TableCell sx={{ width: '20%' }}>Editor</TableCell> {/* Optional: Suggest widths */}
            <TableCell sx={{ width: '20%' }}>Date</TableCell>
            <TableCell sx={{ width: '60%' }}>Changes</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log._id || log.id}>
              <TableCell sx={{ verticalAlign: 'top' }}>
                <Typography variant="body2">{log.editor || log.name}</Typography>
              </TableCell>
              <TableCell sx={{ verticalAlign: 'top' }}>
                <Typography variant="body2">
                  {log.purchaseDate ? new Date(log.purchaseDate).toLocaleDateString() : 'N/A'}
                </Typography>
              </TableCell>
              <TableCell sx={{ verticalAlign: 'top', p: 0.5 }}> {/* Add padding to cell if needed */}
                {/* --- CHANGE: Removed inner TableContainer --- */}
                <Table size="small" sx={{ tableLayout: 'fixed' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'medium', borderBottom: 'none', p: 0.5 }}>Item</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'medium', borderBottom: 'none', p: 0.5 }}>Before</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'medium', borderBottom: 'none', p: 0.5 }}>After</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {log.prevItem && log.newItem ? (
                      <TableRow>
                        <TableCell sx={{ wordBreak: 'break-word', borderBottom: 'none', p: 0.5 }}>
                          {log.prevItem.name}
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: 'none', p: 0.5 }}>
                          {log.prevItem.currentQuantity}
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: 'none', p: 0.5 }}>
                          {log.newItem.currentQuantity}
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} sx={{ borderBottom: 'none', p: 0.5 }}>Log data incomplete</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {/* --- End CHANGE --- */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};


// --- RestockLogTable ---
const RestockLogTable = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return <Typography variant="body1" sx={{p: 0}}>No restock logs available.</Typography>; // Padding is handled by parent Box
  }

  return (
    // Outer TableContainer is needed for stickyHeader relative to the scrolling Box
    <TableContainer component={Paper} elevation={0} sx={{ border: 'none' }}>
      <Table stickyHeader aria-label="Restock history table" size="small">
        <TableHead sx={{ backgroundColor: "#F1F1F1" }}>
          <TableRow>
            <TableCell sx={{ width: '20%' }}>Editor</TableCell> {/* Optional: Suggest widths */}
            <TableCell sx={{ width: '20%' }}>Restock Date</TableCell>
            <TableCell sx={{ width: '60%' }}>Quantity Changes</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log._id || log.id}>
              <TableCell sx={{ verticalAlign: 'top' }}>
                <Typography variant="body2">{log.editor || log.name}</Typography>
              </TableCell>
              <TableCell sx={{ verticalAlign: 'top' }}>
                <Typography variant="body2">
                  {log.purchaseDate ? new Date(log.purchaseDate).toLocaleDateString() : 'N/A'}
                </Typography>
              </TableCell>
              <TableCell sx={{ verticalAlign: 'top', p: 0.5 }}> {/* Add padding to cell if needed */}
                <Table size="small" sx={{ tableLayout: 'fixed' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'medium', borderBottom: 'none', p: 0.5 }}>Item</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'medium', borderBottom: 'none', p: 0.5 }}>Before</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'medium', borderBottom: 'none', p: 0.5 }}>After</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {log.prevItem && log.newItem ? (
                      <TableRow>
                        <TableCell sx={{ wordBreak: 'break-word', borderBottom: 'none', p: 0.5 }}>
                          {log.prevItem.name}
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: 'none', p: 0.5 }}>
                          {log.prevItem.currentQuantity}
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: 'none', p: 0.5 }}>
                          {log.newItem.currentQuantity}
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} sx={{ borderBottom: 'none', p: 0.5 }}>Log data incomplete</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};


export default InventoryLog;