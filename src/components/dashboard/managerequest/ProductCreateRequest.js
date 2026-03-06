import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    CircularProgress,
    Grid,
    Typography,
    Divider,
    Button,
    Paper,
    Box
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import ReusableTable from '../../subcompotents/ReusableTable';
import { fetchCreateRequests, handleCreateRequestApproval } from '../../../redux/managerequest/productRequestSlice';
import ActivateModal from './ActivateModal';
import DeleteModal from './DeleteModal';

const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.length ? value.join(', ') : 'N/A';
    if (typeof value === 'object') return JSON.stringify(value);
    return value;
};

const DetailsSection = ({ title, color = 'primary', fields = [] }) => (
    <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} color={color} mb={2}>
            {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
            {fields.map(({ label, value }) => (
                <Grid item xs={12} sm={6} key={label}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography fontWeight={500}>{formatValue(value)}</Typography>
                </Grid>
            ))}
        </Grid>
    </Paper>
);

const ProductCreateRequest = () => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const { createRequests = [], loading = false, error } = useSelector(
        (state) => state.productRequest
    );

    const [viewModal, setViewModal] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [requestDetails, setRequestDetails] = useState(null);
    const [approveModal, setApproveModal] = useState(false);
    const [rejectModal, setRejectModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    useEffect(() => {
        dispatch(fetchCreateRequests());
    }, [dispatch]);

    const openApproveModal = (row) => {
        setSelectedRequest(row);
        setApproveModal(true);
    };

    const openRejectModal = (row) => {
        setSelectedRequest(row);
        setRejectModal(true);
    };

    const handleApprove = () => {
        dispatch(
            handleCreateRequestApproval(
                selectedRequest.id,
                'APPROVE',
                enqueueSnackbar
            )
        );
        setApproveModal(false);
    };

    const handleReject = (reason) => {
        dispatch(
            handleCreateRequestApproval(
                selectedRequest.id,
                'REJECT',
                enqueueSnackbar,
                reason
            )
        );
        setRejectModal(false);
    };


    const openViewDetails = async (row) => {
        try {
            setViewModal(true);
            setDetailsLoading(true);

            const token = localStorage.getItem('accessToken');

            const res = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/associate/masterProductCreateRequest/getPendingMasterProductDetailForAssociate/${row.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setRequestDetails(res.data.data);
        } catch (err) {
            enqueueSnackbar(
                err?.response?.data?.message || 'Failed to fetch details',
                { variant: 'error' }
            );
        } finally {
            setDetailsLoading(false);
        }
    };

    const columns = [
        {
            key: 'sno',
            label: 'Sno.',
            render: (_, __, index) => index + 1,
        },
        {
            key: 'productName',
            label: 'Product Name',
        },
        {
            key: 'productCode',
            label: 'Product Code',
        },
        {
            key: 'productId',
            label: 'Product ID',
        },
        {
            key: 'createdAt',
            label: 'Created At',
            render: (_, row) =>
                row.createdAt ? new Date(row.createdAt).toLocaleString() : '-',
        },
        {
            key: 'productManager',
            label: 'Product Manager',
            render: (_, row) =>
                `${row.productManager?.name} (${row.productManager?.email})`,
        },
        {
            key: 'view',
            label: 'View',
            render: (_, row) => (
                <Button
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: 'none' }}
                    onClick={() => openViewDetails(row)}
                >
                    <VisibilityIcon />
                </Button>
            ),
        },

        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        sx={{ textTransform: 'none' }}
                        onClick={() => openApproveModal(row)}
                    >
                        Approve
                    </Button>

                    <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        sx={{ textTransform: 'none' }}
                        onClick={() => openRejectModal(row)}
                    >
                        Reject
                    </Button>
                </div>
            ),
        },

    ];

    return (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <ReusableTable
                title="Product Create Requests"
                columns={columns}
                data={createRequests}
                loading={loading}
                error={error}
                showSearch={false}
                showFilter={false}
            />

            {/* VIEW DETAILS MODAL */}
            <Dialog
                open={viewModal}
                onClose={() => setViewModal(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: 'success.main', color: 'white', fontWeight: 600 }}>
                    Product Create Request Details
                </DialogTitle>

                <DialogContent dividers sx={{ bgcolor: '#fafafa', p: 3 }}>
                    {detailsLoading ? (
                        <Box display="flex" justifyContent="center" p={5}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        requestDetails && (
                            <>
                                <DetailsSection
                                    title="General Product Metadata"
                                    color="success"
                                    fields={[
                                        { label: 'Product ID', value: requestDetails.productId },
                                        { label: 'Product Name', value: requestDetails.productName },
                                        { label: 'Product Code', value: requestDetails.productCode },
                                        { label: 'Version', value: requestDetails.versionId },
                                        { label: 'Status', value: requestDetails.status },
                                        { label: 'Product Description', value: requestDetails.productDescription },
                                        { label: 'Delivery Channel', value: requestDetails.deliveryChannel },
                                        { label: 'Category', value: requestDetails.productCategory?.categoryName },
                                        { label: 'Loan Type', value: requestDetails.loanType?.name },
                                        { label: 'Partner', value: requestDetails.productPartner?.name },
                                        { label: 'Segment Type', value: requestDetails.MasterProductSegment?.[0]?.productSegment?.name },
                                        { label: 'Purpose Category', value: requestDetails.MasterProductPurpose?.[0]?.productPurpose?.purpose },
                                    ]}
                                />

                                <DetailsSection
                                    title="Financial Terms"
                                    fields={[
                                        { label: 'Min Loan Amount', value: requestDetails.financialTerms?.minLoanAmount },
                                        { label: 'Max Loan Amount', value: requestDetails.financialTerms?.maxLoanAmount },
                                        { label: 'Min Tenure (Months)', value: requestDetails.financialTerms?.minTenureMonths },
                                        { label: 'Max Tenure (Months)', value: requestDetails.financialTerms?.maxTenureMonths },
                                        { label: 'Interest Rate Type', value: requestDetails.financialTerms?.interestRateType },
                                        { label: 'Interest Rate Min', value: requestDetails.financialTerms?.interestRateMin },
                                        { label: 'Interest Rate Max', value: requestDetails.financialTerms?.interestRateMax },
                                        { label: 'Processing Fee Type', value: requestDetails.financialTerms?.processingFeeType },
                                        { label: 'Processing Fee Value', value: requestDetails.financialTerms?.processingFeeValue },
                                        { label: 'Late Payment Fee Type', value: requestDetails.financialTerms?.latePaymentFeeType },
                                        { label: 'Late Payment Fee Value', value: requestDetails.financialTerms?.latePaymentFeeValue },
                                        { label: 'Prepayment Allowed', value: requestDetails.financialTerms?.prepaymentAllowed },
                                        { label: 'Prepayment Fee Type', value: requestDetails.financialTerms?.prepaymentFeeType },
                                        { label: 'Prepayment Fee Value', value: requestDetails.financialTerms?.prepaymentFeeValue },
                                        { label: 'EMI Frequency', value: requestDetails.financialTerms?.emiFrequency },
                                    ]}
                                />

                                <DetailsSection
                                    title="Eligibility Criteria"
                                    fields={[
                                        { label: 'Min Age', value: requestDetails.eligibilityCriteria?.minAge },
                                        { label: 'Max Age', value: requestDetails.eligibilityCriteria?.maxAge },
                                        { label: 'Min Monthly Income', value: requestDetails.eligibilityCriteria?.minMonthlyIncome },
                                        { label: 'Min Business Vintage', value: requestDetails.eligibilityCriteria?.minBusinessVintage },
                                        { label: 'Min Bureau Score', value: requestDetails.eligibilityCriteria?.minBureauScore },
                                        { label: 'Document Submission Modes', value: requestDetails.eligibilityCriteria?.documentSubmissionModes },
                                        { label: 'Document Verification Modes', value: requestDetails.eligibilityCriteria?.documentVerificationModes },
                                    ]}
                                />

                                <DetailsSection
                                    title="Credit Bureau Parameters"
                                    fields={[
                                        { label: 'Credit Bureau Sources', value: requestDetails.creditBureauConfig?.creditBureauSources },
                                        { label: 'Minimum Score Required', value: requestDetails.creditBureauConfig?.minScoreRequired },
                                        { label: 'Max Active Loans', value: requestDetails.creditBureauConfig?.maxActiveLoans },
                                        { label: 'Max Credit Utilization', value: requestDetails.creditBureauConfig?.maxCreditUtilization },
                                        { label: 'Enquiries Last 6 Months', value: requestDetails.creditBureauConfig?.enquiriesLast6Months },
                                        { label: 'Loan Delinquency Allowed', value: requestDetails.creditBureauConfig?.loanDelinquencyAllowed },
                                    ]}
                                />

                                <DetailsSection
                                    title="Financial Statement Parameters"
                                    fields={[
                                        { label: 'Min Monthly Credit', value: requestDetails.financialStatements?.minMonthlyCredit },
                                        { label: 'Min Average Balance', value: requestDetails.financialStatements?.minAverageBalance },
                                        { label: 'Bounces Last 3 Months', value: requestDetails.financialStatements?.bouncesLast3Months },
                                        { label: 'Cash Deposits Cap (%)', value: requestDetails.financialStatements?.cashDepositsCapPercent },
                                        { label: 'PDF Parsing Required', value: requestDetails.financialStatements?.pdfParsingRequired },
                                    ]}
                                />

                                <DetailsSection
                                    title="Behavioral & Risk"
                                    fields={[
                                        { label: 'Bill Payment History', value: requestDetails.behavioralData?.billPaymentHistory },
                                        { label: 'Digital Footprint Required', value: requestDetails.behavioralData?.digitalFootprintRequired },
                                        { label: 'Repeat Borrower Behavior', value: requestDetails.behavioralData?.repeatBorrowerBehavior },
                                        { label: 'Max DTI', value: requestDetails.riskScoring?.maxDTI },
                                        { label: 'Max LTV', value: requestDetails.riskScoring?.maxLTV },
                                        { label: 'Co-borrower Required', value: requestDetails.riskScoring?.coBorrowerRequired },
                                    ]}
                                />

                                <DetailsSection
                                    title="Collateral"
                                    fields={[
                                        { label: 'Collateral Type', value: requestDetails.Collateral?.collateralType },
                                        { label: 'Collateral Value', value: requestDetails.Collateral?.collateralValue },
                                        {
                                            label: 'Collateral Valuation Date',
                                            value: requestDetails.Collateral?.collateralValuationDate
                                                ? new Date(requestDetails.Collateral.collateralValuationDate).toLocaleDateString()
                                                : 'N/A',
                                        },
                                        { label: 'Collateral Owner', value: requestDetails.Collateral?.collateralOwnerName },
                                        { label: 'Guarantor Required', value: requestDetails.Collateral?.guarantorRequired },
                                        { label: 'Guarantor Name', value: requestDetails.Collateral?.guarantorName },
                                        { label: 'Guarantor Relationship', value: requestDetails.Collateral?.guarantorRelationship },
                                        { label: 'Guarantor PAN', value: requestDetails.Collateral?.guarantorPAN },
                                        { label: 'Guarantor Bureau', value: requestDetails.Collateral?.guarantorCreditBureau },
                                        { label: 'Guarantor Credit Score', value: requestDetails.Collateral?.guarantorCreditScore },
                                        { label: 'Guarantor Monthly Income', value: requestDetails.Collateral?.guarantorMonthlyIncome },
                                        { label: 'Guarantor Income Proof Types', value: requestDetails.Collateral?.guarantorIncomeProofTypes },
                                        { label: 'Guarantor Verification Status', value: requestDetails.Collateral?.guarantorVerificationStatus },
                                        { label: 'Collateral Documents', value: requestDetails.Collateral?.collateralDocs?.length ?? 0 },
                                    ]}
                                />

                                <DetailsSection
                                    title="Other Charges"
                                    fields={[
                                        { label: 'Cheque Bounce Charge', value: requestDetails.masterProductOtherCharges?.chequeBounceCharge },
                                        { label: 'Duplicate NOC Charge', value: requestDetails.masterProductOtherCharges?.dublicateNocCharge },
                                        { label: 'Furnishing Charge', value: requestDetails.masterProductOtherCharges?.furnishingCharge },
                                        { label: 'Cheque Swap Charge', value: requestDetails.masterProductOtherCharges?.chequeSwapCharge },
                                        { label: 'Revocation', value: requestDetails.masterProductOtherCharges?.revocation },
                                        { label: 'Document Copy Charge', value: requestDetails.masterProductOtherCharges?.documentCopyCharge },
                                        { label: 'Stamp Duty Charge', value: requestDetails.masterProductOtherCharges?.stampDutyCharge },
                                        { label: 'NOC Charge', value: requestDetails.masterProductOtherCharges?.nocCharge },
                                        { label: 'Incidental Charge', value: requestDetails.masterProductOtherCharges?.incidentalCharge },
                                    ]}
                                />

                                <DetailsSection
                                    title="Repayment Details"
                                    fields={[
                                        { label: 'Penal Interest Applicable', value: requestDetails.masterProductRepayment?.penalInterestApplicable },
                                        { label: 'Incentive Type', value: requestDetails.masterProductRepayment?.incentiveType },
                                        { label: 'Incentive Value', value: requestDetails.masterProductRepayment?.incentiveValue },
                                        { label: 'Payout Mode', value: requestDetails.masterProductRepayment?.payoutMode },
                                        { label: 'Incentive Reversal Conditions', value: requestDetails.masterProductRepayment?.incentiveReversalConditions },
                                    ]}
                                />

                                <DetailsSection
                                    title="Timestamps"
                                    fields={[
                                        {
                                            label: 'Created At',
                                            value: requestDetails.createdAt ? new Date(requestDetails.createdAt).toLocaleString() : 'N/A',
                                        },
                                        {
                                            label: 'Updated At',
                                            value: requestDetails.updatedAt ? new Date(requestDetails.updatedAt).toLocaleString() : 'N/A',
                                        },
                                    ]}
                                />
                            </>
                        )
                    )}
                </DialogContent>
            </Dialog>

            {approveModal && (
                <ActivateModal
                    selectedUser={{
                        name: selectedRequest?.productName,
                    }}
                    setActivateModal={setApproveModal}
                    updateUserStatus={handleApprove}
                />
            )}

            {rejectModal && (
                <DeleteModal
                    selectedUser={{
                        name: selectedRequest?.productName,
                    }}
                    setDeleteModal={setRejectModal}
                    handleDelete={handleReject}
                />
            )}

        </Paper>
    );
};

export default ProductCreateRequest;
