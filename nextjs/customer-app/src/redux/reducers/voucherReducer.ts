import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type voucherProps = {
  program: `0x${string}`;  
  points: number;   
  uniqueNumber: number; 
  signature: `0x${string}`; 
}

interface VoucherData {
  voucher: voucherProps 
}

const initialState: VoucherData = {
  voucher: {
    program: "0x0",  
    points: 0,  
    uniqueNumber: 0, 
    signature: "0x0" 
  }
} 
  
export const voucherSlice = createSlice({
  name: 'voucher',
  initialState: initialState,
  reducers: {
    setVoucher: (state, action: PayloadAction<voucherProps>) => {
      state.voucher = action.payload
    }, 
    resetVoucher: (state, action: PayloadAction<boolean>) => {
      if (action.payload === true) {
        state.voucher = {
          program: "0x0",  
          points: 0,  
          uniqueNumber: 0, 
          signature: "0x0" 
        } 
      }
    } 
  }
})

export const { setVoucher, resetVoucher } = voucherSlice.actions
export default voucherSlice.reducer

