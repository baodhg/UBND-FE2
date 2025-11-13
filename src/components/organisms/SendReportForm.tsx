import React from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Camera, MapPin, ChevronDown } from 'lucide-react'

interface SendReportFormValues {
  category: string
  description: string
  images: File[]
  location: string
  isAnonymous: boolean
  name: string
  phone: string
}

const SendReportSchema = Yup.object().shape({
  category: Yup.string().required('Loại phản ánh là bắt buộc'),
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
  const initialValues: SendReportFormValues = {
    category: '',
    description: '',
    images: [],
    location: '',
    isAnonymous: false,
    name: '',
    phone: '',
  }

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 5) {
      alert('Chỉ được tải lên tối đa 5 hình ảnh')
      return
    }

    const oversizedFiles = files.filter((file) => file.size > 3 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      alert('Mỗi file tối đa 3MB')
      return
    }

    setFieldValue('images', files)
  }

  const handleSubmit = (values: SendReportFormValues) => {
    console.log('Form values:', values)
    alert('Gửi phản ánh thành công!')
  }

  const categories = [
    'Cơ sở hạ tầng',
    'Môi trường',
    'An ninh trật tự',
    'Giao thông',
    'Giáo dục',
    'Y tế',
    'Khác',
  ]

  return (
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
                className="border-input data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 h-9 appearance-none pr-10"
              >
                <option value="">Chọn loại phản ánh</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
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

          {/* Hình ảnh/Video */}
          <div>
            <label className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
              Hình ảnh/Video <span className="text-gray-500">(Tùy chọn)</span>
            </label>
            <div className="mt-2">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                id="images"
                className="hidden"
                onChange={(e) => handleImageChange(e, setFieldValue)}
              />
              <label
                htmlFor="images"
                className="flex items-center justify-center gap-2 w-full p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <Camera size={20} className="text-gray-600" />
                <span className="text-gray-700">
                  Thêm ảnh/video ({values.images.length}/5)
                </span>
              </label>
              <p className="text-sm text-gray-500 mt-1">Mỗi file tối đa 3MB</p>
            </div>
            <ErrorMessage name="images" component="div" className="text-red-500 text-sm mt-1" />
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
              <p className="text-gray-800">Gửi ẩn danh</p>
              <p className="text-sm text-gray-600">Không hiển thị thông tin cá nhân</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={values.isAnonymous}
              onClick={() => setFieldValue('isAnonymous', !values.isAnonymous)}
              className={`peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 ${
                values.isAnonymous
                  ? 'bg-blue-600 data-[state=checked]:bg-primary'
                  : 'bg-gray-300 data-[state=unchecked]:bg-switch-background dark:data-[state=unchecked]:bg-input/80'
              }`}
            >
              <span
                className={`pointer-events-none block size-4 rounded-full ring-0 transition-transform bg-white dark:data-[state=unchecked]:bg-card-foreground dark:data-[state=checked]:bg-primary-foreground ${
                  values.isAnonymous
                    ? 'translate-x-[calc(100%-2px)]'
                    : 'translate-x-0'
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
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive text-primary-foreground px-4 py-2 has-[>svg]:px-3 w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg"
          >
            Gửi phản ánh
          </button>
        </Form>
      )}
    </Formik>
  )
}
