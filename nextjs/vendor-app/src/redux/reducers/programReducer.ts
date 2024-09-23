import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Program } from '../../types'


interface SelectedProgram {
  selectedProgram: Program 
}

const initialState: SelectedProgram = {
  selectedProgram: {
    address: '0x0', 
    colourBase: "#f1f5f9", 
    colourAccent: "#0f172a", 
    events:  {
      startBlock: 0, 
      endBlock: 1,
      genesisReached: false, 
      events: []
    }
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
          address: '0x0', 
          colourBase: "#f1f5f9", 
          colourAccent: "#0f172a",
          events:  {
            startBlock: 0, 
            endBlock: 1,
            genesisReached: false, 
            events: []
          }
        }
      }
    }, 
  }
})

export const { setProgram, setBalanceProgram, resetProgram } = programSlice.actions
export default programSlice.reducer

