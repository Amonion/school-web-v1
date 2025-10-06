'use client'
import AllStudents from '@/components/School/Student/AllStudents'
import OfficeStore from '@/src/zustand/utility/Office'

export default function Students() {
  const { officeForm } = OfficeStore()

  return (
    <>{officeForm.userType === 'Staff' ? <AllStudents /> : <AllStudents />}</>
  )
}
