'server-only';

import { JsonObject, toInputTableId, toInputTextId } from '@/lib/types';
import {
  fetchAiResponse,
  fetchUserProgressForCourseUpToLesson,
} from '@/utils/lessonHelpers';
import { User } from '@supabase/supabase-js';
import { MDXComponents } from 'mdx/types';
import { Fragment } from 'react';

function NoDataFound() {
  return (
    <div className='text-red-700'>
      {
        'ERROR: Data not found. Please re-submit lesson or contact support@cloudybook.com.'
      }
    </div>
  );
}

export async function PreviousLessonOutputs({
  courseId,
  lessonId,
  user,
}: {
  courseId: string;
  lessonId: string;
  user: User | null;
}) {
  const userProgressForCourseUpToLesson =
    await fetchUserProgressForCourseUpToLesson(courseId, lessonId, user);

  if (!userProgressForCourseUpToLesson) {
    return <></>;
  }

  return (
    <>
      {userProgressForCourseUpToLesson.map((userProgress) => (
        <Fragment key={userProgress.id}>
          <div
            className='prose'
            dangerouslySetInnerHTML={{
              __html: (userProgress.outputs_json as JsonObject).data as string,
            }}
          />
          <br></br>
        </Fragment>
      ))}
    </>
  );
}

export function getMdxOutputComponents(
  lessonInputsJson: JsonObject | null
): MDXComponents {
  function O_TEXT({ name }: { name: string }) {
    const fieldId = toInputTextId(name);
    const fieldInput =
      typeof lessonInputsJson?.[fieldId] === 'string'
        ? (lessonInputsJson[fieldId] as string)
        : null;

    if (!fieldInput) {
      return <NoDataFound />;
    }

    return (
      // Respect the newlines in the value
      <span
        key={'outputComponent.' + fieldId}
        className='whitespace-pre-line'
        id={fieldId}
      >
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
  async function O_TEXT_AI({ name, prompt }: { name: string; prompt: string }) {
    const fieldId = toInputTextId(name);
    const inputValue = lessonInputsJson
      ? (lessonInputsJson[fieldId] as string)
      : 'ERROR';
    const aiResponse = await fetchAiResponse(inputValue, prompt);
    // const aiResponse = await Promise.resolve('AI response');
    console.log('aiResponse', aiResponse);

    return (
      // Respect the newlines in the value
      <span
        key={'outputComponent.' + fieldId}
        className='whitespace-pre-line'
        id={fieldId}
      >
        {aiResponse}
      </span>
    );
  }
  function O_PAGE() {
    return (
      // Respect the newlines in the value
      <div className='break-after-page' />
    );
  }
  return {
    O_TEXT,
    O_TEXT_AI,
    O_TABLE,
    O_PAGE,
  };
}
