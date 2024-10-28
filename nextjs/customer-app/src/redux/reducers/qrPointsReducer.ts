import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { QrPoints } from '../../types'

type voucherProps = {
  program: `0x${string}`;  
  points: number;   
  uniqueNumber: number; 
  signature: `0x${string}`; 
}

interface QrPointsData {
  qrPoints: voucherProps 
}

const initialState: QrPointsData = {
  qrPoints: {
    program: "0x0",  
    points: 0,  
    uniqueNumber: 0, 
    signature: "0x0" 
  }
} 
  
export const qrPointsSlice = createSlice({
  name: 'qrPoints',
  initialState: initialState,
  reducers: {
    setQrPoints: (state, action: PayloadAction<voucherProps>) => {
      state.qrPoints = action.payload
    }, 
    resetQrPoints: (state, action: PayloadAction<boolean>) => {
      if (action.payload === true) {
        state.qrPoints = {
          program: "0x0",  
          points: 0,  
          uniqueNumber: 0, 
          signature: "0x0" 
        } 
      }
    } 
  }
})

export const { setQrPoints, resetQrPoints } = qrPointsSlice.actions
export default qrPointsSlice.reducer

