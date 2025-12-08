import React, { useState, useMemo, useEffect } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Camera, MapPin, ChevronDown, CheckCircle2, X, Copy, Check, Video } from 'lucide-react'
import { Switch } from 'antd'
import { useReportCategories } from '../../features/report-categories'
import { useCreateReport } from '../../features/reports'
import { useUploadVideo } from '../../features/video-upload'
import { Captcha } from '../../components/Captcha'

interface SendReportFormValues {
  category: string
  title: string
  description: string
  images: File[]
  video: File | null
  location: string
  priority: string
  isAnonymous: boolean
  name: string
  phone: string
}

const SendReportSchema = Yup.object().shape({
  category: Yup.string().required('Loại phản ánh là bắt buộc'),
  title: Yup.string()
    .max(200, 'Tiêu đề không được vượt quá 200 ký tự')
    .matches(/^[a-zA-Z0-9\sÀ-ỹ,.\-/:()]+$/, 'Tiêu đề không được chứa ký tự đặc biệt')
    .required('Tiêu đề là bắt buộc'),
  description: Yup.string()
    .max(2000, 'Mô tả không được vượt quá 2000 ký tự')
    .matches(/^[a-zA-Z0-9\sÀ-ỹ,.\-/:()!?\n]+$/, 'Mô tả không được chứa ký tự đặc biệt')
    .required('Mô tả là bắt buộc'),
  images: Yup.array()
    .min(1, 'Vui lòng tải lên ít nhất 1 hình ảnh')
    .max(5, 'Chỉ được tải lên tối đa 5 hình ảnh')
    .test('fileSize', 'Mỗi file tối đa 3MB', (files) => {
      if (!files) return true
      return files.every((file: any) => file.size <= 3 * 1024 * 1024)
    })
    .required('Hình ảnh là bắt buộc'),
  video: Yup.mixed()
    .nullable()
    .test('fileSize', 'Mỗi file tối đa 150MB', (file: any) => {
      if (!file) return true
      return file.size <= 150 * 1024 * 1024
    })
    .test('fileType', 'Chỉ chấp nhận file .mp4', (file: any) => {
      if (!file) return true
      return file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4')
    }),
  location: Yup.string()
    .max(255, 'Địa điểm không được vượt quá 255 ký tự')
    .matches(/^[a-zA-Z0-9\sÀ-ỹ,.\-/]+$/, 'Địa điểm không được chứa ký tự đặc biệt')
    .required('Địa điểm là bắt buộc'),
  priority: Yup.string().required('Mức độ là bắt buộc'),
  isAnonymous: Yup.boolean(),
  name: Yup.string().when('isAnonymous', {
    is: false,
    then: (schema) => schema.required('Họ và tên là bắt buộc khi không gửi ẩn danh'),
    otherwise: (schema) => schema.notRequired(),
  }),
  phone: Yup.string().when('isAnonymous', {
    is: false,
    then: (schema) =>
      schema
        .matches(/^[0-9]+$/, 'Số điện thoại chỉ được chứa chữ số')
        .matches(/^[0-9]{10}$/, 'Số điện thoại phải có đúng 10 chữ số')
        .required('Số điện thoại là bắt buộc khi không gửi ẩn danh'),
    otherwise: (schema) => schema.notRequired(),
  }),
})

