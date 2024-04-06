import { isDemoCourse } from '@/lib/data';
import { JsonObject, UserProgressForCourseFromDB } from '@/lib/types';
import { getOrderedUserProgressUpToLesson } from '@/utils/lessonDataHelpers';
import { Fragment } from 'react';

export function PreviousLessonOutputs({
  courseId,
  lessonId,
  userProgressForCourse,
}: {
  courseId: string;
  lessonId: string;
  userProgressForCourse: UserProgressForCourseFromDB | null;
}) {
  if (isDemoCourse(courseId) || !userProgressForCourse) {
    return <></>;
  }

  const orderedUserProgressForCourseUpToLesson =
    getOrderedUserProgressUpToLesson(userProgressForCourse, courseId, lessonId);

  return (
    <>
      {orderedUserProgressForCourseUpToLesson.map((userProgress) => (
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
