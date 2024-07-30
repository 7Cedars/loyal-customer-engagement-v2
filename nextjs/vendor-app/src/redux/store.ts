import { configureStore } from '@reduxjs/toolkit'
import programReducer from './reducers/programReducer'

export const store = configureStore({
  reducer: {
    selectedProgram: programReducer
  }
})

// see redux website for these typescript examples. 
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store