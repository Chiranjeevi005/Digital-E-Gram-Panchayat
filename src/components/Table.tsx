import React from 'react'

interface TableProps {
  children: React.ReactNode
  className?: string
}

interface HeadProps {
  children: React.ReactNode
  className?: string
}

interface BodyProps {
  children: React.ReactNode
  className?: string
}

interface RowProps {
  children: React.ReactNode
  className?: string
}

interface CellProps {
  children: React.ReactNode
  className?: string
}

interface HeadCellProps {
  children: React.ReactNode
  className?: string
}

const Table = ({ children, className = '' }: TableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        {children}
      </table>
    </div>
  )
}

const Head = ({ children, className = '' }: HeadProps) => {
  return (
    <thead className={`bg-gray-50 ${className}`}>
      {children}
    </thead>
  )
}

const Body = ({ children, className = '' }: BodyProps) => {
  return (
    <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
      {children}
    </tbody>
  )
}

const Row = ({ children, className = '' }: RowProps) => {
  return (
    <tr className={className}>
      {children}
    </tr>
  )
}

const HeadCell = ({ children, className = '' }: HeadCellProps) => {
  return (
    <th 
      scope="col" 
      className={`px-2 py-2 text-left text-[0.6rem] sm:text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  )
}

const Cell = ({ children, className = '' }: CellProps) => {
  return (
    <td className={`px-2 py-2 whitespace-nowrap ${className}`}>
      {children}
    </td>
  )
}

Table.Head = Head
Table.Body = Body
Table.Row = Row
Table.HeadCell = HeadCell
Table.Cell = Cell

export default Table