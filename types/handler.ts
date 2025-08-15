export type Handler = {
  id: string
  name: string
  code?: string
  email?: string
  phone?: string
  address?: string
  isActive?: boolean
}

export type HandlerSelectionEvent = {
  handlerId: string
  handlerName: string
}
