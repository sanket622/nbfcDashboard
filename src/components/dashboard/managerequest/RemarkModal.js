// src/components/common/RemarkModal.jsx
import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    CircularProgress,
} from '@mui/material';
import axios from 'axios';

const RemarkModal = ({ open, onClose, requestId }) => {
    const [remark, setRemark] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            setLoading(true);


            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/sample/add-remark`, {
                id: requestId,
                remark,
            });

            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add Remark</DialogTitle>

            <DialogContent>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    margin="dense"
                    label="Remark"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    // InputLabelProps={{ shrink: true }}
                    autoFocus
                />


            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    disabled={!remark || loading}
                    onClick={handleSubmit}
                >
                    {loading ? <CircularProgress size={20} /> : 'Submit'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RemarkModal;
