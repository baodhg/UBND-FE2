import React, { useEffect, useState } from 'react'
import { Modal, Spin, Progress } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { proceduresApi, type ProcedureDetail } from '../../features/procedures/api/proceduresApi'

interface ThanhPhan {
  id: string
  ten_thanh_phan: string
  mo_ta_chi_tiet: string
  so_luong_ban_chinh: number
  so_luong_ban_sao: number
  ghi_chu: string
  isOptional?: boolean
  showProxyDoc?: boolean
}

interface ChecklistModalProps {
  procedureId: string | null
  procedureName: string
  truongHopId?: string | null
  truongHopName?: string
  open: boolean
  onClose: () => void
  procedureData?: ProcedureDetail | null // Add this to receive data from parent
}

export const ChecklistModal: React.FC<ChecklistModalProps> = ({
  procedureId,
  procedureName,
  truongHopId,
  truongHopName,
  open,
  onClose,
  procedureData,
}) => {
  // Generate unique key for sessionStorage based on procedure and truongHop
  const getStorageKey = () => {
    return truongHopId 
      ? `checklist_${procedureId}_${truongHopId}`
      : `checklist_${procedureId}`
  }

  const getExpandedStorageKey = () => {
    return truongHopId 
      ? `checklist_expanded_${procedureId}_${truongHopId}`
      : `checklist_expanded_${procedureId}`
  }

  // Initialize state with data from sessionStorage
  const [thanhPhanList, setThanhPhanList] = useState<ThanhPhan[]>([])
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => {
    if (procedureId) {
      const storageKey = truongHopId 
        ? `checklist_${procedureId}_${truongHopId}`
        : `checklist_${procedureId}`
      const savedChecked = sessionStorage.getItem(storageKey)
      if (savedChecked) {
        try {
          return new Set(JSON.parse(savedChecked))
        } catch (error) {
          console.error('Error parsing saved checked items:', error)
        }
      }
    }
    return new Set()
  })
  const [expandedProxyDocs, setExpandedProxyDocs] = useState<Set<string>>(() => {
    if (procedureId) {
      const expandedKey = truongHopId 
        ? `checklist_expanded_${procedureId}_${truongHopId}`
        : `checklist_expanded_${procedureId}`
      const savedExpanded = sessionStorage.getItem(expandedKey)
      if (savedExpanded) {
        try {
          return new Set(JSON.parse(savedExpanded))
        } catch (error) {
          console.error('Error parsing saved expanded items:', error)
        }
      }
    }
    return new Set()
  })
  const [loading, setLoading] = useState(false)

  // Save checked items to sessionStorage whenever they change
  useEffect(() => {
    if (procedureId) {
      const storageKey = getStorageKey()
      if (checkedItems.size > 0) {
        sessionStorage.setItem(storageKey, JSON.stringify(Array.from(checkedItems)))
      } else {
        sessionStorage.removeItem(storageKey)
      }
    }
  }, [checkedItems, procedureId, truongHopId])

  // Save expanded proxy docs to sessionStorage whenever they change
  useEffect(() => {
    if (procedureId) {
      const expandedKey = getExpandedStorageKey()
      if (expandedProxyDocs.size > 0) {
        sessionStorage.setItem(expandedKey, JSON.stringify(Array.from(expandedProxyDocs)))
      } else {
        sessionStorage.removeItem(expandedKey)
      }
    }
  }, [expandedProxyDocs, procedureId, truongHopId])

  useEffect(() => {
    const processThanhPhan = async () => {
      if (!open) return

      // If procedureData is provided, use it directly (no API call)
      if (procedureData) {
        setLoading(true)
        try {
          // Lấy thanh_phan_ho_so từ truong_hop_thu_tuc cụ thể hoặc tất cả
          const allThanhPhan: ThanhPhan[] = []
          if (procedureData.truong_hop_thu_tuc && procedureData.truong_hop_thu_tuc.length > 0) {
            // Filter by truongHopId if provided
            const filteredTruongHop = truongHopId 
              ? procedureData.truong_hop_thu_tuc.filter(th => th.id === truongHopId)
              : procedureData.truong_hop_thu_tuc
              
            filteredTruongHop.forEach((truongHop) => {
              if (truongHop.thanh_phan_ho_so && truongHop.thanh_phan_ho_so.length > 0) {
                const processedItems = truongHop.thanh_phan_ho_so.map(item => {
                  // Check if it's optional (contains "nếu Nộp Thay" or similar)
                  const isOptional = item.ten_thanh_phan.toLowerCase().includes('nếu nộp thay') || 
                                    item.ten_thanh_phan.toLowerCase().includes('(nếu nộp thay)')
                  
                  return {
                    ...item,
                    isOptional,
                    showProxyDoc: false
                  }
                })
                allThanhPhan.push(...processedItems)
              }
            })
          }
          
          setThanhPhanList(allThanhPhan)
        } catch (error) {
          console.error('Error processing procedure data:', error)
          setThanhPhanList([])
        } finally {
          setLoading(false)
        }
        return
      }

      // Fallback: If no procedureData provided, fetch from API (backward compatibility)
      if (!procedureId) return

      setLoading(true)
      try {
        const procedure: ProcedureDetail = await proceduresApi.getProcedureById(procedureId)
        
        // Lấy thanh_phan_ho_so từ truong_hop_thu_tuc cụ thể hoặc tất cả
        const allThanhPhan: ThanhPhan[] = []
        if (procedure.truong_hop_thu_tuc && procedure.truong_hop_thu_tuc.length > 0) {
          // Filter by truongHopId if provided
          const filteredTruongHop = truongHopId 
            ? procedure.truong_hop_thu_tuc.filter(th => th.id === truongHopId)
            : procedure.truong_hop_thu_tuc
            
          filteredTruongHop.forEach((truongHop) => {
            if (truongHop.thanh_phan_ho_so && truongHop.thanh_phan_ho_so.length > 0) {
              const processedItems = truongHop.thanh_phan_ho_so.map(item => {
                // Check if it's optional (contains "nếu Nộp Thay" or similar)
                const isOptional = item.ten_thanh_phan.toLowerCase().includes('nếu nộp thay') || 
                                  item.ten_thanh_phan.toLowerCase().includes('(nếu nộp thay)')
                
                return {
                  ...item,
                  isOptional,
                  showProxyDoc: false
                }
              })
              allThanhPhan.push(...processedItems)
            }
          })
        }
        
        setThanhPhanList(allThanhPhan)
        // Don't reset checked items - they will be loaded from sessionStorage
      } catch (error) {
        console.error('Error fetching procedure detail:', error)
        setThanhPhanList([])
      } finally {
        setLoading(false)
      }
    }

    processThanhPhan()
  }, [procedureId, procedureData, open, truongHopId])

  const handleToggleCheck = (id: string) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleToggleProxyDoc = (id: string) => {
    setExpandedProxyDocs((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
        // Also uncheck the proxy document when collapsing
        setCheckedItems((prevChecked) => {
          const newChecked = new Set(prevChecked)
          newChecked.delete(`${id}-proxy`)
          return newChecked
        })
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const progress = thanhPhanList.length > 0 
    ? Math.round((checkedItems.size / getTotalRequiredItems()) * 100) 
    : 0

  const isComplete = thanhPhanList.length > 0 && checkedItems.size === getTotalRequiredItems()

  // Calculate total required items (excluding optional ones that are not expanded)
  function getTotalRequiredItems() {
    let total = 0
    thanhPhanList.forEach((item) => {
      if (!item.isOptional) {
        total += 1
      }
      // If optional item is expanded (showing proxy doc), count the proxy doc
      if (item.isOptional && expandedProxyDocs.has(item.id)) {
        total += 1
      }
    })
    return total
  }

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
          padding: '24px',
          marginTop: '20px',
          marginBottom: '20px',
          maxHeight: 'calc(100vh - 100px)',
          overflowY: 'auto',
          paddingRight: '32px'
        }
      }}
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <div>
          {/* Header */}
          <div className="mb-6">
            <div className="text-xs text-blue-500 font-medium mb-2">
              {truongHopName ? 'Trường hợp' : 'Thủ tục'}
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {truongHopName || procedureName}
            </h2>
            {truongHopName && (
              <div className="text-sm text-gray-600">
                Thủ tục: {procedureName}
              </div>
            )}

            {/* Progress */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 font-medium">Tiến độ chuẩn bị</span>
                <span className="text-sm font-semibold text-blue-600">
                  {checkedItems.size}/{thanhPhanList.length}
                </span>
              </div>
              <Progress 
                percent={progress} 
                strokeColor="#1f2937"
                trailColor="#e5e7eb"
                showInfo={false}
                strokeWidth={12}
              />
              <div className="text-xs text-gray-600 mt-2">
                Đã hoàn thành {progress}% hồ sơ
              </div>
            </div>
            
            {/* Notification Messages */}
            {!isComplete && thanhPhanList.length > 0 && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-yellow-800">Cần hoàn thiện</div>
                  <div className="text-sm text-yellow-700">
                    Bạn còn {getTotalRequiredItems() - checkedItems.size} giấy tờ bắt buộc chưa chuẩn bị
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Checklist */}
          {thanhPhanList.length > 0 ? (
            <div className="space-y-3">
              {thanhPhanList.map((item) => {
                const isChecked = checkedItems.has(item.id)
                const isProxyExpanded = expandedProxyDocs.has(item.id)
                const isProxyDocChecked = checkedItems.has(`${item.id}-proxy`)
                
                return (
                  <div key={item.id}>
                    {/* Main Item */}
                    <div
                      onClick={() => {
                        if (!item.isOptional) {
                          handleToggleCheck(item.id)
                        } else {
                          handleToggleProxyDoc(item.id)
                        }
                      }}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-white border-gray-800'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Checkbox - only for non-optional items */}
                        {!item.isOptional && (
                          <div className="flex-shrink-0 mt-0.5">
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                isChecked
                                  ? 'bg-gray-800 border-gray-800'
                                  : 'bg-white border-gray-300'
                              }`}
                            >
                              {isChecked && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path d="M5 13l4 4L19 7"></path>
                                </svg>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Plus button for optional items */}
                        {item.isOptional && (
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-5 h-5 rounded border-2 border-blue-500 bg-white flex items-center justify-center transition-all hover:bg-blue-50">
                              <svg
                                className={`w-3 h-3 text-blue-500 transition-transform ${isProxyExpanded ? 'rotate-45' : ''}`}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M12 4v16m8-8H4"></path>
                              </svg>
                            </div>
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1">
                          <div
                            className={`text-sm font-medium mb-1 ${
                              isChecked ? 'text-gray-400 line-through' : 'text-gray-900'
                            }`}
                          >
                            {item.ten_thanh_phan}
                          </div>
                          
                          {item.mo_ta_chi_tiet && (
                            <div className="text-xs text-gray-600 mb-2">
                              {item.mo_ta_chi_tiet}
                            </div>
                          )}

                          {(item.so_luong_ban_chinh > 0 || item.so_luong_ban_sao > 0) && (
                            <div className="flex gap-4 text-xs">
                              {item.so_luong_ban_chinh > 0 && (
                                <span className="text-blue-600 font-medium">
                                  Bản chính: {item.so_luong_ban_chinh}
                                </span>
                              )}
                              {item.so_luong_ban_sao > 0 && (
                                <span className="text-blue-600 font-medium">
                                  Bản sao: {item.so_luong_ban_sao}
                                </span>
                              )}
                            </div>
                          )}

                          {item.ghi_chu && (
                            <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                              {item.ghi_chu}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Proxy Document (Giấy Ủy Quyền) - shown when expanded */}
                    {item.isOptional && isProxyExpanded && (
                      <div className="ml-8 mt-2">
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleCheck(`${item.id}-proxy`)
                          }}
                          className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                            isProxyDocChecked
                              ? 'bg-white border-gray-800'
                              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex gap-3">
                            {/* Checkbox */}
                            <div className="flex-shrink-0 mt-0.5">
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                  isProxyDocChecked
                                    ? 'bg-gray-800 border-gray-800'
                                    : 'bg-white border-gray-300'
                                }`}
                              >
                                {isProxyDocChecked && (
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path d="M5 13l4 4L19 7"></path>
                                  </svg>
                                )}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <div
                                className={`text-sm font-medium mb-1 ${
                                  isProxyDocChecked ? 'text-gray-400 line-through' : 'text-gray-900'
                                }`}
                              >
                                Giấy Ủy Quyền (nếu Nộp Thay)
                              </div>
                              <div className="text-xs text-gray-600">
                                Bản chính hoặc bản sao có chứng thực của người được ủy quyền.
                              </div>
                              <div className="flex gap-4 text-xs mt-2">
                                <span className="text-blue-600 font-medium">Bản sao: 1</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Không có thành phần hồ sơ nào
            </div>
          )}

          {/* Success Notification at bottom */}
          {isComplete && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-green-600 font-semibold mb-2">
                <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Hoàn tất chuẩn bị hồ sơ!</span>
              </div>
              <div className="text-sm text-green-600 text-center">Bạn đã sẵn sàng nộp hồ sơ</div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
