import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { QrPoints } from '../../types'

interface QrPointsData {
  qrPoints: QrPoints 
}

const initialState: QrPointsData = {
  qrPoints: {
    program: "0x0",  
    points: 0n,  
    uniqueNumber: 0n, 
    signature: "0x0" 
  }
} 
  
export const qrPointsSlice = createSlice({
  name: 'qrPoints',
  initialState: initialState,
  reducers: {
    setQrPoints: (state, action: PayloadAction<QrPoints>) => {
      state.qrPoints = action.payload
    }, 
    resetQrPoints: (state, action: PayloadAction<boolean>) => {
      if (action.payload === true) {
        state.qrPoints = {
          program: "0x0",  
          points: 0n,  
          uniqueNumber: 0n, 
          signature: "0x0" 
        } 
      }
    } 
  }
})

export const { setQrPoints, resetQrPoints } = qrPointsSlice.actions
export default qrPointsSlice.reducer

