import { configureStore } from '@reduxjs/toolkit'
import programReducer from './reducers/programReducer'
import qrPointsReducer from './reducers/qrPointsReducer'
import abstractAccountReducer from './reducers/abstractAccountReducer'

export const store = configureStore({
  reducer: {
    selectedProgram: programReducer,
    qrPoints: qrPointsReducer, 
    abstractAA: abstractAccountReducer
  }
})

// see redux website for these typescript examples. 
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store