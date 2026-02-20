"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"

export function useSections() {
  const [sections, setSections] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("sections")
      .select("name")
      .order("name", { ascending: true })
    if (!error && data) {
      setSections(data.map((r: { name: string }) => r.name))
    } else {
      setSections([])
    }
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { sections, loading, refresh }
}
