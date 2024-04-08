import { COURSE_MAP } from '@/lib/data';
import {
  JsonObject,
  UserProgressForCourseFromDB,
  toInputTableId,
  toInputTextId,
} from '@/lib/types';
import { getInputFieldFromUserProgressForCourse } from '@/utils/lessonDataHelpers';
import { MDXComponents } from 'mdx/types';
import Link from 'next/link';

function NoDataFoundForLesson({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  const lessonTitle = COURSE_MAP[courseId].lessonMap[lessonId].title;
  return (
    <Link href={`/playground/${courseId}/${lessonId}`} className='text-red-700'>
      {`ERROR: Data not found. Please complete and re-submit Lesson "${lessonTitle}". If the issue persists, please contact support@cloudybook.com.`}
    </Link>
  );
}

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
  userProgressForCourse: UserProgressForCourseFromDB | null,
  courseId: string
): MDXComponents {
  function O_TEXT({ name, lessonId }: { name: string; lessonId?: string }) {
    const fieldId = toInputTextId(name);
    const externalLessonId = lessonId;
    const externalFieldInput = externalLessonId
      ? getInputFieldFromUserProgressForCourse(
          userProgressForCourse,
          fieldId,
          externalLessonId
        )
      : null;
    if (externalLessonId && typeof externalFieldInput !== 'string') {
      // You must submit the lesson in full to see the output
      return (
        <NoDataFoundForLesson courseId={courseId} lessonId={externalLessonId} />
      );
    }
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
