import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import toast from 'react-hot-toast'
import { demoCategories, demoPlatforms } from '../data/demo'
import { calculateSale, calculateUnitCost } from '../lib/calculations'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { uid } from '../lib/utils'
import type {
  Category,
  Expense,
  ExpenseInput,
  Platform,
  Product,
  ProductInput,
  Sale,
  SaleInput,
} from '../types'
import { useAuth } from './AuthContext'

interface DataContextValue {
  products: Product[]
  sales: Sale[]
  expenses: Expense[]
  platforms: Platform[]
  categories: Category[]
  loading: boolean
  addProduct: (input: ProductInput) => Promise<Product>
  updateProduct: (id: string, input: Partial<ProductInput>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  addSale: (input: SaleInput) => Promise<Sale>
  updateSaleStatus: (id: string, status: Sale['status']) => Promise<void>
  deleteSale: (id: string) => Promise<void>
  addExpense: (input: ExpenseInput) => Promise<Expense>
  deleteExpense: (id: string) => Promise<void>
  importProducts: (items: ProductInput[]) => Promise<void>
  refresh: () => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)
const storageKey = 'stockpilot-user-data-v2'

interface StoredData {
  products: Product[]
  sales: Sale[]
  expenses: Expense[]
}

function getDemoData(): StoredData {
  try {
    const saved = localStorage.getItem(storageKey)
    if (saved) return JSON.parse(saved) as StoredData
  } catch {
    localStorage.removeItem(storageKey)
  }
  return { products: [], sales: [], expenses: [] }
}

function expectedStock(product: Product, sales: Sale[]) {
  const activeSales = sales.filter(
    (sale) => sale.product_id === product.id && sale.status !== 'remboursé',
  ).length
  return Math.max(0, product.quantity_bought - activeSales)
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, isDemo } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>(demoPlatforms)
  const [categories, setCategories] = useState<Category[]>(demoCategories)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    if (isDemo || !isSupabaseConfigured) {
      const data = getDemoData()
      setProducts(data.products)
      setSales(data.sales)
      setExpenses(data.expenses)
      setPlatforms(demoPlatforms)
      setCategories(demoCategories)
      setLoading(false)
      return
    }

