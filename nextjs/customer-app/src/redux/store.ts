import { configureStore } from '@reduxjs/toolkit'
import programReducer from './reducers/vendorReducer'
import qrPointsReducer from './reducers/qrPointsReducer'
import cardReducer from './reducers/cardReducer'

export const store = configureStore({
  reducer: {
    selectedProgram: programReducer,
    qrPoints: qrPointsReducer, 
    loyaltyCard: cardReducer
  }
})

// see redux website for these typescript examples. 
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store