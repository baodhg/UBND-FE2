import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ProcedureField } from '../api/procedureFieldsApi'

interface ProcedureFieldsState {
  fields: ProcedureField[]
  isLoading: boolean
  error: string | null
}

const initialState: ProcedureFieldsState = {
  fields: [],
  isLoading: false,
  error: null,
}

const procedureFieldsSlice = createSlice({
  name: 'procedureFields',
  initialState,
  reducers: {
    setFields: (state, action: PayloadAction<ProcedureField[]>) => {
      state.fields = action.payload
      state.isLoading = false
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
    },
    clearFields: (state) => {
      state.fields = []
      state.error = null
    },
  },
})

export const { setFields, setLoading, setError, clearFields } = procedureFieldsSlice.actions

export default procedureFieldsSlice.reducer
