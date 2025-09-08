import React from 'react'

interface TableProps {
  children: React.ReactNode
  className?: string
}

export default function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        {children}
      </table>
    </div>
  )
}

interface TableHeadProps {
  children: React.ReactNode
}

Table.Head = function TableHead({ children }: TableHeadProps) {
  return (
    <thead className="bg-gray-50">
      <tr>
        {children}
      </tr>
    </thead>
  )
}

interface TableHeadCellProps {
  children: React.ReactNode
  className?: string
}

Table.HeadCell = function TableHeadCell({ children, className = '' }: TableHeadCellProps) {
  return (
    <th 
      scope="col" 
      className={`px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  )
}

interface TableBodyProps {
  children: React.ReactNode
}

Table.Body = function TableBody({ children }: TableBodyProps) {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {children}
    </tbody>
  )
}

interface TableRowProps {
  children: React.ReactNode
  className?: string
}

Table.Row = function TableRow({ children, className = '' }: TableRowProps) {
  return (
    <tr className={`hover:bg-gray-50 transition-colors duration-200 ${className}`}>
      {children}
    </tr>
  )
}

interface TableCellProps {
  children: React.ReactNode
  className?: string
}

Table.Cell = function TableCell({ children, className = '' }: TableCellProps) {
  return (
    <td className={`px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap ${className}`}>
      {children}
    </td>
  )
}