export const SendReportForm: React.FC = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [trackingCode, setTrackingCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isCaptchaValid, setIsCaptchaValid] = useState(false)
  const [resetCaptcha, setResetCaptcha] = useState(0)

  const { mutate: createReport, isPending } = useCreateReport()
  const { uploadVideoAsync, isLoading: isUploadingVideo } = useUploadVideo()

  // Fetch categories from API
  const { categories, isLoading: isLoadingCategories } = useReportCategories({
    page: 1,
    size: 100,
    isActive: true,
  })

  const initialValues: SendReportFormValues = {
    category: '',
    title: '',
    description: '',
    images: [],
    video: null,
    location: '',
    priority: 'Thông thường',
    isAnonymous: false,
    name: '',
    phone: '',
  }

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void,
    currentImages: File[]
  ) => {
    const newFiles = Array.from(event.target.files || [])
    const totalFiles = [...currentImages, ...newFiles]
    
    if (totalFiles.length > 5) {
      return
    }

    const oversizedFiles = newFiles.filter((file) => file.size > 3 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      return
    }

    setFieldValue('images', totalFiles)
    // Reset input để có thể chọn lại cùng file
    event.target.value = ''
  }

  const handleRemoveImage = (
    index: number,
    setFieldValue: (field: string, value: any) => void,
    currentImages: File[]
  ) => {
    const newImages = currentImages.filter((_, i) => i !== index)
    setFieldValue('images', newImages)
  }

  const handleVideoChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const file = event.target.files?.[0]
    
    if (!file) {
      return
    }

    // Check file type - only .mp4
    if (file.type !== 'video/mp4' && !file.name.toLowerCase().endsWith('.mp4')) {
      event.target.value = ''
      return
    }

    // Check file size - max 150MB
    if (file.size > 150 * 1024 * 1024) {
      event.target.value = ''
      return
    }

    setFieldValue('video', file)
    // Reset input để có thể chọn lại cùng file
    event.target.value = ''
  }

  const handleRemoveVideo = (
    setFieldValue: (field: string, value: any) => void
  ) => {
    setFieldValue('video', null)
  }

  const handleSubmit = async (values: SendReportFormValues, { resetForm }: any) => {
    try {
      let videoId: string | undefined = undefined

      // Upload video first if exists
      if (values.video) {
        try {
          console.log('Uploading video...')
          const videoResult = await uploadVideoAsync({
            file: values.video,
          })
          videoId = videoResult.idVideo
          console.log('Video uploaded successfully, idVideo:', videoId)
        } catch (videoError: any) {
          console.error('Video upload error:', videoError)
          return
        }
      }

      // Prepare report data
      const requestData = {
        idLinhVucPhanAnh: values.category,
        tieuDe: values.title,
        moTa: values.description,
        viTri: values.location,
        mucDo: values.priority,
        tenNguoiPhanAnh: values.isAnonymous ? undefined : values.name,
        soDienThoaiNguoiPhanAnh: values.isAnonymous ? undefined : values.phone,
        idVideo: videoId ? [videoId] : undefined,
      }

      // Submit report with images and video ID
      createReport(
        { 
          data: requestData, 
          images: values.images.length > 0 ? values.images : undefined,
        },
        {
          onSuccess: (data) => {
            console.log('API Response:', data)
            console.log('Mã phản ánh:', data.ma_phan_anh)
            setTrackingCode(data.ma_phan_anh || '')
            setShowSuccessModal(true)
            resetForm()
            setIsCaptchaValid(false)
            setResetCaptcha(prev => prev + 1)
          },
          onError: (error: any) => {
            console.error('Submit error:', error)
            console.error('Error response:', error?.response?.data)
          },
        }
      )
    } catch (error: any) {
      console.error('Unexpected error:', error)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(trackingCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-2 sm:p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-1.5 sm:p-2 z-10"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
            
            {/* Image */}
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-[95vh] sm:max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-md w-full mx-2 sm:mx-4 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 z-10"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>

            {/* Success icon */}
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="bg-green-100 rounded-full p-2 sm:p-3">
                <CheckCircle2 size={36} className="sm:w-12 sm:h-12 text-green-600" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center pt-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Gửi thành công!</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Phản ánh của bạn đã được tiếp nhận. Chúng tôi sẽ xem xét và phản hồi sớm nhất.
              </p>

              {/* Tracking Code */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-gray-600 mb-2">Mã tra cứu của bạn:</p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <code className="text-lg sm:text-2xl font-bold text-blue-600 break-all">{trackingCode}</code>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-1.5 sm:p-2 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
                    title="Sao chép mã"
                  >
                    {copied ? (
                      <Check size={18} className="sm:w-5 sm:h-5 text-green-600" />
                    ) : (
                      <Copy size={18} className="sm:w-5 sm:h-5 text-blue-600" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Vui lòng lưu lại mã này để tra cứu tiến độ xử lý
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 px-4 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-medium rounded-lg transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Formik
      initialValues={initialValues}
      validationSchema={SendReportSchema}
      onSubmit={handleSubmit}
      validateOnChange={false}
      validateOnBlur={false}
      validateOnMount={false}
    >
      {({ values, setFieldValue, errors, touched }) => {
        // Memoize video URL to prevent re-creating on every render
        const videoUrl = useMemo(() => {
          return values.video ? URL.createObjectURL(values.video) : null
        }, [values.video])
        
        // Cleanup video URL when component unmounts or video changes
        useEffect(() => {
          return () => {
            if (videoUrl) {
              URL.revokeObjectURL(videoUrl)
            }
          }
        }, [videoUrl])
        
        return (
        <Form className="space-y-4 sm:space-y-6" style={{ contain: 'layout' }}>
          {/* Loại phản ánh */}
          <div>
            <label
              htmlFor="category"
              className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            >
              Loại phản ánh <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-2">
              <Field
                as="select"
                name="category"
                id="category"
                disabled={isLoadingCategories}
                className="flex w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm whitespace-nowrap outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50 h-10 appearance-none pr-10"
              >
                <option value="">
                  {isLoadingCategories ? 'Đang tải...' : 'Chọn loại phản ánh'}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.ten}
                  </option>
                ))}
              </Field>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none opacity-50"
              />
            </div>
            <ErrorMessage name="category" component="div" className="text-red-500 text-xs sm:text-sm leading-tight mt-1" />
          </div>

          {/* Tiêu đề */}
          <div>
            <label
              htmlFor="title"
              className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            >
              Tiêu đề <span className="text-red-500">*</span>
            </label>
              <Field
                name="title"
                id="title"
                type="text"
                placeholder="Nhập tiêu đề phản ánh"
                autoComplete="off"
                className={`flex w-full rounded-md border bg-gray-100 px-3 py-2 sm:py-2.5 text-sm sm:text-base outline-none disabled:cursor-not-allowed disabled:opacity-50 mt-2 h-10 ${
                  values.title.length > 200 || (values.title && !/^[a-zA-Z0-9\sÀ-ỹ,.\-/:()]*$/.test(values.title))
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                }`}
              />
            <p className={`text-xs sm:text-sm mt-1 flex items-center ${
              values.title.length > 200 ? 'text-red-500 font-medium' : 'text-gray-500'
            }`}>
              {values.title.length}/200 ký tự
            </p>
            <ErrorMessage name="title" component="div" className="text-red-500 text-xs sm:text-sm leading-tight mt-1" />
          </div>

          {/* Mức độ */}
          <div>
            <label
              htmlFor="priority"
              className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            >
              Mức độ <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-2">
              <Field
                as="select"
                name="priority"
                id="priority"
                className="flex w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm whitespace-nowrap outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50 h-10 appearance-none pr-10"
              >
                <option value="Thông thường">Thông thường</option>
                <option value="Khẩn cấp">Khẩn cấp</option>
              </Field>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none opacity-50"
              />
            </div>
            <ErrorMessage name="priority" component="div" className="text-red-500 text-xs sm:text-sm leading-tight mt-1" />
          </div>

          {/* Mô tả chi tiết */}
          <div>
            <label
              htmlFor="description"
              className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            >
              Mô tả chi tiết <span className="text-red-500">*</span>
            </label>
              <Field
                name="description"
                as="textarea"
                id="description"
                rows={5}
                placeholder="Mô tả chi tiết vấn đề"
                autoComplete="off"
                className={`flex field-sizing-content min-h-16 w-full rounded-md border bg-gray-100 px-3 py-2 sm:py-2.5 text-sm sm:text-base outline-none disabled:cursor-not-allowed disabled:opacity-50 mt-2 resize-none ${
                  values.description.length > 2000 || (values.description && !/^[a-zA-Z0-9\sÀ-ỹ,.\-/:()!?\n]*$/.test(values.description))
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                }`}
              />
            <p className={`text-xs sm:text-sm mt-1 flex items-center ${
              values.description.length > 2000 ? 'text-red-500 font-medium' : 'text-gray-500'
            }`}>
              {values.description.length}/2000 ký tự
            </p>
            <ErrorMessage
              name="description"
              component="div"
              className="text-red-500 text-xs sm:text-sm leading-tight mt-1"
            />
          </div>

          {/* Địa điểm */}
          <div>
            <label
              htmlFor="location"
              className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            >
              Địa điểm <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-2">
              <MapPin
                size={16}
                className={`absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none sm:w-[18px] sm:h-[18px] ${
                  values.location.length > 255 || !/^[a-zA-Z0-9\sÀ-ỹ,.\-/]*$/.test(values.location)
                    ? 'text-red-400'
                    : 'text-gray-400'
                }`}
              />
              <Field
                name="location"
                as="input"
                type="text"
                id="location"
                placeholder="Nhập địa chỉ"
                autoComplete="off"
                className={`flex h-10 w-full min-w-0 rounded-md border bg-gray-100 px-3 py-2 sm:py-2.5 text-sm sm:text-base outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 pl-9 sm:pl-10 ${
                  values.location.length > 255 || (values.location && !/^[a-zA-Z0-9\sÀ-ỹ,.\-/]*$/.test(values.location))
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                }`}
              />
            </div>
            <p className={`text-xs sm:text-sm mt-1 flex items-center ${
              values.location.length > 255 ? 'text-red-500 font-medium' : 'text-gray-500'
            }`}>
              {values.location.length}/255 ký tự
            </p>
            <ErrorMessage name="location" component="div" className="text-red-500 text-xs sm:text-sm leading-tight mt-1" />
          </div>

          {/* Hình ảnh */}
          <div>
            <label className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
              Hình ảnh <span className="text-red-500">*</span>
            </label>
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                multiple
                id="images"
                className="hidden"
                onChange={(e) => handleImageChange(e, setFieldValue, values.images)}
              />
              <label
                htmlFor="images"
                className={`flex items-center justify-center gap-2 w-full p-4 sm:p-6 border-2 rounded-xl cursor-pointer transition-all ${
                  errors.images && touched.images
                    ? 'border-red-500 hover:border-red-600 bg-red-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <Camera size={20} className={`sm:w-6 sm:h-6 ${errors.images && touched.images ? 'text-red-500' : 'text-gray-500'}`} />
                <span className={`text-sm sm:text-base ${errors.images && touched.images ? 'text-red-600' : 'text-gray-600'}`}>
                  Thêm ảnh ({values.images.length}/5)
                </span>
              </label>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">Mỗi file tối đa 3MB</p>
            </div>

            {/* Image Preview */}
            {values.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 transition-all duration-200 ease-in-out">
                {values.images.map((file, index) => (
                  <div key={index} className="relative group">
                    <div 
                      className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 cursor-pointer"
                      onClick={() => setSelectedImage(URL.createObjectURL(file))}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index, setFieldValue, values.images)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <ErrorMessage name="images" component="div" className="text-red-500 text-xs sm:text-sm leading-tight mt-1" />
          </div>

          {/* Video (Tùy chọn) */}
          <div>
            <label className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
              Video <span className="text-gray-500">(Tùy chọn)</span>
            </label>
            <div className="mt-2">
              <input
                type="file"
                accept=".mp4,video/mp4"
                id="video"
                className="hidden"
                onChange={(e) => handleVideoChange(e, setFieldValue)}
              />
              <label
                htmlFor="video"
                className="flex items-center justify-center gap-2 w-full p-4 sm:p-6 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <Video size={20} className="sm:w-6 sm:h-6 text-gray-500 flex-shrink-0" />
                <span className="text-sm sm:text-base text-gray-600 truncate">
                  {values.video ? values.video.name : 'Thêm video'}
                </span>
              </label>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">Chỉ file .mp4, tối đa 150MB</p>
            </div>

            {/* Video Preview */}
            {values.video && (
              <div className="mt-4">
                <div className="relative group">
                  <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 h-64 bg-black flex items-center justify-center">
                    <video
                      src={videoUrl || undefined}
                      controls
                      preload="metadata"
                      className="w-full h-full object-contain"
                      style={{ minHeight: '256px', maxHeight: '256px' }}
                    />
                  </div>
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveVideo(setFieldValue)}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {(values.video.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}

            <ErrorMessage name="video" component="div" className="text-red-500 text-xs sm:text-sm leading-tight mt-1" />
          </div>

          

          {/* Gửi ẩn danh */}
          <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 bg-gray-50 rounded-xl gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-medium text-gray-800">Gửi ẩn danh</p>
              <p className="text-xs sm:text-sm text-gray-600">Không hiển thị thông tin cá nhân</p>
            </div>
            <Switch 
              checked={values.isAnonymous}
              onChange={(checked) => setFieldValue('isAnonymous', checked)}
              style={{
                backgroundColor: values.isAnonymous ? '#0e0e0fff' : '#d1d5db',
              }}
              className="flex-shrink-0"
            />
          </div>

          {/* Thông tin cá nhân (hiển thị khi không ẩn danh) */}
          <div 
            className={`space-y-0 border border-gray-200 rounded-xl bg-white overflow-hidden ${
              values.isAnonymous 
                ? 'max-h-0 p-0 border-0 opacity-0 pointer-events-none mt-0' 
                : 'max-h-[500px] opacity-100 p-3 sm:p-4 mt-0'
            }`}
            style={{ 
              willChange: 'max-height, opacity',
              transition: 'max-height 200ms ease-in-out, opacity 200ms ease-in-out'
            }}
          >
            <div>
              <label
                htmlFor="name"
                className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
              >
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <Field
                name="name"
                as="input"
                type="text"
                id="name"
                placeholder="Nhập họ và tên"
                autoComplete="name"
                disabled={values.isAnonymous}
                className="flex h-10 w-full min-w-0 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 sm:py-2.5 text-sm sm:text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 mt-2"
              />
              <ErrorMessage 
                name="name" 
                component="div" 
                className="text-red-500 text-xs sm:text-sm leading-tight mt-1"
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 mt-8"
              >
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <Field
                name="phone"
                as="input"
                type="tel"
                id="phone"
                placeholder="Nhập số điện thoại"
                autoComplete="tel"
                inputMode="numeric"
                disabled={values.isAnonymous}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  // Chỉ cho phép nhập số
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault()
                  }
                }}
                className={`flex h-10 w-full min-w-0 rounded-md border bg-gray-100 px-3 py-2 sm:py-2.5 text-sm sm:text-base outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 mt-2 ${
                  !values.isAnonymous && values.phone && (!/^[0-9]*$/.test(values.phone) || values.phone.length > 10)
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                }`}
              />
              {!values.isAnonymous && values.phone && (
                <p className={`text-xs sm:text-sm mt-1 flex items-center ${
                  values.phone.length > 10 ? 'text-red-500 font-medium' : 'text-gray-500'
                }`}>
                  {values.phone.length}/10 chữ số
                </p>
              )}
              <ErrorMessage 
                name="phone" 
                component="div" 
                className="text-red-500 text-xs sm:text-sm leading-tight mt-1"
              />
            </div>
          </div>

          {/* Captcha */}
          <div className="border border-gray-200 rounded-xl bg-white p-4 sm:p-5">
            <Captcha onValidate={setIsCaptchaValid} reset={resetCaptcha} />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending || isUploadingVideo || !isCaptchaValid}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive px-4 py-3 sm:py-4 w-full h-12 sm:h-14 bg-blue-600 hover:bg-blue-700 text-base sm:text-lg text-white"
          >
            {isUploadingVideo ? 'Đang gửi...' : isPending ? 'Đang gửi...' : 'Gửi phản ánh'}
          </button>
        </Form>
        )
      }}
    </Formik>
    </>
  )
}
