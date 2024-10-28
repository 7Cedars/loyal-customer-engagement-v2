import { LoyaltyCard } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface cardReducerProps {
  loyaltyCard: LoyaltyCard | undefined; 
  cardExists: boolean; 
}

const initialState: cardReducerProps = {
  loyaltyCard: undefined, 
  cardExists: false
};

export const loyaltyCardSlice = createSlice({
  name: 'loyaltyCard',
  initialState: initialState,
  reducers: {
    setLoyaltyCard: (state, action) => {
      state.loyaltyCard = action.payload
    },
    setCardExists: (state, action: PayloadAction<boolean>) => {
      state.cardExists = action.payload
    },
    resetLoyaltyCard: (state, action: PayloadAction<boolean>) => {
      if (action.payload === true) {
        state.loyaltyCard = undefined
        state.cardExists = false
      }
    }, 
  }
})

export const { setLoyaltyCard, setCardExists, resetLoyaltyCard} = loyaltyCardSlice.actions
export default loyaltyCardSlice.reducer

