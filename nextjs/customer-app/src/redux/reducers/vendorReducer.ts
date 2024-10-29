import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Program } from '../../types'

interface VendorProgram {
  vendorProgram: Program 
}

const initialState: VendorProgram = {
  vendorProgram: {
    colourBase: "#f1f5f9", 
    colourAccent: "#0f172a"
  }
}

export const vendorSlice = createSlice({
  name: 'vendorProgram',
  initialState: initialState,
  reducers: {
    setVendor: (state, action: PayloadAction<Program>) => {
      state.vendorProgram = action.payload
    },
    resetVendor: (state, action: PayloadAction<boolean>) => {
      if (action.payload === true) {
        state.vendorProgram = {
          colourBase: "#f1f5f9", 
          colourAccent: "#0f172a"
        }
      }
    }, 
  }
})

export const { setVendor, resetVendor } = vendorSlice.actions
export default vendorSlice.reducer

