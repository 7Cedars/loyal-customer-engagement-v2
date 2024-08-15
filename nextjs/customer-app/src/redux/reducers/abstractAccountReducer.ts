import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Program } from '../../types'
import { SmartAccount } from 'viem/account-abstraction';

interface ActiveAbstractAccount {
  activeAA: any | undefined; 
}

const initialState: ActiveAbstractAccount = {
  activeAA: undefined
};

export const abstractAccountSlice = createSlice({
  name: 'selectedProgram',
  initialState: initialState,
  reducers: {
    setAbstractAccount: (state, action) => {
      state.activeAA = action.payload
    },
    resetAbstractAccount: (state, action: PayloadAction<boolean>) => {
      if (action.payload === true) {
        state.activeAA = undefined
      }
    }, 
  }
})

export const { setAbstractAccount, resetAbstractAccount } = abstractAccountSlice.actions
export default abstractAccountSlice.reducer

