import apiClient from '../../../lib/axios'

export interface KhungGio {
    tu: string;
    den: string
}

export interface GioLamViec {
    ghi_chu: string | null;
    buoi_sang: KhungGio;
    buoi_chieu: KhungGio
}

export interface Committee {
    id: string;
    ten_don_vi: string;
    dia_chi_tru_so: string;
    so_dien_thoai: string;
    email: string;
    gio_lam_viec: GioLamViec;
    link_google_map: string | null;
    ghi_chu: string | null;
    is_active: boolean;
    is_delete: boolean;
    nguoi_tao: string;
    nguoi_cap_nhat: string | null;
    thoi_gian_tao: string;
    thoi_gian_cap_nhat: string
}

export interface GetCommitteeResponse {
    success: boolean;
    data: Committee;
    message: string;
    pagination: null
}

export const committeeApi = {
    getCommittee: async() => {
        const response = await apiClient.get<GetCommitteeResponse>('/uy-ban');
        if (!response.data.success) {
            throw new Error(response.data.message || 'Có lỗi xảy ra khi lấy thông tin ủy ban');
        }
        return response.data;
    }
}
