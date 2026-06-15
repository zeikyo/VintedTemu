export type SaleStatus = 'vendu' | 'envoyé' | 'payé' | 'remboursé' | 'offert'

export interface Product {
  id: string
  user_id: string
  name: string
  category: string
  size: string | null
  color: string | null
  purchase_platform: string
  purchase_link: string | null
  total_purchase_price: number
  quantity_bought: number
  unit_cost: number
  shipping_cost: number
  packaging_cost: number
  stock_remaining: number
  photo_url: string | null
  created_at: string
}

export interface Sale {
  id: string
  user_id: string
  product_id: string
  sale_platform: string
  sale_price: number
  discount: number
  fees: number
  shipping_paid_by_me: number
  packaging_cost: number
  net_profit: number
  roi: number
  sale_date: string
  status: SaleStatus
}

export interface Expense {
  id: string
  user_id: string
  name: string
  amount: number
  category: string
  date: string
  note: string | null
}

export interface Platform {
  id: string
  user_id: string
  name: string
  type: 'achat' | 'vente' | 'les deux'
  created_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  created_at: string
}

export type ProductInput = Omit<Product, 'id' | 'user_id' | 'unit_cost' | 'created_at'>
export type SaleInput = Omit<Sale, 'id' | 'user_id' | 'net_profit' | 'roi'>
export type ExpenseInput = Omit<Expense, 'id' | 'user_id'>

export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Product>
        Relationships: []
      }
      sales: {
        Row: Sale
        Insert: Omit<Sale, 'id'> & { id?: string }
        Update: Partial<Sale>
        Relationships: []
      }
      expenses: {
        Row: Expense
        Insert: Omit<Expense, 'id'> & { id?: string }
        Update: Partial<Expense>
        Relationships: []
      }
      platforms: {
        Row: Platform
        Insert: Omit<Platform, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Platform>
        Relationships: []
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Category>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
