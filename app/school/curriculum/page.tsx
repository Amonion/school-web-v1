'use client'

import Subjects from '@/components/School/Curriculum/Subjects'
import StaffSubjects from '@/components/School/Staff/StaffSubjects'
import OfficeStore from '@/src/zustand/utility/Office'

export default function Curriculum() {
  const { officeForm } = OfficeStore()

  return (
    <>{officeForm.userType === 'Staff' ? <StaffSubjects /> : <Subjects />}</>
  )
}
