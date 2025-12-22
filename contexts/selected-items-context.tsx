"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'

interface SelectedItemsContextType {
  selectedItemIds: Set<number>
  toggleItem: (itemId: number) => void
  clearSelection: () => void
  isSelected: (itemId: number) => boolean
}

const SelectedItemsContext = createContext<SelectedItemsContextType | undefined>(undefined)

export const SelectedItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set())

  const toggleItem = useCallback((itemId: number) => {
    setSelectedItemIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedItemIds(new Set())
  }, [])

  const isSelected = useCallback((itemId: number) => {
    return selectedItemIds.has(itemId)
  }, [selectedItemIds])

  return (
    <SelectedItemsContext.Provider
      value={{
        selectedItemIds,
        toggleItem,
        clearSelection,
        isSelected,
      }}
    >
      {children}
    </SelectedItemsContext.Provider>
  )
}

export const useSelectedItems = () => {
  const context = useContext(SelectedItemsContext)
  if (context === undefined) {
    throw new Error('useSelectedItems must be used within a SelectedItemsProvider')
  }
  return context
}






