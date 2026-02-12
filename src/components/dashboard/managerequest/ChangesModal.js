import { Box, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, Grid, Typography } from "@mui/material";

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

    return (
        <Box mb={3}>
            <Typography variant="h6" mb={1}>{title}</Typography>
            <Divider sx={{ mb: 2 }} />

            {[...keys].map((key) => {
                if (META_KEYS.has(key)) return null;

                const oldVal = current?.[key];
                const newVal = proposed?.[key];

                if (JSON.stringify(oldVal) === JSON.stringify(newVal)) return null;

                return (
                    <Grid container spacing={2} key={key} mb={1}>
                        <Grid item xs={3}>
                            <Typography fontWeight={600}>{key}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography>{String(oldVal ?? '-')}</Typography>
                        </Grid>
                        <Grid item xs={5}>
                            <Typography sx={{ backgroundColor: '#FFF3CD', p: 1, borderRadius: 1 }}>
                                {String(newVal ?? '-')}
                            </Typography>
                        </Grid>
                    </Grid>
                );
            })}
        </Box>
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
        return <Typography>No product field changes</Typography>;
    }

    return (
        <Box mb={3}>
            <Typography variant="h6">Product Fields</Typography>
            <Divider sx={{ mb: 2 }} />

            {addedOrModified?.map(s => (
                <Box key={s.sectionKey} p={2} mb={1} sx={{ background: '#E6FFFA' }}>
                    <Typography>➕ Added / ✏️ Modified: {s.title}</Typography>
                </Box>
            ))}

            {removed?.map(s => (
                <Box key={s.sectionKey} p={2} mb={1} sx={{ background: '#FFE6E6' }}>
                    <Typography>❌ Removed: {s.title}</Typography>
                </Box>
            ))}
        </Box>
    );
};


const ChangesModal = ({ open, onClose, data, loading }) => (


    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>Proposed Changes</DialogTitle>

        <DialogContent dividers>
            {loading ? (
                <CircularProgress />
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
                        'Credit Bureau Config',
                        data?.currentData?.creditBureauConfig,
                        data?.proposedData?.creditBureauConfig
                    )}

                    {renderDiffSection(
                        'Other Charges',
                        data?.currentData?.otherCharges,
                        data?.proposedData?.otherCharges
                    )}

                    {renderProductFieldsDiff(
                        data?.currentData?.productFields?.fieldsJsonData,
                        data?.proposedData?.productFields?.fieldsJsonData
                    )}


                </>
            )}
        </DialogContent>
    </Dialog>
);

export default ChangesModal;
