import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Program } from '../../types'


interface SelectedProgram {
  selectedProgram: Program 
}

const initialState: SelectedProgram = {
  selectedProgram: {
    colourBase: "#f1f5f9", 
    colourAccent: "#0f172a"
  }
}

export const programSlice = createSlice({
  name: 'selectedProgram',
  initialState: initialState,
  reducers: {
    setVendor: (state, action: PayloadAction<Program>) => {
      state.selectedProgram = action.payload
    },
    resetVendor: (state, action: PayloadAction<boolean>) => {
      if (action.payload === true) {
        state.selectedProgram = {
          colourBase: "#f1f5f9", 
          colourAccent: "#0f172a"
        }
      }
    }, 
  }
})

export const { setVendor, resetVendor } = programSlice.actions
export default programSlice.reducer

