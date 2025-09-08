// Type definitions for jsPDF-AutoTable
// Project: https://github.com/simonbengtsson/jsPDF-AutoTable
// Definitions by: Vilius Kubekaitis <https://github.com/vilkus>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module 'jspdf-autotable' {
    import { jsPDF } from 'jspdf';
  
    export interface AutoTableOptions {
      head?: any[];
      body?: any[];
      foot?: any[];
      columns?: any[];
      startY?: number;
      theme?: 'striped' | 'grid' | 'plain';
      styles?: any;
      headStyles?: any;
      footStyles?: any;
      bodyStyles?: any;
      alternateRowStyles?: any;
      columnStyles?: any;
      didDrawPage?: (data: any) => void;
      willDrawCell?: (data: any) => void;
      didDrawCell?: (data: any) => void;
      didParseCell?: (data: any) => void;
      margin?: any;
      tableWidth?: 'auto' | 'wrap' | number;
      showHead?: 'firstPage' | 'everyPage' | 'never';
      showFoot?: 'firstPage' | 'everyPage' | 'never';
      tableLineColor?: any;
      tableLineWidth?: number;
      horizontalPageBreak?: boolean;
      horizontalPageBreakRepeat?: string | number;
    }
  
    export function autoTable(doc: jsPDF, options: AutoTableOptions): void;
    
    // Add default export to match the actual module export
    export default autoTable;
  
    export interface CellHookData {
      cell: any;
      row: any;
      section: 'head' | 'body' | 'foot';
      pageNumber: number;
      settings: any;
      table: any;
      cursor: any;
    }
  
    export interface HookHandler {
      didDrawPage: (hook: (data: any) => void) => void;
      willDrawCell: (hook: (data: CellHookData) => void) => void;
      didDrawCell: (hook: (data: CellHookData) => void) => void;
      didParseCell: (hook: (data: CellHookData) => void) => void;
    }
  }