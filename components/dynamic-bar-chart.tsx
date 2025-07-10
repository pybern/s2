"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"

interface DynamicBarChartProps {
  data: any[]
}

function detectChartableData(data: any[]) {
  if (!data || data.length === 0) return null

  const firstRow = data[0]
  const keys = Object.keys(firstRow)
  
  // Find potential category column (string/text values)
  const categoryKey = keys.find(key => {
    const value = firstRow[key]
    return typeof value === 'string' && isNaN(Number(value))
  })

  // Find numeric columns for values
  const numericKeys = keys.filter(key => {
    const value = firstRow[key]
    return key !== categoryKey && !isNaN(Number(value)) && value !== null
  })

  if (!categoryKey || numericKeys.length === 0) {
    return null
  }

  return {
    categoryKey,
    valueKeys: numericKeys.slice(0, 5) // Limit to 5 series for readability
  }
}

function generateChartConfig(valueKeys: string[]): ChartConfig {
  const colors = [
    "#2563eb", "#60a5fa", "#34d399", "#fbbf24", "#f87171", 
    "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"
  ]
  
  const config: ChartConfig = {}
  
  valueKeys.forEach((key, index) => {
    config[key] = {
      label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      color: colors[index % colors.length]
    }
  })
  
  return config
}

function transformData(data: any[], categoryKey: string, valueKeys: string[]) {
  return data.map(row => {
    const transformed: any = {}
    transformed[categoryKey] = row[categoryKey]
    
    valueKeys.forEach(key => {
      const value = row[key]
      transformed[key] = value ? parseFloat(value) : 0
    })
    
    return transformed
  })
}

export function DynamicBarChart({ data }: DynamicBarChartProps) {
  const chartStructure = detectChartableData(data)
  
  if (!chartStructure) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No chartable data detected</p>
        <p className="text-xs mt-1">Data should contain at least one text column (category) and one numeric column (value)</p>
      </div>
    )
  }

  const { categoryKey, valueKeys } = chartStructure
  const chartConfig = generateChartConfig(valueKeys)
  const chartData = transformData(data, categoryKey, valueKeys)

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        <span className="font-medium">Chart:</span> {categoryKey.replace(/_/g, ' ')} vs {valueKeys.map(k => k.replace(/_/g, ' ')).join(', ')}
      </div>
      
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={categoryKey} 
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => [
              typeof value === 'number' ? value.toLocaleString() : value,
              chartConfig[name as keyof typeof chartConfig]?.label || name
            ]}
            labelFormatter={(label) => `${categoryKey.replace(/_/g, ' ')}: ${label}`}
          />
          <Legend />
          {valueKeys.map((key) => (
            <Bar
              key={key}
              dataKey={key}
              fill={`var(--color-${key})`}
              radius={4}
              name={String(chartConfig[key]?.label || key)}
            />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  )
}
