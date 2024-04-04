export interface IMenuItem {
  id: number
  title: string
  description: string
  category: string
  price: number
  isActive: 'true' | 'false'
  created_at: string // Assuming you are using ISO 8601 format for timestamps
  updatedAt: string | null // Assuming you are using ISO 8601 format for timestamps
  category_id: number
  short_code: string | null // Assuming short_code can be nullable
}
