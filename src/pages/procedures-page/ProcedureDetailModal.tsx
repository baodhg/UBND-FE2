import React, { useEffect, useState } from 'react'
import { Modal, Spin } from 'antd'
import {
  ClockCircleOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  FileTextOutlined,
  DownloadOutlined,
  CheckSquareOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import { proceduresApi, type ProcedureDetail } from '../../features/procedures/api/proceduresApi'
import { ChecklistModal } from './ChecklistModal'

interface ProcedureDetailModalProps {
  procedureId: string | null
  open: boolean
  onClose: () => void
}

export const ProcedureDetailModal: React.FC<ProcedureDetailModalProps> = ({
  procedureId,
  open,
  onClose,
}) => {
  const [procedure, setProcedure] = useState<ProcedureDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [checklistOpen, setChecklistOpen] = useState(false)
  const [selectedTruongHopId, setSelectedTruongHopId] = useState<string | null>(null)
  const [selectedTruongHopName, setSelectedTruongHopName] = useState<string>('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const fetchProcedureDetail = async () => {
      if (!procedureId || !open) return

      setLoading(true)
      try {
        const data = await proceduresApi.getProcedureById(procedureId)
        setProcedure(data)
      } catch (error) {
        console.error('Error fetching procedure detail:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProcedureDetail()
  }, [procedureId, open])

  const handleDownloadPdf = async (url: string, fileName: string) => {
    try {
      setDownloading(true)
      const fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}${url}`
      
      const response = await fetch(fullUrl)
      const blob = await response.blob()
      
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `${fileName}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Không thể tải file. Vui lòng thử lại.')
    } finally {
      setDownloading(false)
    }
  }

  // Get first linh vuc name
  const getLinhVucName = () => {
    if (!procedure?.thu_tuc_hanh_chinh_linh_vuc?.[0]) return 'Khác'
    return procedure.thu_tuc_hanh_chinh_linh_vuc[0].linh_vuc.ten_linh_vuc
  }

  // Get processing time and fee from cach_thuc_thuc_hien
  const getProcessingInfo = () => {
    const firstMethod = procedure?.cach_thuc_thuc_hien?.[0]
    if (!firstMethod) return null
    
    // Parse fee
    let feeDisplay = null
    if (firstMethod.le_phi) {
      const feeNumber = parseInt(firstMethod.le_phi)
      if (!isNaN(feeNumber) && feeNumber > 0) {
        feeDisplay = `${feeNumber.toLocaleString('vi-VN')} đ`
      } else if (firstMethod.le_phi.toLowerCase().includes('miễn phí') || firstMethod.le_phi === '0') {
        feeDisplay = 'Miễn phí'
      } else {
        feeDisplay = firstMethod.le_phi
      }
    }
    
    return {
      time: firstMethod.thoi_gian_giai_quyet || null,
      fee: feeDisplay,
      feeNote: firstMethod.ghi_chu_le_phi || null,
      method: firstMethod.hinh_thuc_ap_dung || null,
      description: firstMethod.mo_ta_chi_tiet || null
    }
  }

  const processingInfo = getProcessingInfo()
  const hasProcessingInfo = processingInfo && (processingInfo.time || processingInfo.fee)

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={680}
      centered
      closeIcon={<CloseOutlined className="text-gray-500 hover:text-gray-700" />}
      styles={{
        body: { 
          padding: '0',
          marginTop: '20px',
          marginBottom: '20px',
          maxHeight: 'calc(100vh - 100px)',
          overflowY: 'auto'
        }
      }}
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : procedure ? (
        <div>
          {/* Header */}
          <div className="mb-6">
            <div className="text-xs text-gray-500 mb-2">{getLinhVucName()}</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              {procedure.ten_thu_tuc}
            </h2>
            <p className="text-sm text-gray-600">
              {procedure.doi_tuong_thuc_hien}
            </p>
          </div>

          {/* Info Cards - 2 columns */}
          {hasProcessingInfo && (
            <div className={`grid gap-4 mb-6 ${processingInfo.time && processingInfo.fee ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {/* Time Card */}
              {processingInfo.time && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 min-h-[88px] flex flex-col">
                  <div className="flex items-center gap-2 mb-2 min-h-[20px]">
                    <ClockCircleOutlined className="text-blue-500 text-xl leading-none" />
                    <div className="text-xs text-gray-600 font-medium leading-none whitespace-nowrap">Thời gian xử lý</div>
                  </div>
                  <div className="text-base font-semibold text-blue-600 break-words flex-1 flex items-center">
                    {processingInfo.time}
                  </div>
                </div>
              )}

              {/* Fee Card */}
              {processingInfo.fee && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-100 min-h-[88px] flex flex-col">
                  <div className="flex items-center gap-2 mb-2 min-h-[20px]">
                    <DollarOutlined className="text-green-500 text-xl leading-none" />
                    <div className="text-xs text-gray-600 font-medium leading-none whitespace-nowrap">Lệ phí</div>
                  </div>
                  <div className="text-base font-semibold text-green-600 break-words flex-1 flex items-start flex-col">
                    <div>{processingInfo.fee}</div>
                    {processingInfo.feeNote && (
                      <div className="text-xs text-gray-500 mt-1 break-words line-clamp-2">{processingInfo.feeNote}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Các bước thực hiện */}
          {procedure.trinh_tu_thuc_hien_thu_tuc && procedure.trinh_tu_thuc_hien_thu_tuc.length > 0 && (
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Các bước thực hiện</h3>
              <div className="space-y-3">
                {procedure.trinh_tu_thuc_hien_thu_tuc
                  .sort((a, b) => a.thu_tu_buoc - b.thu_tu_buoc)
                  .map((step) => (
                    <div key={step.id} className="flex gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                        {step.thu_tu_buoc}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <div className="text-sm font-medium text-gray-900">
                          {step.ten_buoc}
                        </div>
                        {step.mo_ta_buoc && (
                          <div className="text-sm text-gray-600 mt-1">{step.mo_ta_buoc}</div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Hồ sơ yêu cầu */}
          {procedure.truong_hop_thu_tuc && procedure.truong_hop_thu_tuc.length > 0 && (
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Hồ sơ yêu cầu</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {procedure.truong_hop_thu_tuc.map((truongHop) => (
                  <div key={truongHop.id} className="flex flex-col h-full">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex-1 flex flex-col">
                      {truongHop.ten_truong_hop && (
                        <div className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2">
                          {truongHop.ten_truong_hop}
                        </div>
                      )}
                      {truongHop.mo_ta && (
                        <div className="text-xs text-gray-600 mb-3 pb-3 border-b border-gray-300 line-clamp-3">
                          {truongHop.mo_ta}
                        </div>
                      )}
                      <ul className="space-y-2 flex-1">
                        {truongHop.thanh_phan_ho_so.map((item) => (
                          <li key={item.id} className="flex gap-2 text-sm">
                            <span className="text-blue-500 mt-1 font-bold flex-shrink-0">•</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-gray-900 line-clamp-2">{item.ten_thanh_phan}</div>
                              {item.mo_ta_chi_tiet && (
                                <div className="text-xs text-gray-500 mt-1 line-clamp-2">{item.mo_ta_chi_tiet}</div>
                              )}
                              {item.ghi_chu && (
                                <div className="text-xs text-gray-500 italic mt-1 line-clamp-2">{item.ghi_chu}</div>
                              )}
                              {(item.so_luong_ban_chinh > 0 || item.so_luong_ban_sao > 0) && (
                                <div className="text-xs text-blue-600 mt-1 font-medium whitespace-nowrap">
                                  {item.so_luong_ban_chinh > 0 && `Bản chính: ${item.so_luong_ban_chinh}`}
                                  {item.so_luong_ban_chinh > 0 && item.so_luong_ban_sao > 0 && ' | '}
                                  {item.so_luong_ban_sao > 0 && `Bản sao: ${item.so_luong_ban_sao}`}
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Checklist button outside card */}
                    <button 
                      onClick={() => {
                        setSelectedTruongHopId(truongHop.id)
                        setSelectedTruongHopName(truongHop.ten_truong_hop || '')
                        setChecklistOpen(true)
                      }}
                      className="w-full mt-3 px-3 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded-md hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2 flex-shrink-0"
                    >
                      <CheckSquareOutlined />
                      <span>Danh sách kiểm tra</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Biểu mẫu tài về */}
          {procedure.thu_tuc_hanh_chinh_mau_don && procedure.thu_tuc_hanh_chinh_mau_don.length > 0 && (
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Biểu mẫu tài về</h3>
              <div className="space-y-2">
                {procedure.thu_tuc_hanh_chinh_mau_don.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => handleDownloadPdf(item.mau_don.url_file_pdf, item.mau_don.ten_mau_don)}
                    disabled={downloading}
                    className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <FileTextOutlined className="text-blue-500 text-lg" />
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">
                          {item.mau_don.ten_mau_don}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {item.mau_don.ma_mau_don} • {item.mau_don.kich_thuoc_file_mb} MB
                        </div>
                      </div>
                    </div>
                    <DownloadOutlined className="text-blue-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Thông tin liên hệ */}
          {procedure.co_so_dich_vu_cong && (
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Thông tin liên hệ</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
                {/* Địa chỉ */}
                {procedure.co_so_dich_vu_cong.dia_chi && procedure.co_so_dich_vu_cong.dia_chi !== 'none' && (
                  <div className="flex gap-3">
                    <EnvironmentOutlined className="text-blue-500 text-lg flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">Địa chỉ nộp hồ sơ</div>
                      <div className="text-sm text-gray-900 font-medium">
                        {procedure.co_so_dich_vu_cong.ten_co_so}
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        {procedure.co_so_dich_vu_cong.dia_chi}
                      </div>
                    </div>
                  </div>
                )}

                {/* Số điện thoại */}
                {procedure.co_so_dich_vu_cong.so_dien_thoai && (
                  <div className="flex gap-3">
                    <PhoneOutlined className="text-blue-500 text-lg flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Số điện thoại</div>
                      <div className="text-sm text-gray-900 font-medium">
                        {procedure.co_so_dich_vu_cong.so_dien_thoai}
                      </div>
                    </div>
                  </div>
                )}

                {/* Giờ làm việc */}
                <div className="flex gap-3">
                  <ClockCircleOutlined className="text-blue-500 text-lg flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Giờ làm việc</div>
                    <div className="text-sm text-gray-700">
                      <div>Thứ 2 - Thứ 6: 7:30 - 11:30, 13:30 - 17:00</div>
                      <div>Thứ 7: 7:30 - 11:30</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      ) : null}

      {/* Checklist Modal */}
      <ChecklistModal
        procedureId={procedureId}
        procedureName={procedure?.ten_thu_tuc || ''}
        truongHopId={selectedTruongHopId}
        truongHopName={selectedTruongHopName}
        open={checklistOpen}
        onClose={() => {
          setChecklistOpen(false)
          setSelectedTruongHopId(null)
          setSelectedTruongHopName('')
        }}
      />
    </Modal>
  )
}
