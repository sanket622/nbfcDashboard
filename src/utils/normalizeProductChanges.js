const mapArrayNames = (arr, key = 'name') =>
    Array.isArray(arr) ? arr.map(i => i[key]).join(', ') : '-';



const normalizeCreditRules = (data) => {
    const format = (rules) => {
        if (!Array.isArray(rules) || rules.length === 0) return '-';

        return rules
            .map(r => `${r.creditRole}: ${r.minScore} - ${r.maxScore}`)
            .join(', ');
    };

    return {
        current: format(data?.currentData?.creditAssignmentRules),
        proposed: format(data?.proposedData?.creditAssignmentRules),
    };
};


// const normalizeProductFields = (productFields) => {
//     if (!productFields?.fieldsJsonData) return '-';

//     try {
//         const parsed = typeof productFields.fieldsJsonData === 'string'
//             ? JSON.parse(productFields.fieldsJsonData)
//             : productFields.fieldsJsonData;

//         const fields = parsed?.[0]?.fields || [];

//         if (!Array.isArray(fields) || fields.length === 0) return '-';

//         return fields.map(f => f.label || f.fieldKey).join(', ');
//     } catch {
//         return '-';
//     }
// };



export const normalizeProductChanges = (data) => {
    const currentData = data.currentData || {};
    const proposedData = data.proposedData || {};
    const creditRules = normalizeCreditRules(data);

    return {
        currentData: {
            basic: {
                productName: currentData.basic?.productName,
                productDescription: currentData.basic?.productDescription,
                productCategory: currentData.basic?.productCategory?.categoryName,
                loanType: currentData.basic?.loanType?.name,
                deliveryChannels: mapArrayNames(currentData.basic?.deliveryChannels),
                partner: currentData.basic?.productPartner?.name,
                purposes: mapArrayNames(currentData.basic?.purposes, 'purpose'),
                segments: mapArrayNames(currentData.basic?.segments),
                disbursementModes: mapArrayNames(currentData.basic?.disbursementModes),
                repaymentModes: mapArrayNames(currentData.basic?.repaymentModes),
                creditAssignmentRules: creditRules.current,
            },

            financialTerms: currentData.financialTerms,
            eligibilityCriteria: currentData.eligibilityCriteria,
            creditBureauConfig: currentData.creditBureauConfig,
            otherCharges: currentData.otherCharges,

          
            productFields: currentData.productFields,
        },

        proposedData: {
            basic: {
                productName: proposedData.basic?.productName,
                productDescription: proposedData.basic?.productDescription,
                productCategory: currentData.basic?.productCategory?.categoryName,
                loanType: currentData.basic?.loanType?.name,
                deliveryChannels: mapArrayNames(proposedData.basic?.deliveryChannels),
                partner: currentData.basic?.productPartner?.name,
                purposes: mapArrayNames(currentData.basic?.purposes, 'purpose'),
                segments: mapArrayNames(currentData.basic?.segments),
                disbursementModes: mapArrayNames(currentData.basic?.disbursementModes),
                repaymentModes: mapArrayNames(currentData.basic?.repaymentModes),
                creditAssignmentRules: creditRules.proposed,
            },

            financialTerms: proposedData.financialTerms,
            eligibilityCriteria: proposedData.eligibilityCriteria,
            creditBureauConfig: proposedData.creditBureauConfig,
            otherCharges: proposedData.otherCharges,

           
            productFields: proposedData.productFields,
        },
    };
};
