import React, { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Camera, MapPin, ChevronDown, CheckCircle2, X, Copy, Check } from 'lucide-react'
import { useReportCategories } from '../../features/report-categories'
import { useCreateReport } from '../../features/reports'

interface SendReportFormValues {
  category: string
  title: string
  description: string
  images: File[]
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
    .required('Tiêu đề là bắt buộc'),
  description: Yup.string()
    .max(2000, 'Mô tả không được vượt quá 2000 ký tự')
    .required('Mô tả là bắt buộc'),
  images: Yup.array()
    .max(5, 'Chỉ được tải lên tối đa 5 hình ảnh')
    .test('fileSize', 'Mỗi file tối đa 3MB', (files) => {
      if (!files) return true
      return files.every((file: any) => file.size <= 3 * 1024 * 1024)
    }),
  location: Yup.string().required('Địa điểm là bắt buộc'),
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
        .matches(/^[0-9]{10}$/, 'Số điện thoại phải có 10 chữ số')
        .required('Số điện thoại là bắt buộc khi không gửi ẩn danh'),
    otherwise: (schema) => schema.notRequired(),
  }),
})

export const SendReportForm: React.FC = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [trackingCode, setTrackingCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const { mutate: createReport, isPending } = useCreateReport()

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
    location: '',
    priority: 'THONG_THUONG',
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
      alert('Chỉ được tải lên tối đa 5 hình ảnh')
      return
    }

    const oversizedFiles = newFiles.filter((file) => file.size > 3 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      alert('Mỗi file tối đa 3MB')
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

  const handleSubmit = (values: SendReportFormValues, { resetForm }: any) => {
    const requestData = {
      idLinhVucPhanAnh: values.category,
      tieuDe: values.title,
      moTa: values.description,
      viTri: values.location,
      mucDo: values.priority,
      tenNguoiPhanAnh: values.isAnonymous ? undefined : values.name,
      soDienThoaiNguoiPhanAnh: values.isAnonymous ? undefined : values.phone,
    }

    createReport(
      { data: requestData, files: values.images },
      {
        onSuccess: (data) => {
          console.log('API Response:', data)
          console.log('Mã phản ánh:', data.ma_phan_anh)
          setTrackingCode(data.ma_phan_anh || '')
          setShowSuccessModal(true)
          resetForm()
        },
        onError: (error: any) => {
          console.error('Submit error:', error)
          alert(error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi gửi phản ánh')
        },
      }
    )
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
            >
              <X size={24} />
            </button>
            
            {/* Image */}
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300">
            {/* Close button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Success icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle2 size={48} className="text-green-600" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Gửi thành công!</h3>
              <p className="text-gray-600 mb-4">
                Phản ánh của bạn đã được tiếp nhận. Chúng tôi sẽ xem xét và phản hồi sớm nhất.
              </p>

              {/* Tracking Code */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Mã tra cứu của bạn:</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-2xl font-bold text-blue-600">{trackingCode}</code>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Sao chép mã"
                  >
                    {copied ? (
                      <Check size={20} className="text-green-600" />
                    ) : (
                      <Copy size={20} className="text-blue-600" />
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
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
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
    >
      {({ values, setFieldValue }) => (
        <Form className="space-y-6">
          {/* Loại phản ánh */}
          <div>
            <label
              htmlFor="category"
              className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            >
              Loại phản ánh <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-2">
              <Field
                as="select"
                name="category"
                id="category"
                disabled={isLoadingCategories}
                className="border-input data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 h-9 appearance-none pr-10"
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
            <ErrorMessage name="category" component="div" className="text-red-500 text-sm mt-1" />
          </div>

          {/* Tiêu đề */}
          <div>
            <label
              htmlFor="title"
              className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            >
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <Field
              name="title"
              id="title"
              type="text"
              placeholder="Nhập tiêu đề phản ánh (tối đa 200 ký tự)"
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex w-full rounded-md border bg-input-background px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">{values.title.length}/200 ký tự</p>
            <ErrorMessage name="title" component="div" className="text-red-500 text-sm mt-1" />
          </div>

          {/* Mức độ */}
          <div>
            <label
              htmlFor="priority"
              className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            >
              Mức độ <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-2">
              <Field
                as="select"
                name="priority"
                id="priority"
                className="border-input data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 h-9 appearance-none pr-10"
              >
                <option value="THONG_THUONG">Thông thường</option>
                <option value="KHAN_CAP">Khẩn cấp</option>
              </Field>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none opacity-50"
              />
            </div>
            <ErrorMessage name="priority" component="div" className="text-red-500 text-sm mt-1" />
          </div>

          {/* Mô tả chi tiết */}
          <div>
            <label
              htmlFor="description"
              className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            >
              Mô tả chi tiết <span className="text-red-500">*</span>
            </label>
            <Field
              name="description"
              as="textarea"
              id="description"
              rows={5}
              placeholder="Mô tả chi tiết vấn đề (tối đa 2000 ký tự)"
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-input-background px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm mt-2 resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">{values.description.length}/2000 ký tự</p>
            <ErrorMessage
              name="description"
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </div>

          {/* Hình ảnh */}
          <div>
            <label className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
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
                className="flex items-center justify-center gap-2 w-full p-6 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <Camera size={24} className="text-gray-500" />
                <span className="text-gray-600">Thêm ảnh (0/5)</span>
              </label>
              <p className="text-sm text-gray-500 mt-2">Mỗi file tối đa 3MB</p>
            </div>

            {/* Image Preview */}
            {values.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
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

            <ErrorMessage name="images" component="div" className="text-red-500 text-sm mt-1" />
          </div>

          {/* Hình ảnh/Video (Tùy chọn) */}
          <div>
            <label className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
              Video <span className="text-gray-500">(Tùy chọn)</span>
            </label>
            <div className="mt-2">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                id="optional-media"
                className="hidden"
              />
              <label
                htmlFor="optional-media"
                className="flex items-center justify-center gap-2 w-full p-6 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <Camera size={24} className="text-gray-500" />
                <span className="text-gray-600">Thêm video</span>
              </label>
              <p className="text-sm text-gray-500 mt-2">Mỗi file tối đa 3MB</p>
            </div>
          </div>

          {/* Địa điểm */}
          <div>
            <label
              htmlFor="location"
              className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            >
              Địa điểm <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-2">
              <MapPin
                size={18}
                className="absolute left-3 top-3 text-gray-400 pointer-events-none"
              />
              <Field
                name="location"
                as="input"
                type="text"
                id="location"
                placeholder="Nhập địa chỉ hoặc khu phố"
                className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive pl-10"
              />
            </div>
            <ErrorMessage name="location" component="div" className="text-red-500 text-sm mt-1" />
          </div>

          {/* Gửi ẩn danh */}
          <div className="flex items-center justify-between p-4 border border-gray-200 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-gray-800">Gửi ẩn danh</p>
              <p className="text-sm text-gray-600">Không hiển thị thông tin cá nhân</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={values.isAnonymous}
              data-state={values.isAnonymous ? 'checked' : 'unchecked'}
              onClick={() => setFieldValue('isAnonymous', !values.isAnonymous)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-all ${
                values.isAnonymous
                  ? 'bg-gray-800 border-gray-800'
                  : 'bg-gray-300 border-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  values.isAnonymous ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Thông tin cá nhân (hiển thị khi không ẩn danh) */}
          {!values.isAnonymous && (
            <div className="space-y-4 p-4 border border-gray-200 rounded-xl bg-white">
              <div>
                <label
                  htmlFor="name"
                  className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                >
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <Field
                  name="name"
                  as="input"
                  type="text"
                  id="name"
                  placeholder="Nhập họ và tên"
                  className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive mt-2"
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                >
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <Field
                  name="phone"
                  as="input"
                  type="tel"
                  id="phone"
                  placeholder="Nhập số điện thoại"
                  className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive mt-2"
                />
                <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1" />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive text-primary-foreground px-4 py-2 has-[>svg]:px-3 w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg"
          >
            {isPending ? 'Đang gửi...' : 'Gửi phản ánh'}
          </button>
        </Form>
      )}
    </Formik>
    </>
  )
}
