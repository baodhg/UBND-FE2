export { procedureFieldsApi } from './api/procedureFieldsApi'
export type { 
  ProcedureField,
  GetProcedureFieldsResponse,
  ProcedureFieldCount
} from './api/procedureFieldsApi'
export { useProcedureFields } from './hooks/useProcedureFields'
export { useProcedureFieldCounts } from './hooks/useProcedureFieldCounts'
export {
  setFields,
  setLoading,
  setError,
  clearFields,
} from './store/procedureFieldsSlice'
export { default as procedureFieldsReducer } from './store/procedureFieldsSlice'
