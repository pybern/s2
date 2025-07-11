"use client"

import { Menu, Sparkles, Triangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { useCollections } from "@/lib/hooks/use-collections"

interface HeaderProps {
  selectedCollectionId?: string
  onCollectionChange?: (collectionId: string) => void
}

export function Header({ selectedCollectionId, onCollectionChange }: HeaderProps) {
  const { collections, loading } = useCollections()

  const collectionOptions = [
    { value: 'all', label: 'All Collections' },
    ...collections.map(collection => ({
      value: collection.db_id,
      label: collection.name
    }))
  ]

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center space-x-2">
          <span className="font-semibold">/</span>
            <Link href="/" className="font-semibold hover:underline">Squeel</Link>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="w-64">
          <Combobox
            options={collectionOptions}
            value={selectedCollectionId || 'all'}
            onValueChange={onCollectionChange}
            placeholder={loading ? "Loading collections..." : "Select collection..."}
            searchPlaceholder="Search collections..."
            emptyText="No collections found."
          />
        </div>
        
      </div>
    </header>
  )
}
