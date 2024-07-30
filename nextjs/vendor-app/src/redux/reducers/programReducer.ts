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
    setLayout: (state, action: PayloadAction<Program>) => {
      state.selectedProgram = action.payload
    }, 
    resetLayout: (state, action: PayloadAction<boolean>) => {
      if (action.payload === true) {
        state.selectedProgram = {
          colourBase: "#f1f5f9", 
          colourAccent: "#0f172a"
        }
      }
    }, 
  }
})

export const { setLayout, resetLayout } = programSlice.actions
export default programSlice.reducer

