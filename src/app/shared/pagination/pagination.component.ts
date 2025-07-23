import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from "@angular/core"
import { PaginatedResponse, PaginationService } from "src/app/service/pagination.service"

@Component({
  selector: "app-pagination",
  templateUrl: "./pagination.component.html",
  styleUrls: ["./pagination.component.scss"],
})
export class PaginationComponent implements OnInit, OnChanges {
  @Input() paginationData: PaginatedResponse<any> = {
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPage: 0,
    hasNextPage: false,
  }

  @Input() showInfo = true
  @Input() showLimitSelector = true
  @Input() limitOptions: number[] = [10, 20, 50, 100]
  @Input() maxVisiblePages = 5

  @Output() pageChange = new EventEmitter<number>()
  @Output() limitChange = new EventEmitter<number>()

  paginationInfo: any = {}

  constructor(private paginationService: PaginationService) {}

  ngOnInit(): void {
    this.updatePaginationInfo()
  }

  ngOnChanges(): void {
    this.updatePaginationInfo()
  }

  updatePaginationInfo(): void {
    this.paginationInfo = this.paginationService.calculatePaginationInfo(
      this.paginationData.page,
      this.paginationData.totalPage,
      this.paginationData.limit,
      this.paginationData.total,
    )
  }

  onPageClick(page: number): void {
    if (page !== this.paginationData.page && page >= 1 && page <= this.paginationData.totalPage) {
      this.pageChange.emit(page)
    }
  }

  onLimitChange(event: Event): void {
    const target = event.target as HTMLSelectElement
    const limit = Number.parseInt(target.value, 10)
    if (limit !== this.paginationData.limit) {
      this.limitChange.emit(limit)
    }
  }

  goToFirstPage(): void {
    if (this.paginationData.page > 1) {
      this.pageChange.emit(1)
    }
  }

  goToLastPage(): void {
    if (this.paginationData.page < this.paginationData.totalPage) {
      this.pageChange.emit(this.paginationData.totalPage)
    }
  }

  goToPreviousPage(): void {
    if (this.paginationData.page > 1) {
      this.pageChange.emit(this.paginationData.page - 1)
    }
  }

  goToNextPage(): void {
    if (this.paginationData.hasNextPage) {
      this.pageChange.emit(this.paginationData.page + 1)
    }
  }
}
