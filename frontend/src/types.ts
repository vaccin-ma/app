export type RegionStatus = 'green' | 'yellow' | 'red'

export interface RegionData {
  id: number
  name: string
  population: number
  births: number
  coverage: number
  status: RegionStatus
  stock?: number
}
