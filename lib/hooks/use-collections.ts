"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/db/supabase"

export interface Collection {
  db_id: string
  name: string
  description?: string
}

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCollections = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Assuming there's a collections table - adjust the query as needed
      const { data, error } = await supabase
        .from('collections')
        .select('db_id, name, description')
        .order('name')

      if (error) {
        throw error
      }

      setCollections(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch collections')
      console.error('Error fetching collections:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCollections()
  }, [])

  return { collections, loading, error, refetch: fetchCollections }
}
