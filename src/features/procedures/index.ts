export { proceduresApi } from './api/proceduresApi'
export type { 
  Procedure, 
  ProcedureDetail,
  CoSoDichVuCong,
  CachThucThucHien,
  TrinhTuThucHienThuTuc,
  LinhVuc,
  ThuTucHanhChinhLinhVuc,
  ThanhPhanHoSo,
  TruongHopThuTuc,
  Pagination, 
  GetProceduresParams, 
  GetProceduresResponse,
  GetProcedureByIdResponse
} from './api/proceduresApi'
export { useProcedures } from './hooks/useProcedures'
export { useProcedureById } from './hooks/useProcedureById'
export {
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
} from './store/proceduresSlice'
export { default as proceduresReducer } from './store/proceduresSlice'

