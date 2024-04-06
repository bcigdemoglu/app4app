import {
  JsonObject,
  UserProgressForCourseFromDB,
  toInputTableId,
  toInputTextId,
} from '@/lib/types';
import { getInputFieldFromUserProgressForCourse } from '@/utils/lessonDataHelpers';
import { MDXComponents } from 'mdx/types';

function NoDataFound() {
  return (
    <div className='text-red-700'>
      {
        'ERROR: Data not found. Please re-submit lesson or contact support@cloudybook.com.'
      }
    </div>
  );
}

export function getMdxStaticOutputComponents(
  lessonInputsJson: JsonObject | null,
  userProgressForCourse: UserProgressForCourseFromDB | null
): MDXComponents {
  function O_TEXT({ name, lessonId }: { name: string; lessonId?: string }) {
    const fieldId = toInputTextId(name);
    const externalFieldInput = lessonId
      ? getInputFieldFromUserProgressForCourse(
          userProgressForCourse,
          fieldId,
          lessonId
        )
      : null;
    const fieldInput =
      externalFieldInput ||
      (typeof lessonInputsJson?.[fieldId] === 'string'
        ? (lessonInputsJson[fieldId] as string)
        : null);

    if (!fieldInput) {
      return <NoDataFound />;
    }

    return (
      // Respect the newlines in the value
      <span key={'outputComponent.' + fieldId} className='whitespace-pre-line'>
        {fieldInput}
      </span>
    );
  }
  type TableRow = string[];
  type TableData = TableRow[];
  const O_TABLE = ({ name }: { name: string }) => {
    const fieldId = toInputTableId(name);
    const fieldInput = lessonInputsJson?.[fieldId] as string;
    const parsedInputFromDB = fieldInput
      ? (JSON.parse(fieldInput) as TableData)
      : null;
    const tableData = parsedInputFromDB;

    if (!tableData) {
      return <NoDataFound />;
    }

    return (
      <div key={'outputComponent.' + fieldId}>
        <table className='table-auto items-start'>
          <thead>
            <tr>
              {tableData[0]?.map((header, colIndex) => (
                <th key={colIndex}>{header}</th>
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
                      return <th key={colIndex}>{cell}</th>;
                    } else {
                      // Use `td` for other columns
                      return <td key={colIndex}>{cell}</td>;
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
  function O_PAGE() {
    return (
      // Respect the newlines in the value
      <div className='break-after-page' />
    );
  }
  return {
    O_TEXT,
    O_TABLE,
    O_PAGE,
  };
}
