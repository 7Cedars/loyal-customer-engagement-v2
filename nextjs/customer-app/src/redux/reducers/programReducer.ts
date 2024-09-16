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
    setProgram: (state, action: PayloadAction<Program>) => {
      state.selectedProgram = action.payload
    }, 
    setBalanceProgram: (state, action: PayloadAction<Number>) => {
      state.selectedProgram = {...state.selectedProgram, balance: action.payload} 
    }, 
    resetProgram: (state, action: PayloadAction<boolean>) => {
      if (action.payload === true) {
        state.selectedProgram = {
          colourBase: "#f1f5f9", 
          colourAccent: "#0f172a"
        }
      }
    }, 
  }
})

export const { setProgram, setBalanceProgram, resetProgram } = programSlice.actions
export default programSlice.reducer
