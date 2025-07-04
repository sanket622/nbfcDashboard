import {configureStore} from '@reduxjs/toolkit';
import authReducer from '../redux/auth/authSlice';
import employeeReducer from './employee/employeeSlice';
import cardReducer from './dashboardhome/cardSlice';
import employerProfileReducer from './dashboardhome/employerProfileSlice';
import roleModuleReducer from './managerole/roleModuleSlice';
import productRequestReducer from '../redux/managerequest/productRequestSlice';
import variantRequestReducer from '../redux/managerequest/variantRequestSlice';


export const store = configureStore({
    reducer: {
        auth: authReducer,
        employee: employeeReducer,
        employeeCard: cardReducer,
        employerProfile: employerProfileReducer,
        roleModule: roleModuleReducer,
        productRequest: productRequestReducer,
        variantRequest: variantRequestReducer,

    },
});
