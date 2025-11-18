import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Procedure, ProcedureDetail, Pagination } from '../api/proceduresApi'

interface ProceduresState {
  procedures: Procedure[]
  procedureDetail: ProcedureDetail | null
  currentProcedureId: string | null
  pagination: Pagination | null
  isLoading: boolean
  isLoadingDetail: boolean
  error: string | null
  errorDetail: string | null
}

const initialState: ProceduresState = {
  procedures: [],
  procedureDetail: null,
  currentProcedureId: null,
  pagination: null,
  isLoading: false,
  isLoadingDetail: false,
  error: null,
  errorDetail: null,
}

const proceduresSlice = createSlice({
  name: 'procedures',
  initialState,
  reducers: {
    setProcedures: (state, action: PayloadAction<Procedure[]>) => {
      state.procedures = action.payload
      state.isLoading = false
      state.error = null
    },
    setPagination: (state, action: PayloadAction<Pagination | null>) => {
      state.pagination = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
    },
    clearProcedures: (state) => {
      state.procedures = []
      state.pagination = null
      state.error = null
    },
    setProcedureDetail: (state, action: PayloadAction<ProcedureDetail | null>) => {
      state.procedureDetail = action.payload
      state.isLoadingDetail = false
      state.errorDetail = null
    },
    setCurrentProcedureId: (state, action: PayloadAction<string | null>) => {
      state.currentProcedureId = action.payload
    },
    setLoadingDetail: (state, action: PayloadAction<boolean>) => {
      state.isLoadingDetail = action.payload
    },
    setErrorDetail: (state, action: PayloadAction<string | null>) => {
      state.errorDetail = action.payload
      state.isLoadingDetail = false
    },
    clearProcedureDetail: (state) => {
      state.procedureDetail = null
      state.currentProcedureId = null
      state.errorDetail = null
    },
  },
})

export const {
  setProcedures,
  setPagination,
  setLoading,
  setError,
  clearProcedures,
  setProcedureDetail,
  setCurrentProcedureId,
  setLoadingDetail,
  setErrorDetail,
  clearProcedureDetail,
} = proceduresSlice.actions

export default proceduresSlice.reducer

