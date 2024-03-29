'use client';

import { getLSKey } from '@/lib/data';
import { JsonObject, toInputTableId, toInputTextId } from '@/lib/types';
import { MDXComponents } from 'mdx/types';
import { ReactNode, useEffect, useRef, useState } from 'react';

export function getMdxInputComponents(
  clearInputs: boolean,
  setClearInputs: (val: boolean) => void,
  courseId: string,
  lessonId: string,
  sectionId: number,
  lessonInputsFromDB: JsonObject | null
): MDXComponents {
  function I_TEXT({
    name,
    placeholder,
    rows,
  }: {
    name: string;
    placeholder?: string;
    rows?: string;
  }) {
    const fieldId = toInputTextId(name);
    const cachedInput = localStorage.getItem(
      getLSKey(courseId, lessonId, fieldId)
    );
    const inputFromDB = lessonInputsFromDB?.[fieldId] as string;
    const defaultValue = clearInputs ? '' : cachedInput ?? inputFromDB ?? '';

    const fieldRef = useRef<HTMLTextAreaElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setClearInputs(false);
      if (localStorage)
        localStorage.setItem(
          getLSKey(courseId, lessonId, fieldId),
          e.target.value
        );
      if (fieldRef.current) {
        fieldRef.current.style.height = 'auto'; // Reset the height
        const newHeight = fieldRef.current.scrollHeight + 2;
        fieldRef.current.style.height = newHeight + 'px'; // Fit the textarea to its content
      }
    };

    useEffect(() => {
      if (fieldRef.current) {
        const newHeight = fieldRef.current.scrollHeight + 2;
        fieldRef.current.style.height = newHeight + 'px'; // Fit the textarea to its content
      }
    }, [fieldId]);

    return (
      <textarea
        id={fieldId}
        name={fieldId}
        ref={fieldRef}
        onChange={handleChange}
        defaultValue={defaultValue}
        className='mt-1 block w-full rounded-md border border-slate-300 bg-white pl-2 pr-1 font-mono placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500'
        placeholder={placeholder ?? 'Type your answer here...'}
        rows={rows && !isNaN(parseInt(rows)) ? parseInt(rows) : 5}
        required
      />
    );
  }

  type TableRow = string[];
  type TableData = TableRow[];
  const I_TABLE = ({
    name,
    headerRowCsv,
  }: {
    name: string;
    headerRowCsv?: string;
  }) => {
    ////// TODO:::: REDUCE RE-RENDERING BY REMOVING value={cell} and updating table data and cache ON_BLUR, the initial data becomes "DEFAULT VALUE" for each cell
    ////// TODO:::: REDUCE RE-RENDERING BY REMOVING value={cell} and updating table data and cache ON_BLUR, the initial data becomes "DEFAULT VALUE" for each cell
    ////// TODO:::: REDUCE RE-RENDERING BY REMOVING value={cell} and updating table data and cache ON_BLUR, the initial data becomes "DEFAULT VALUE" for each cell

    const fieldId = toInputTableId(name);
    const defaultEntry = '';
    const defaultHeaderRow = ['Header1', 'Header2'];
    const headerRow: TableRow = headerRowCsv?.split(',') || defaultHeaderRow;
    const defaultRow = Array(headerRow.length).fill(defaultEntry);
    const initialTableData: TableData = [headerRow, defaultRow];

    const localCache = localStorage.getItem(
      getLSKey(courseId, lessonId, fieldId)
    );
    const parsedCache = localCache
      ? (JSON.parse(localCache) as TableData)
      : null;
    const inputFromDB = lessonInputsFromDB?.[fieldId] as string;
    const parsedInputFromDB = inputFromDB
      ? (JSON.parse(inputFromDB) as TableData)
      : null;

    const defaultTableData = clearInputs
      ? initialTableData
      : parsedCache ?? parsedInputFromDB ?? initialTableData;
    const [tableData, setTableData] = useState<TableData>(defaultTableData);

    // Add a new row
    const addRow = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const newRow: TableRow = Array(tableData[0].length).fill(defaultEntry);
      setTableData((cur) => updateCacheAndReturn([...cur, newRow]));
      setClearInputs(false);
    };

    const deleteRow = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (tableData.length === 1) return; // Don't delete the last row
      setTableData((cur) => updateCacheAndReturn(cur.slice(0, -1)));
      setClearInputs(false);
    };

    // Add a new column
    const addColumn = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setTableData((currentTableData) =>
        updateCacheAndReturn(
          currentTableData.map((row, index) => [
            ...row,
            index === 0 ? 'NewHeader' : defaultEntry,
          ])
        )
      );
      setClearInputs(false);
    };

    // Delete last column
    const deleteColumn = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (tableData[0].length === 1) return; // Don't delete the last column
      setTableData((currentTableData) =>
        updateCacheAndReturn(currentTableData.map((row) => row.slice(0, -1)))
      );
      setClearInputs(false);
    };

    const updateCacheAndReturn = (updatedData: TableData) => {
      if (localStorage)
        localStorage.setItem(
          getLSKey(courseId, lessonId, fieldId),
          JSON.stringify(updatedData)
        );
      return updatedData;
    };

    // Update cell data
    const updateCell = (rowIndex: number, colIndex: number, value: string) => {
      setTableData((curData) => {
        const updatedData = curData.map((curRow) => [...curRow]);
        updatedData[rowIndex][colIndex] = value;
        return updatedData;
      });
      setClearInputs(false);
    };

    const copyTable = async (
      e:
        | React.MouseEvent<HTMLButtonElement>
        | React.ClipboardEvent<HTMLTableElement>
    ) => {
      e.preventDefault();
      const tableString = tableData
        .map((r) => r.map((c) => c.trim()).join('\t'))
        .join('\n');
      try {
        await navigator.clipboard.writeText(tableString);
      } catch (err) {
        alert('Failed to copy table to clipboard');
        console.error('Failed to copy: ', err);
      }
    };

    const pasteTable = async (
      e:
        | React.MouseEvent<HTMLButtonElement>
        | React.ClipboardEvent<HTMLTableElement>
    ) => {
      e.preventDefault();
      try {
        const text = await navigator.clipboard.readText();
        console.log('Pasted text: ', text);
        // print tab characters and newline characters as they are
        console.log(
          'Pasted text in full: ',
          text.replace(/\t/g, '\\t').replace(/\n/g, '\\n')
        );
        const copiedTable: TableData = text
          .split('\n')
          .filter((r) => r.trim() !== '') // Filter empty rows
          .map((r) => r.split('\t').map((c) => c.trim()));
        setTableData(updateCacheAndReturn(copiedTable));
      } catch (err) {
        alert('Failed to paste table from clipboard');
        console.error('Failed to paste: ', err);
      }
    };

    const TableButton = ({
      action,
      children,
    }: {
      action: (e: any) => any;
      children: ReactNode;
    }) => {
      return (
        <button
          className='rounded-full bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:bg-blue-300'
          onClick={action}
        >
          {children}
        </button>
      );
    };

    return (
      <div>
        <input
          type='hidden'
          readOnly={true}
          name={fieldId}
          value={JSON.stringify(tableData)}
        />
        <div className='flex gap-2'>
          <TableButton action={addRow}>+ Row</TableButton>
          <TableButton action={addColumn}>+ Col</TableButton>
          <TableButton action={deleteRow}>- Row</TableButton>
          <TableButton action={deleteColumn}>- Col</TableButton>
          {/* <TableButton action={copyTable}>Copy Table</TableButton> */}
          <TableButton action={pasteTable}>Paste Table</TableButton>
        </div>
        <table
          className='table-auto items-start'
          onPaste={pasteTable}
          onCopy={copyTable}
        >
          <thead>
            <tr>
              {tableData[0]?.map((header, colIndex) => (
                <th key={colIndex}>
                  <textarea
                    value={header}
                    placeholder='...'
                    className='align-top'
                    onChange={(e) => updateCell(0, colIndex, e.target.value)}
                    onBlur={
                      () => updateCacheAndReturn(tableData) // Save on blur
                    }
                    rows={1}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) =>
              rowIndex === 0 ? null : (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => {
                    if (colIndex === 0) {
                      // First column, use `th` for header
                      return (
                        <th key={colIndex}>
                          <textarea
                            value={cell}
                            placeholder='...'
                            className='align-top'
                            onChange={(e) =>
                              updateCell(rowIndex, colIndex, e.target.value)
                            }
                            onBlur={
                              () => updateCacheAndReturn(tableData) // Save on blur
                            }
                            rows={1}
                          />
                        </th>
                      );
                    } else {
                      // Use `td` for other columns
                      return (
                        <td key={colIndex}>
                          <textarea
                            value={cell}
                            placeholder='...'
                            className='align-top'
                            onChange={(e) =>
                              updateCell(rowIndex, colIndex, e.target.value)
                            }
                            onBlur={
                              () => updateCacheAndReturn(tableData) // Save on blur
                            }
                            rows={1}
                          />
                        </td>
                      );
                    }
                  })}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return {
    I_TEXT,
    I_TABLE,
  };
}
