export interface Customer {
  customerId: string
  customerName: string
}

export interface CustomerTable extends Customer {
  status: string
  remark: string
}
