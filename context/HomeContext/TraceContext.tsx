'use client'
// import { playPopSound } from '@/lib/sound'

import { createContext, useContext, ReactNode } from 'react'

const TraceContext = createContext<null>(null)

interface TraceProviderProps {
  children: ReactNode
}

export const TraceProvider = ({ children }: TraceProviderProps) => {
  return <TraceContext.Provider value={null}>{children}</TraceContext.Provider>
}

export const useTraceContext = () => useContext(TraceContext)
