import { configureStore } from '@reduxjs/toolkit'
import programReducer from './reducers/vendorReducer'
import voucherReducer from './reducers/voucherReducer'
import cardReducer from './reducers/cardReducer'

export const store = configureStore({
  reducer: {
    selectedProgram: programReducer,
    voucher: voucherReducer, 
    loyaltyCard: cardReducer
  }
})

// see redux website for these typescript examples. 
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store