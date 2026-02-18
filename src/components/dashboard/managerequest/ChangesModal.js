import { Box, Chip, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, Grid, Paper, Typography } from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const META_KEYS = new Set([
    'id',
    'masterProductId',
    'updateRequestId',
    'createdAt',
    'updatedAt',
    'isDeleted',
]);

const renderDiffSection = (title, current = {}, proposed = {}) => {
    const keys = new Set([
        ...Object.keys(current || {}),
        ...Object.keys(proposed || {}),
    ]);

    const changes = [...keys].filter(key => {
        if (META_KEYS.has(key)) return false;
        return JSON.stringify(current?.[key]) !== JSON.stringify(proposed?.[key]);
    });

    if (changes.length === 0) return null;

    return (
        <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} color="primary" mb={2}>
                {title}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                        Field Name
                    </Typography>
                </Grid>
                <Grid item xs={4}>
                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                        Current Value
                    </Typography>
                </Grid>
                <Grid item xs={4}>
                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                        Proposed Value
                    </Typography>
                </Grid>
            </Grid>

            <Divider sx={{ my: 1 }} />

            {changes.map((key) => {
                const oldVal = current?.[key];
                const newVal = proposed?.[key];

                return (
                    <Grid container spacing={2} key={key} sx={{ py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                        <Grid item xs={4}>
                            <Typography fontWeight={500}>
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography color="text.secondary">
                                {String(oldVal ?? '-')}
                            </Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <ArrowForwardIcon fontSize="small" color="primary" />
                                <Chip 
                                    label={String(newVal ?? '-')} 
                                    color="warning" 
                                    size="small"
                                    sx={{ fontWeight: 500 }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                );
            })}
        </Paper>
    );
};

const renderProductFieldsDiff = (current = [], proposed = []) => {
    const currentMap = new Map(current?.map(s => [s.sectionKey, s]));
    const proposedMap = new Map(proposed?.map(s => [s.sectionKey, s]));

    const removed = current?.filter(
        s => !proposedMap.has(s.sectionKey)
    );

    const addedOrModified = proposed?.filter(p => {
        const old = currentMap?.get(p.sectionKey);
        return !old || JSON.stringify(old) !== JSON.stringify(p);
    });

    if (removed?.length === 0 && addedOrModified?.length === 0) {
        return null;
    }

    return (
        <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} color="primary" mb={2}>
                Product Fields
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {addedOrModified?.map(s => (
                <Box 
                    key={s.sectionKey} 
                    p={2} 
                    mb={1.5} 
                    sx={{ 
                        background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                        borderRadius: 2,
                        border: '1px solid #81C784'
                    }}
                >
                    <Typography fontWeight={500}>
                        ✓ {currentMap.has(s.sectionKey) ? 'Modified' : 'Added'}: {s.title}
                    </Typography>
                </Box>
            ))}

            {removed?.map(s => (
                <Box 
                    key={s.sectionKey} 
                    p={2} 
                    mb={1.5} 
                    sx={{ 
                        background: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
                        borderRadius: 2,
                        border: '1px solid #E57373'
                    }}
                >
                    <Typography fontWeight={500}>
                        ✗ Removed: {s.title}
                    </Typography>
                </Box>
            ))}
        </Paper>
    );
};


const ChangesModal = ({ open, onClose, data, loading }) => (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600 }}>
            Proposed Changes Review
        </DialogTitle>

        <DialogContent dividers sx={{ bgcolor: '#fafafa', p: 3 }}>
            {loading ? (
                <Box display="flex" justifyContent="center" p={5}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {renderDiffSection(
                        'Basic Details',
                        data?.currentData?.basic,
                        data?.proposedData?.basic
                    )}

                    {renderDiffSection(
                        'Financial Terms',
                        data?.currentData?.financialTerms,
                        data?.proposedData?.financialTerms
                    )}

                    {renderDiffSection(
                        'Eligibility Criteria',
                        data?.currentData?.eligibilityCriteria,
                        data?.proposedData?.eligibilityCriteria
                    )}

                    {renderDiffSection(
                        'Other Charges',
                        data?.currentData?.otherCharges,
                        data?.proposedData?.otherCharges
                    )}

                    {!data?.currentData && !data?.proposedData && (
                        <Typography textAlign="center" color="text.secondary" py={5}>
                            No changes detected
                        </Typography>
                    )}
                </>
            )}
        </DialogContent>
    </Dialog>
);

export default ChangesModal;
