"use client"

import { useState, useEffect } from "react"
import { X, Play, Clock, Database, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { runSafeSql, type SqlResult } from "@/lib/utils/run-safe-sql"
import { DynamicBarChart } from "@/components/dynamic-bar-chart"
import { useConfigStore } from "@/lib/store/config" // Import the Zustand store

// interface SqlResultsDrawerProps {
//   isOpen: boolean
//   onClose: () => void
//   sqlQueries: string[]
// }

export function SqlResultsDrawer() {

  const { isDrawerOpen, closeDrawer, sqlQueries } = useConfigStore()

  const [results, setResults] = useState<{ [key: number]: SqlResult }>({})
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({})

  // Reset results and loading state when sqlQueries change
  useEffect(() => {
    setResults({})
    setLoading({})
  }, [sqlQueries])

  const executeQuery = async (query: string, index: number) => {
    setLoading(prev => ({ ...prev, [index]: true }))
    
    try {
      const result = await runSafeSql(query, {
        maxRows: 100,
        timeout: 30000
      })
      console.log(`SQL Query ${index + 1} executed:`, {
        query: query.trim(),
        result: result
      })
      setResults(prev => ({ ...prev, [index]: result }))
    } catch (error) {
      console.error(`SQL Query ${index + 1} failed:`, {
        query: query.trim(),
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
      setResults(prev => ({ 
        ...prev, 
        [index]: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      }))
    } finally {
      setLoading(prev => ({ ...prev, [index]: false }))
    }
  }

  const formatQuery = (query: string) => {
    return query.trim().replace(/\s+/g, ' ')
  }

  if (!isDrawerOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={closeDrawer}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-2/3 bg-white shadow-lg z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Database className="w-5 h-5" />
            SQL Query Results
          </h2>
          <Button variant="ghost" size="sm" onClick={closeDrawer}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {sqlQueries.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No SQL queries to display
            </div>
          ) : (
            sqlQueries.map((query, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                {/* Query Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm text-gray-600">
                    Query {index + 1}
                  </h3>
                  <Button
                    onClick={() => executeQuery(query, index)}
                    disabled={loading[index]}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Play className="w-3 h-3" />
                    {loading[index] ? 'Running...' : 'Run Query'}
                  </Button>
                </div>

                {/* Query Code */}
                <div className="bg-gray-50 rounded p-3 overflow-x-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {formatQuery(query)}
                  </pre>
                </div>

                {/* Loading State */}
                {loading[index] && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Executing query...</span>
                  </div>
                )}

                {/* Results */}
                {results[index] && (
                  <div className="space-y-3">
                    {/* Status */}
                    <div className={`flex items-center gap-2 text-sm ${
                      results[index].success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {results[index].success ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      <span>
                        {results[index].success ? 'Query executed successfully' : 'Query failed'}
                      </span>
                      {results[index].executionTime && (
                        <span className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-3 h-3" />
                          {results[index].executionTime}ms
                        </span>
                      )}
                    </div>

                    {/* Error Message */}
                    {!results[index].success && results[index].error && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-red-700 text-sm">{results[index].error}</p>
                      </div>
                    )}

                    {/* Success Results */}
                    {results[index].success && results[index].data && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>
                            {results[index].rowCount} row{results[index].rowCount !== 1 ? 's' : ''} returned
                          </span>
                        </div>
                        
                        {results[index].data!.length > 0 ? (
                          <div className="space-y-6">
                            {/* Table Results */}
                            <div className="border rounded overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead className="bg-gray-50">
                                  <tr>
                                    {Object.keys(results[index].data![0]).map((column) => (
                                      <th
                                        key={column}
                                        className="px-3 py-2 text-left font-medium text-gray-700 border-b"
                                      >
                                        {column}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {results[index].data!.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="border-b">
                                      {Object.values(row).map((value, cellIndex) => (
                                        <td
                                          key={cellIndex}
                                          className="px-3 py-2 text-gray-700"
                                        >
                                          {value === null ? (
                                            <span className="text-gray-400 italic">null</span>
                                          ) : (
                                            String(value)
                                          )}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Chart Visualization */}
                            <div className="border rounded p-4 bg-gray-50">
                              <h4 className="font-medium text-gray-800 mb-4">Data Visualization</h4>
                              <DynamicBarChart data={results[index].data!} />
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 py-4">
                            No data returned
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
