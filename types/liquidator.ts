export interface Liquidator {
  id: number
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
}

export interface LiquidatorSelectionEvent {
  liquidatorId: number
  liquidatorName: string
}
