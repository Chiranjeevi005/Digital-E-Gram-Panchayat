'use client'

import React from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'

interface ChartProps {
  type: 'bar' | 'pie' | 'line'
  data: any
  options?: any
  height?: number
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#8b5cf6']

export default function Chart({ type, data, options, height = 300 }: ChartProps) {
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data.datasets ? data.datasets[0].data.map((value: number, index: number) => ({
            name: data.labels[index],
            value
          })) : data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey="value" 
              fill={data.datasets?.[0]?.backgroundColor || '#4f46e5'}
              name={data.datasets?.[0]?.label || 'Value'}
            >
              {data.labels?.map((entry: string, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        )
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data.datasets ? data.datasets[0].data.map((value: number, index: number) => ({
                name: data.labels[index],
                value
              })) : data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent || 0) * 100}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {(data.labels || data).map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )
      case 'line':
        return (
          <LineChart data={data.datasets ? data.labels.map((label: string, index: number) => ({
            name: label,
            value: data.datasets[0].data[index]
          })) : data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={data.datasets?.[0]?.borderColor || '#4f46e5'} 
              activeDot={{ r: 8 }} 
              name={data.datasets?.[0]?.label || 'Value'}
            />
          </LineChart>
        )
      default:
        return <div></div>
    }
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  )
}