    const [productsResult, salesResult, expensesResult, platformsResult, categoriesResult] =
      await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('sales').select('*').order('sale_date', { ascending: false }),
        supabase.from('expenses').select('*').order('date', { ascending: false }),
        supabase.from('platforms').select('*').order('name'),
        supabase.from('categories').select('*').order('name'),
      ])

    const error =
      productsResult.error ||
      salesResult.error ||
      expensesResult.error ||
      platformsResult.error ||
      categoriesResult.error
    if (error) {
      toast.error(`Impossible de charger les données : ${error.message}`)
    } else {
      const loadedProducts = productsResult.data ?? []
      const loadedSales = salesResult.data ?? []
      const normalizedProducts = loadedProducts.map((product) => ({
        ...product,
        stock_remaining: expectedStock(product, loadedSales),
      }))
      const stockCorrections = normalizedProducts.filter((product, index) => {
        return product.stock_remaining !== loadedProducts[index].stock_remaining
      })

      if (stockCorrections.length > 0) {
        const corrections = await Promise.all(
          stockCorrections.map((product) =>
            supabase
              .from('products')
              .update({ stock_remaining: product.stock_remaining })
              .eq('id', product.id),
          ),
        )
        const correctionError = corrections.find((result) => result.error)?.error
        if (correctionError) {
          toast.error(`Impossible de corriger le stock : ${correctionError.message}`)
        }
      }

      setProducts(normalizedProducts)
      setSales(loadedSales)
      setExpenses(expensesResult.data ?? [])
      setPlatforms(platformsResult.data ?? [])
      setCategories(categoriesResult.data ?? [])
    }
    setLoading(false)
  }, [isDemo, user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if ((isDemo || !isSupabaseConfigured) && !loading && user) {
      localStorage.setItem(storageKey, JSON.stringify({ products, sales, expenses }))
    }
  }, [expenses, isDemo, loading, products, sales, user])

  const addProduct = async (input: ProductInput) => {
    if (!user) throw new Error('Utilisateur non connecté')
    const unitCost = calculateUnitCost(
      input.total_purchase_price,
      input.quantity_bought,
      input.shipping_cost,
    )
    const product: Product = {
      ...input,
      id: uid(),
      user_id: user.id,
      unit_cost: unitCost,
      created_at: new Date().toISOString(),
    }

    if (!isDemo && isSupabaseConfigured) {
      const { data, error } = await supabase.from('products').insert(product).select().single()
      if (error) throw error
      setProducts((current) => [data, ...current])
      return data
    }
    setProducts((current) => [product, ...current])
    return product
  }

  const updateProduct = async (id: string, input: Partial<ProductInput>) => {
    const current = products.find((product) => product.id === id)
    if (!current) return
    const next = { ...current, ...input }
    next.unit_cost = calculateUnitCost(
      next.total_purchase_price,
      next.quantity_bought,
      next.shipping_cost,
    )
    if (!isDemo && isSupabaseConfigured) {
      const { error } = await supabase.from('products').update(next).eq('id', id)
      if (error) throw error
    }
    setProducts((items) => items.map((product) => (product.id === id ? next : product)))
  }

  const deleteProduct = async (id: string) => {
    if (!isDemo && isSupabaseConfigured) {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
    }
    setProducts((items) => items.filter((product) => product.id !== id))
    setSales((items) => items.filter((sale) => sale.product_id !== id))
  }

  const addSale = async (input: SaleInput) => {
    if (!user) throw new Error('Utilisateur non connecté')
    const product = products.find((item) => item.id === input.product_id)
    if (!product || product.stock_remaining < 1) throw new Error('Stock insuffisant')
    const computed = calculateSale(input, product)
    const sale: Sale = { ...input, ...computed, id: uid(), user_id: user.id }

    if (!isDemo && isSupabaseConfigured) {
      const { data, error } = await supabase.from('sales').insert(sale).select().single()
      if (error) throw error
      const nextSales = [data, ...sales]
      const nextStock = expectedStock(product, nextSales)
      const { error: stockError } = await supabase
        .from('products')
        .update({ stock_remaining: nextStock })
        .eq('id', product.id)
      if (stockError) throw stockError
      setSales(nextSales)
      setProducts((items) =>
        items.map((item) =>
          item.id === product.id ? { ...item, stock_remaining: nextStock } : item,
        ),
      )
    } else {
      const nextSales = [sale, ...sales]
      const nextStock = expectedStock(product, nextSales)
      setSales(nextSales)
      setProducts((items) =>
        items.map((item) =>
          item.id === product.id ? { ...item, stock_remaining: nextStock } : item,
        ),
      )
    }
    return sale
  }

  const updateSaleStatus = async (id: string, status: Sale['status']) => {
    const currentSale = sales.find((sale) => sale.id === id)
    if (!currentSale) return
    const product = products.find((item) => item.id === currentSale.product_id)
    const nextSales = sales.map((sale) => (sale.id === id ? { ...sale, status } : sale))
    const nextStock = product ? expectedStock(product, nextSales) : null

    if (!isDemo && isSupabaseConfigured) {
      const { error } = await supabase.from('sales').update({ status }).eq('id', id)
      if (error) throw error
      if (product && nextStock !== null) {
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock_remaining: nextStock })
          .eq('id', product.id)
        if (stockError) throw stockError
      }
    }
    setSales(nextSales)
    if (product && nextStock !== null) {
      setProducts((items) =>
        items.map((item) =>
          item.id === product.id ? { ...item, stock_remaining: nextStock } : item,
        ),
      )
    }
  }

  const deleteSale = async (id: string) => {
    const sale = sales.find((item) => item.id === id)
    if (!sale) return
    const product = products.find((item) => item.id === sale.product_id)
    const nextSales = sales.filter((item) => item.id !== id)
    const nextStock = product ? expectedStock(product, nextSales) : null

    if (!isDemo && isSupabaseConfigured) {
      const { error } = await supabase.from('sales').delete().eq('id', id)
      if (error) throw error
      if (product && nextStock !== null) {
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock_remaining: nextStock })
          .eq('id', product.id)
        if (stockError) throw stockError
      }
    }
    setSales(nextSales)
    if (product && nextStock !== null) {
      setProducts((items) =>
        items.map((item) =>
          item.id === product.id ? { ...item, stock_remaining: nextStock } : item,
        ),
      )
    }
  }

  const addExpense = async (input: ExpenseInput) => {
    if (!user) throw new Error('Utilisateur non connecté')
    const expense: Expense = { ...input, id: uid(), user_id: user.id }
    if (!isDemo && isSupabaseConfigured) {
      const { data, error } = await supabase.from('expenses').insert(expense).select().single()
      if (error) throw error
      setExpenses((items) => [data, ...items])
      return data
    }
    setExpenses((items) => [expense, ...items])
    return expense
  }

  const deleteExpense = async (id: string) => {
    if (!isDemo && isSupabaseConfigured) {
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) throw error
    }
    setExpenses((items) => items.filter((expense) => expense.id !== id))
  }

  const importProducts = async (items: ProductInput[]) => {
    for (const item of items) await addProduct(item)
  }

  const value: DataContextValue = {
      products,
      sales,
      expenses,
      platforms,
      categories,
      loading,
      addProduct,
      updateProduct,
      deleteProduct,
      addSale,
      updateSaleStatus,
      deleteSale,
      addExpense,
      deleteExpense,
      importProducts,
      refresh,
    }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData doit être utilisé dans DataProvider')
  return context
}
