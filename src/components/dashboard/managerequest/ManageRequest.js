import React, {useState} from 'react';
import {Box, Tab, Tabs,} from '@mui/material';
import {useLocation} from 'react-router-dom';
import {useDispatch} from 'react-redux';
import ProductEditRequest from './ProductEditRequest';
import ProductDeleteRequest from './ProductDeleteRequest';
import VarientEditRequest from "./VarientEditRequest";
import VarientDeleteRequest from "./VarientDeleteRequest";
import ProductCreateRequest from "./ProductCreateRequest";
import VariantCreateRequest from "./VariantCreateRequest";

const ManageRequest = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const dispatch = useDispatch()
    const handleTabChange = (_, newValue) => setTabIndex(newValue);
    const location = useLocation();

    return (
        <div className="p-2 ">
            <h1 className="text-[24px] font-semibold my-3 flex gap-2"> Manage Request </h1>
            <div className=" bg-white rounded-lg shadow-md mt-6">
                <Box sx={{width: '100%'}}>
                    <Tabs value={tabIndex} onChange={handleTabChange} indicatorColor="primary" variant="scrollable"
                          scrollButtons="auto" textColor="inherit" sx={{ backgroundColor: '#F5F5FF',
                        '& .MuiTabs-indicator': {backgroundColor: '#1f2937'},
                        '& .MuiTab-root': {
                            color: '#424242',
                            textTransform: 'capitalize',
                            whiteSpace: 'normal',
                            lineHeight: 1.2,
                            minHeight: 'auto',
                        },
                        '& .Mui-selected': {color: '#1f2937'}
                    }}>
                        <Tab label="Product Create Request"/>
                        <Tab label="Product Edit Request"/>
                        <Tab label="Product Delete Request"/>
                        <Tab label="Variant Create Request"/>
                        <Tab label="Varient Edit Request"/>
                        <Tab label="Varient Delete Request"/>
                    </Tabs>

                    <Box mt={3}>
                        {tabIndex === 0 && <ProductCreateRequest/>}
                        {tabIndex === 1 && <ProductEditRequest/>}
                        {tabIndex === 2 && <ProductDeleteRequest/>}
                        {tabIndex === 3 && <VariantCreateRequest/>}
                        {tabIndex === 4 && <VarientEditRequest/>}
                        {tabIndex === 5 && <VarientDeleteRequest/>}
                    </Box>
                </Box>
            </div>
        </div>
    )
}

export default ManageRequest