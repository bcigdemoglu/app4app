'server-only';

import { JsonObject, toInputTableId, toInputTextId } from '@/lib/types';
import {
  fetchAiResponse,
  fetchUserProgressForCourseUpToLesson,
} from '@/utils/lessonHelpers';
import { User } from '@supabase/supabase-js';
import { MDXComponents } from 'mdx/types';
import { Fragment } from 'react';

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
  lessonInputsFromDB: JsonObject | null
): MDXComponents {
  function O_TEXT({ name }: { name: string }) {
    const fieldId = toInputTextId(name);
    const value = lessonInputsFromDB
      ? (lessonInputsFromDB[fieldId] as string)
      : 'ERROR';
    return (
      // Respect the newlines in the value
      <span className='whitespace-pre-line' id={fieldId}>
        {value}
      </span>
    );
  }
  type TableRow = string[];
  type TableData = TableRow[];
  const O_TABLE = ({ name }: { name: string }) => {
    const fieldId = toInputTableId(name);
    const inputFromDB = lessonInputsFromDB?.[fieldId] as string;
    const parsedInputFromDB = inputFromDB
      ? (JSON.parse(inputFromDB) as TableData)
      : null;
    const tableData = parsedInputFromDB;

    if (!tableData) {
      return <div>ERROR: No table data found</div>;
    }

    return (
      <div>
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
    const inputValue = lessonInputsFromDB
      ? (lessonInputsFromDB[fieldId] as string)
      : 'ERROR';
    const aiResponse = await fetchAiResponse(inputValue, prompt);
    // const aiResponse = await Promise.resolve('AI response');
    console.log('aiResponse', aiResponse);

    return (
      // Respect the newlines in the value
      <span className='whitespace-pre-line' id={fieldId}>
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
