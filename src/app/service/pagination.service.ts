import { Injectable } from "@angular/core"

export interface PaginationParams {
  page: number
  limit: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  [key: string]: any
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPage: number
  hasNextPage: boolean
}

export interface PaginationInfo {
  showingText: string
  pages: number[]
  startItem: number
  endItem: number
}

@Injectable({
  providedIn: "root",
})
export class PaginationService {
  constructor() {}

  buildQueryParams(params: any): string {
    const queryParams = new URLSearchParams()

    Object.keys(params).forEach((key) => {
      const value = params[key]
      if (value !== null && value !== undefined && value !== "") {
        queryParams.append(key, value.toString())
      }
    })

    return queryParams.toString()
  }

  calculatePaginationInfo(
    currentPage: number,
    totalPages: number,
    limit: number,
    total: number,
    maxVisiblePages = 5,
  ): PaginationInfo {
    const startItem = (currentPage - 1) * limit + 1
    const endItem = Math.min(currentPage * limit, total)

    const showingText = total > 0 ? `Showing ${startItem}-${endItem} of ${total} results` : "No results found"

    const pages = this.generatePageNumbers(currentPage, totalPages, maxVisiblePages)

    return {
      showingText,
      pages,
      startItem,
      endItem,
    }
  }

  generatePageNumbers(currentPage: number, totalPages: number, maxVisible = 5): number[] {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: number[] = []
    const halfVisible = Math.floor(maxVisible / 2)

    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(totalPages, currentPage + halfVisible)

    // Adjust if we're near the beginning
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisible)
    }

    // Adjust if we're near the end
    if (currentPage > totalPages - halfVisible) {
      startPage = Math.max(1, totalPages - maxVisible + 1)
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1)
      if (startPage > 2) {
        pages.push(-1) // -1 represents ellipsis
      }
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(-1) // -1 represents ellipsis
      }
      pages.push(totalPages)
    }

    return pages
  }

  getDefaultPaginationParams(): PaginationParams {
    return {
      page: 1,
      limit: 10,
      search: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    }
  }

  validatePaginationParams(params: Partial<PaginationParams>): PaginationParams {
    const defaults = this.getDefaultPaginationParams()

    return {
      page: Math.max(1, params.page || defaults.page),
      limit: Math.min(100, Math.max(1, params.limit || defaults.limit)),
      search: params.search || defaults.search,
      sortBy: params.sortBy || defaults.sortBy,
      sortOrder: params.sortOrder === "asc" || params.sortOrder === "desc" ? params.sortOrder : defaults.sortOrder,
    }
  }

  createEmptyPaginatedResponse<T>(): PaginatedResponse<T> {
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPage: 0,
      hasNextPage: false,
    }
  }
}
