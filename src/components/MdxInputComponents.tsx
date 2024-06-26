'use client';

import { getLSKey } from '@/lib/data';
import { JsonObject, toInputTableId, toInputTextId } from '@/lib/types';
// import { EditorContent, useEditor } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
import { MDXComponents } from 'mdx/types';
import { ChangeEvent, ReactNode, useEffect, useRef, useState } from 'react';

function resetHeight(el: HTMLElement) {
  el.style.height = 'auto'; // Reset the height
  const newHeight = el.scrollHeight + 2;
  el.style.height = `${newHeight}px`; // Fit the textarea to its content
}

/////// TODO: Instead of getMdxInputComponents, it should encapsulate I_TEXT such as const I_TEXT_WRAPPER = ({lessonInputsFromDB, ...rest}) => <I_TEXT lessonInputsFromDB={lessonInputsFromDB}  {...rest} />
/////// Then we can do a lazy load on I_TEXT and I_TABLE to allow for localStorage loaded at runtime and remove any useEffect causing re-renders.
/////// Something like I_TEXT_WRAPPER = { I_TEXT = dynamic(() => import('./I_TEXT'), { ssr: false }); return <I_TEXT lessonInputsFromDB={lessonInputsFromDB}  {...rest} /> };
export function getMdxInputComponents(
  clearInputs: boolean,
  setClearInputs: (val: boolean) => void,
  courseId: string,
  lessonId: string,
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
    const inputFromDB = lessonInputsFromDB?.[fieldId] as string;
    const [defaultValue, setDefaultValue] = useState('');
    const fieldRef = useRef<HTMLTextAreaElement>(null);
    // const editor = useEditor({
    //   content: '<p>Example Text</p>',
    //   extensions: [StarterKit],
    // });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setClearInputs(false);
      if (localStorage)
        localStorage.setItem(
          getLSKey(courseId, lessonId, fieldId),
          e.target.value
        );
      resetHeight(e.target);
    };

    useEffect(() => {
      const cachedInput = localStorage
        ? localStorage.getItem(getLSKey(courseId, lessonId, fieldId))
        : null;
      const newDefaultValue = clearInputs
        ? ''
        : cachedInput ?? inputFromDB ?? '';
      if (!clearInputs && cachedInput !== defaultValue) {
        setDefaultValue(newDefaultValue);
      }
      if (fieldRef.current) {
        resetHeight(fieldRef.current);
      }
    }, [fieldId, inputFromDB, defaultValue]);

    // return (
    //   <EditorContent
    //     className='mt-1 block w-full rounded-md border border-slate-300 bg-white pl-2 pr-1 font-mono placeholder-zinc-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500'
    //     editor={editor}
    //     required
    //   />
    // );

    return (
      <textarea
        key={'inputComponent.' + fieldId}
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
    const updateCell = (
      e: ChangeEvent<HTMLTextAreaElement>,
      rowIndex: number,
      colIndex: number,
      value: string
    ) => {
      setTableData((curData) => {
        const updatedData = curData.map((curRow) => [...curRow]);
        updatedData[rowIndex][colIndex] = value;
        return updatedData;
      });
      setClearInputs(false);
      resetHeight(e.target);
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
      action: (e: React.MouseEvent<HTMLButtonElement>) => void;
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
      <div key={'inputComponent.' + fieldId}>
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
                    onChange={(e) => updateCell(e, 0, colIndex, e.target.value)}
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
                              updateCell(e, rowIndex, colIndex, e.target.value)
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
                              updateCell(e, rowIndex, colIndex, e.target.value)
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
