import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { List, Tag, Space, Spin, Card, Tooltip, Button } from "antd";
import { CalendarOutlined, SearchOutlined } from "@ant-design/icons";
import { useNewsList } from "../../features/news";
import { useNewsCategoryCounts } from "../../features/news-categories";
import { resolveToAbsoluteUrl } from "../../utils/url";

const CategoryButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  count: number;
}> = ({ label, isActive, onClick, count }) => {
  return (
    <Tooltip title={label.length > 50 ? label : ""} placement="top">
      <button
        onClick={onClick}
        className={`
          flex items-center px-4 py-2 rounded-lg border transition-colors max-w-[300px]
          ${
            isActive
              ? "bg-blue-600 text-white border-blue-600 font-semibold"
              : "bg-white text-gray-800 font-normal border-gray-300 hover:text-blue-600 hover:border-blue-600"
          }
        `}
      >
        <span className="truncate mr-1">{label}</span>
        <span className={isActive ? "text-blue-100" : "text-gray-500"}>
          ({count})
        </span>
      </button>
    </Tooltip>
  );
};

export const NewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get("category") || "all";
  const searchFromUrl = searchParams.get("search") || "";
  const [search, setSearch] = useState(searchFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(searchFromUrl);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState(categoryFromUrl);
  const pageSize = 10;
  const [showAllCategories, setShowAllCategories] = useState(false);

  const { counts: categoryCounts, isLoading: isLoadingCounts } =
    useNewsCategoryCounts();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const category = searchParams.get("category") || "all";
    const searchQuery = searchParams.get("search") || "";
    setActiveTab(category);
    setSearch(searchQuery);
  }, [searchParams]);

  const displayCategories = useMemo(() => {
    const merged = categoryCounts
      .filter((item) => item.tong_tin_tuc > 0)
      .map((item) => ({
        id: item.id,
        ten_danh_muc: item.ten_danh_muc,
        tong_tin_tuc: item.tong_tin_tuc,
      }));

    return merged.sort((a, b) => {
      if (a.tong_tin_tuc !== b.tong_tin_tuc) {
        return b.tong_tin_tuc - a.tong_tin_tuc;
      }
      return a.ten_danh_muc.localeCompare(b.ten_danh_muc);
    });
  }, [categoryCounts]);

  const visibleCategories = useMemo(() => {
    if (showAllCategories) return displayCategories;
    return displayCategories.slice(0, 5);
  }, [displayCategories, showAllCategories]);

  const hasMoreCategories = displayCategories.length > 5;

  const totalNewsCount = useMemo(
    () =>
      displayCategories.reduce(
        (sum, category) => sum + (category.tong_tin_tuc || 0),
        0
      ),
    [displayCategories]
  );

  const { newsList, pagination, isLoading } = useNewsList({
    page,
    size: pageSize,
    isActive: true,
    search: debouncedSearch || undefined,
    idDanhMuc: activeTab !== "all" ? activeTab : undefined,
  });

  const countMap = useMemo(() => {
    const map: { [key: string]: number } = {};

    displayCategories.forEach((item) => {
      map[item.id] = item.tong_tin_tuc || 0;
    });

    map["all"] = totalNewsCount;
    return map;
  }, [displayCategories, totalNewsCount]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleSearch = (value: string) => {
    setDebouncedSearch(value);
    setPage(1);
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    setSearchParams(params);
  };

  const filterButtons = useMemo(() => {
    const allButton = {
      key: "all",
      label: "Tất cả",
      count: countMap["all"] || 0,
    };
    const categoryButtons = visibleCategories.map((category) => ({
      key: category.id,
      label: category.ten_danh_muc,
      count: countMap[category.id] || 0,
    }));
    return [allButton, ...categoryButtons];
  }, [visibleCategories, countMap]);

  const handleLoadMoreCategories = () => {
    setShowAllCategories(true);
  };

  useEffect(() => {
    if (activeTab === "all") return;
    const exists = displayCategories.some((category) => category.id === activeTab);
    if (!exists && displayCategories.length > 0) {
      setActiveTab("all");
      const params = new URLSearchParams(searchParams);
      params.delete("category");
      setSearchParams(params);
    }
  }, [activeTab, displayCategories, searchParams, setSearchParams]);

  return (
    <div className="py-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card
          variant="borderless"
          style={{
            borderRadius: "8px",
            boxShadow:
              "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
          }}
        >
          <div className="mb-6">
            <h2 className="text-2xl mb-1">Tin tức & Thông báo</h2>
            <p className="text-gray-600">
              Cập nhật thông tin mới nhất từ phường
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm tin tức..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(search);
                  }
                }}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm"
              />
              <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 mb-4">
            {isLoadingCounts ? (
              <Spin />
            ) : (
              filterButtons.map((filter) => (
                <CategoryButton
                  key={filter.key}
                  label={filter.label}
                  isActive={activeTab === filter.key}
                  count={filter.count}
                  onClick={() => {
                    setActiveTab(filter.key);
                    setPage(1);
                    const params = new URLSearchParams(searchParams);
                    if (filter.key !== "all") {
                      params.set("category", filter.key);
                    } else {
                      params.delete("category");
                    }
                    setSearchParams(params);
                  }}
                />
              ))
            )}
          </div>

          {hasMoreCategories && (
            <div className="mb-6">
              <Button
                type="link"
                onClick={handleLoadMoreCategories}
                disabled={showAllCategories}
              >
                {showAllCategories ? "Đã hiển thị tất cả" : "+ Xem thêm danh mục"}
              </Button>
            </div>
          )}

          {isLoading && page === 1 ? (
            <div className="flex justify-center py-12">
              <Spin size="large" />
            </div>
          ) : (
            <List
              itemLayout="vertical"
              size="large"
              pagination={{
                current: page,
                pageSize: pageSize,
                total: pagination?.totalItems || 0,
                onChange: (newPage) => setPage(newPage),
                showSizeChanger: false,
              }}
              dataSource={newsList}
              loading={isLoading}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  className="!border-b !border-gray-200 hover:bg-gray-50 transition-colors !px-0 cursor-pointer"
                  onClick={() => navigate(`/news/${item.id}`)}
                >
                  <div className="flex gap-4 min-w-0 w-full">
                    {/* Image on the left */}
                    {item.url_anh_dai_dien && (
                      <div className="relative flex-shrink-0">
                        <img
                          width={140}
                          height={100}
                          alt={item.tieu_de}
                          src={resolveToAbsoluteUrl(item.url_anh_dai_dien)}
                          className="rounded-lg object-cover"
                          style={{ width: 140, height: 100 }}
                        />
                        <Tag
                          color="blue"
                          className="absolute top-1 left-1 text-xs line-clamp-2"
                          style={{
                            maxWidth: "calc(100% - 0.5rem)",
                            wordBreak: "break-all",
                            whiteSpace: "normal",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {item.danh_muc_tin_tuc.ten_danh_muc}
                        </Tag>
                      </div>
                    )}

                    {/* Content on the right */}
                    <div className="flex-1 min-w-0 overflow-hidden w-0">
                      <h3 className="text-base font-semibold text-gray-900 hover:text-blue-600 mb-2 line-clamp-2 break-words overflow-hidden">
                        {item.tieu_de}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3 break-words overflow-hidden">
                        {stripHtml(item.noi_dung).substring(0, 150)}...
                      </p>
                      <div className="flex flex-col gap-2 text-xs text-gray-500">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <Space size={4} className="flex-shrink-0">
                            <CalendarOutlined />
                            <span className="whitespace-nowrap">
                              {formatDate(item.thoi_gian_tao)}
                            </span>
                          </Space>
                          {item.tac_gia && (
                            <span className="break-words">
                              Tác giả: {item.tac_gia}
                            </span>
                          )}
                        </div>
                        <span className="text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap self-end">
                          Đọc thêm
                        </span>
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>
    </div>
  );
};
