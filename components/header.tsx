"use client"

import { Menu, Sparkles, Triangle } from "lucide-react"
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
          <Sparkles className="h-5 w-5 text-purple-500" />
          <span className="font-semibold">/</span>
          <span className="font-semibold">Squeel</span>
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
        
        <Button variant="default" className="bg-black text-white">
          <Triangle className="h-4 w-4 mr-2 fill-white" />
          Deploy with Vercel
        </Button>
        <Button variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
          Login
        </Button>
      </div>
    </header>
  )
}
