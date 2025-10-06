'use client'
import CourseStore from '@/src/zustand/school/Courses'
import SchoolSubjects from './SchoolSubjects'

export default function SubjectsOverlay() {
  const { setDisplaySubjects } = CourseStore()

  return (
    <>
      <div
        onClick={() => setDisplaySubjects(false)}
        className="fixed bg-black/50  w-full h-full flex items-center justify-center z-40 top-0 left-0"
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="flex w-full max-w-[1200px]"
        >
          <div
            onClick={() => setDisplaySubjects(false)}
            className="w-0 md:w-[290px]"
          ></div>
          <div className="flex-1 max-h-[100vh] overflow-auto">
            <SchoolSubjects />
          </div>
        </div>
      </div>
    </>
  )
}
