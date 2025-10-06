'use client'
import Link from 'next/link'
import { formatDate } from '@/lib/helpers'
import { useState, useEffect } from 'react'
import QuillEditor from '@/components/Team/Editor/QuillEditor'
import { BioUserStore } from '@/src/zustand/user/BioUser'
import { MessageStore } from '@/src/zustand/notification/Message'
import PictureDisplay from '@/components/Home/Media/PictureDisplay'
import { BioUserSchoolInfoStore } from '@/src/zustand/user/BioUserSchoolInfo'

const VerificationDetails: React.FC = () => {
  const url = '/users'
  let username: string | null = null
  const { bioUserForm, setForm, getBioUser, loading } = BioUserStore()
  const { bioUserSchoolForm, getBioUserSchoolInfo, updateBioUserSchoolInfo } =
    BioUserSchoolInfoStore()
  const [displayBox, setDisplayBox] = useState(false)
  const [isAuthority, setIsAuthority] = useState(false)
  const [content, setContent] = useState('')
  const [action, setAction] = useState('')

  const { setMessage } = MessageStore()

  const authorities = [
    { name: 'Commissioner', level: 1 },
    { name: 'Deputy Speaker', level: 2 },
    { name: 'Speaker', level: 3 },
    { name: 'Deputy Governor', level: 4 },
    { name: 'Governor', level: 5 },
    { name: 'Minister', level: 6 },
    { name: 'National Deputy Speaker', level: 7 },
    { name: 'National Speaker', level: 8 },
    { name: 'Senate President', level: 9 },
    { name: 'Vice President', level: 10 },
    { name: 'President', level: 11 },
  ]

  useEffect(() => {
    const query = window.location.search
    username = new URLSearchParams(query).get('username')

    if (username !== null) {
      getBioUser(`${url}/bio-user/username/${username}`, setMessage)
      getBioUserSchoolInfo(`${url}/biouser-school/${username}`, setMessage)
    }
  }, [username])

  const sendEmail = () => {
    if (content.replace(/<[^>]*>/g, '').trim().length < 20) {
      setMessage('Email content should be at least 20 characters long', false)
      return
    }

    const data = new FormData()
    data.append('bioUserUsername', bioUserForm.bioUserUsername)
    data.append('content', content)
    data.append('action', action)
    data.append('verificationStatus', 'Rejected')
    data.append('id', bioUserForm._id)
    updateBioUserSchoolInfo(
      `${url}/approve-user/${bioUserForm.bioUserUsername}`,
      data,
      setMessage
    )
    setDisplayBox(false)
    setAction('')
  }

  const approveVerification = () => {
    const data = {
      verificationStatus: 'Approved',
      id: bioUserForm._id,
      firstName: bioUserForm.firstName,
      middleName: bioUserForm.middleName,
      lastName: bioUserForm.lastName,
      email: bioUserForm.email,
      authorityName: bioUserForm.authorityName,
      authorityLevel: bioUserForm.authorityLevel,
    }
    updateBioUserSchoolInfo(
      `${url}/approve-user/${bioUserForm.bioUserUsername}`,
      data,
      setMessage
    )
  }

  const setDisplay = () => {
    setDisplayBox((e) => !e)
  }

  const getAge = (dob: string | Date): number => {
    const birthDate = new Date(dob)
    const today = new Date()

    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }
  return (
    <>
      {bioUserForm && (
        <>
          <div className="card_body sharp mb-2">
            <div className="text-lg mb-2 text-[var(--text-secondary)]">
              {bioUserForm.bioUserUsername} Bio Information
            </div>
            <div className="grid xs:grid-cols-2 mb-4 sm:grid-cols-3 gap-3">
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  First name
                </label>
                <div className="form-input">
                  {bioUserForm.firstName
                    ? bioUserForm.firstName
                    : 'Not Available'}
                </div>
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Middle name
                </label>
                <div className="form-input">
                  {bioUserForm.middleName
                    ? bioUserForm.middleName
                    : 'Not Available'}
                </div>
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Last name
                </label>
                <div className="form-input">
                  {bioUserForm.lastName
                    ? bioUserForm.lastName
                    : 'Not Available'}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex justify-between">
                  <label className="label" htmlFor="">
                    Date of Birth{' '}
                  </label>
                  <label className="label" htmlFor="">
                    {getAge(String(bioUserForm.dateOfBirth))} Yrs
                  </label>
                </div>
                <div className="form-input">
                  {bioUserForm.dateOfBirth
                    ? formatDate(String(bioUserForm.dateOfBirth))
                    : 'Not Available'}
                </div>
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Gender
                </label>
                <div className="form-input">
                  {bioUserForm.gender ? bioUserForm.gender : 'Not Available'}
                </div>
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Marital Status
                </label>
                <div className="form-input">
                  {bioUserForm.maritalStatus
                    ? bioUserForm.maritalStatus
                    : 'Not Available'}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div
                style={{
                  borderRadius: '5px',
                  width: '150px',
                  height: '150px',
                  objectFit: 'cover',
                  maxWidth: '200px',
                }}
                className="text"
              >
                <PictureDisplay source={String(bioUserForm.passport)} />
              </div>
            </div>
          </div>

          <div className="card_body sharp mb-2">
            <div className="text-lg mb-2 text-[var(--text-secondary)]">
              {bioUserForm.bioUserUsername} Origin Information
            </div>
            <div className="grid xs:grid-cols-2 mb-4 sm:grid-cols-3 gap-3">
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Country of Origin
                </label>
                <div className="form-input">
                  {bioUserForm.homeCountry
                    ? bioUserForm.homeCountry
                    : 'Not Available'}
                </div>
              </div>

              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  State of Origin
                </label>
                <div className="form-input">
                  {bioUserForm.homeState
                    ? bioUserForm.homeState
                    : 'Not Available'}
                </div>
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Area of Origin
                </label>
                <div className="form-input">
                  {bioUserForm.homeArea
                    ? bioUserForm.homeArea
                    : 'Not Available'}
                </div>
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Address of Origin
                </label>
                <div className="form-input">
                  {bioUserForm.homeAddress
                    ? bioUserForm.homeAddress
                    : 'Not Available'}
                </div>
              </div>
            </div>
          </div>

          <div className="card_body sharp mb-2">
            <div className="text-lg mb-2 text-[var(--text-secondary)]">
              {bioUserForm.bioUserUsername} Contact Information
            </div>
            <div className="grid xs:grid-cols-2 mb-4 sm:grid-cols-3 gap-3">
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Country of Residence
                </label>
                <div className="form-input">{bioUserForm.residentCountry}</div>
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  State of Residence
                </label>
                <div className="form-input">{bioUserForm.residentState}</div>
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Area of Residence
                </label>
                <div className="form-input">{bioUserForm.residentArea}</div>
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Residential Address
                </label>
                <div className="form-input">{bioUserForm.residentAddress}</div>
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Phone Number
                </label>
                <div className="form-input">{bioUserForm.phone}</div>
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Email Address
                </label>
                <div className="form-input">{bioUserForm.email}</div>
              </div>
            </div>
          </div>

          <div className="card_body sharp mb-2">
            <div className="text-lg mb-2 text-[var(--text-secondary)]">
              {bioUserForm.bioUserUsername} Related Information
            </div>
            <div className="grid-3 grid-lay">
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Occupation
                </label>
                <div className="form-input">{bioUserForm.occupation}</div>
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Mothers Name
                </label>
                <div className="form-input">{bioUserForm.motherName}</div>
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Next of Kin
                </label>
                <div className="form-input">{bioUserForm.nextKinName}</div>
              </div>

              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Next of Kin Phone Number
                </label>
                <div className="form-input">
                  {bioUserForm.nextKinPhoneNumber}
                </div>
              </div>
            </div>
          </div>

          <div className="card_body sharp flex flex-col items-center mb-2">
            <div className="text-lg mb-2 text-[var(--text-secondary)]">
              {bioUserForm.bioUserUsername} Media Information
            </div>
            <div className="relative w-full max-w-[600px] sm:h-64 h-[170px] xs:h-[200px] rounded-xl bg-[var(--secondary)] overflow-hidden mb-3">
              <PictureDisplay source={String(bioUserForm.bioUserMedia)} />
            </div>

            <div className="w-full relative mb-3 flex items-center justify-center flex-col">
              <div className="mx-auto  w-24 h-24 overflow-hidden bg-[var(--primary)] rounded-full border border-[var(--border)]">
                <PictureDisplay source={String(bioUserForm.bioUserPicture)} />
              </div>
            </div>
            <div className="mx-auto w-full max-w-[600px]">
              <div className="grid mb-3 grid-cols-2 gap-4">
                <div className="form-input">{bioUserForm.bioUserUsername}</div>
                <div className="form-input">
                  {bioUserForm.bioUserDisplayName}
                </div>
              </div>
              <div
                dangerouslySetInnerHTML={{
                  __html: bioUserForm.bioUserIntro,
                }}
                className="form-input"
              ></div>
            </div>
          </div>

          <div className="card_body sharp mb-2">
            <div className="text-lg mb-2 text-[var(--text-secondary)]">
              {bioUserForm.bioUserUsername} Identification Document
            </div>
            <div className="grid xs:grid-cols-2 mb-4 sm:grid-cols-3 gap-3">
              {bioUserForm.documents.map((item, index) => (
                <div key={index} className="flex flex-col justify-between">
                  <div className="relative w-full min-h-[150px] mb-1">
                    <PictureDisplay source={String(item.doc)} />
                  </div>

                  <label className="label" htmlFor="">
                    {item.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="card_body sharp mb-2">
            <div className="text-lg mb-2 text-[var(--text-secondary)]">
              {bioUserForm.bioUserUsername} Current Education Status
            </div>

            {bioUserSchoolForm.hasPastSchool ? (
              <div className="grid xs:grid-cols-2 mb-4 sm:grid-cols-3 gap-3">
                <div className="flex flex-col">
                  <label className="label" htmlFor="">
                    Continent
                  </label>
                  <div className="form-input">
                    {bioUserSchoolForm.schoolContinent}
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="label" htmlFor="">
                    Country
                  </label>
                  <div className="form-input">
                    {bioUserSchoolForm.schoolCountry}
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="label" htmlFor="">
                    State
                  </label>
                  <div className="form-input">
                    {bioUserSchoolForm.schoolState}
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="label" htmlFor="">
                    Area
                  </label>
                  <div className="form-input">
                    {bioUserSchoolForm.schoolArea}
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="label" htmlFor="">
                    School Name
                  </label>
                  <div className="form-input">
                    {bioUserSchoolForm.schoolName}
                  </div>
                </div>
                {bioUserSchoolForm.schoolFaculty && (
                  <div className="flex flex-col">
                    <label className="label" htmlFor="">
                      Faculty Name
                    </label>
                    <div className="form-input">
                      {bioUserSchoolForm.schoolFaculty}
                    </div>
                  </div>
                )}
                {bioUserSchoolForm.schoolFacultyUsername && (
                  <div className="flex flex-col">
                    <label className="label" htmlFor="">
                      Faculty Username
                    </label>
                    <div className="form-input">
                      {bioUserSchoolForm.schoolFacultyUsername}
                    </div>
                  </div>
                )}
                {bioUserSchoolForm.schoolDepartment && (
                  <div className="flex flex-col">
                    <label className="label" htmlFor="">
                      Department Name
                    </label>
                    <div className="form-input">
                      {bioUserSchoolForm.schoolDepartment}
                    </div>
                  </div>
                )}
                {bioUserSchoolForm.schoolDepartmentUsername && (
                  <div className="flex flex-col">
                    <label className="label" htmlFor="">
                      Department Username
                    </label>
                    <div className="form-input">
                      {bioUserSchoolForm.schoolDepartmentUsername}
                    </div>
                  </div>
                )}
                <div className="flex flex-col">
                  <label className="label" htmlFor="">
                    School Level
                  </label>
                  <div className="form-input">
                    {bioUserSchoolForm.schoolAcademicLevel.levelName}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-lg">No Academic History</div>
            )}
          </div>

          <div className="card_body sharp mb-2">
            <div className="text-lg mb-2 text-[var(--text-secondary)]">
              {bioUserForm.bioUserUsername} Education History
            </div>
            {bioUserSchoolForm.hasPastSchool ? (
              <>
                {bioUserSchoolForm.pastSchools.map((item, index) => (
                  <div key={index}>
                    <div className="grid-3 grid-lay ">
                      <div className="flex flex-col">
                        <label className="label" htmlFor="">
                          Country
                        </label>
                        <div className="form-input">{item.schoolCountry}</div>
                      </div>
                      <div className="flex flex-col">
                        <label className="label" htmlFor="">
                          State
                        </label>
                        <div className="form-input">{item.schoolState}</div>
                      </div>

                      <div className="flex flex-col">
                        <label className="label" htmlFor="">
                          Area
                        </label>
                        <div className="form-input">{item.schoolArea}</div>
                      </div>
                      <div className="flex flex-col">
                        <label className="label" htmlFor="">
                          School Name
                        </label>
                        <div className="form-input">{item.schoolName}</div>
                      </div>
                      {item.schoolFaculty && (
                        <div className="flex flex-col">
                          <label className="label" htmlFor="">
                            Faculty Name
                          </label>
                          <div className="form-input">{item.schoolFaculty}</div>
                        </div>
                      )}
                      {item.schoolFacultyUsername && (
                        <div className="flex flex-col">
                          <label className="label" htmlFor="">
                            Faculty Username
                          </label>
                          <div className="form-input">
                            {item.schoolFacultyUsername}
                          </div>
                        </div>
                      )}
                      {item.schoolDepartment && (
                        <div className="flex flex-col">
                          <label className="label" htmlFor="">
                            Department Name
                          </label>
                          <div className="form-input">
                            {item.schoolDepartment}
                          </div>
                        </div>
                      )}
                      {item.schoolDepartmentUsername && (
                        <div className="flex flex-col">
                          <label className="label" htmlFor="">
                            Department Username
                          </label>
                          <div className="form-input">
                            {item.schoolDepartmentUsername}
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col">
                        <label className="label" htmlFor="">
                          Admitted On
                        </label>
                        <div className="form-input">
                          {formatDate(String(item.admittedAt))}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label className="label" htmlFor="">
                          Graduated On
                        </label>
                        <div className="form-input">
                          {formatDate(String(item.graduatedAt))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center border-b border-b-[var(--border)] mb-2 pb-2">
                      {item.schoolCertificate ? (
                        <div className="max-w-[200px]">
                          <PictureDisplay
                            source={String(item.schoolCertificate)}
                          />
                        </div>
                      ) : (
                        <div>NOT AVAILABLE</div>
                      )}
                      <label className="label" htmlFor="">
                        Certificate
                      </label>
                    </div>
                  </div>
                ))}
                <div className="flex flex-col relative mb-4">
                  <div
                    onClick={() => {
                      setIsAuthority(!isAuthority)
                    }}
                    className="form-input cursor-pointer"
                  >
                    {bioUserForm.authorityName
                      ? bioUserForm.authorityName
                      : 'Select Authority'}
                    <i className="ml-auto bi bi-caret-down-fill"></i>
                  </div>

                  {/* {isAuthority && ( */}
                  <div className={`dropList ${isAuthority ? 'rel' : ''}`}>
                    {authorities.map((item, index) => (
                      <div
                        onClick={() => {
                          setForm('authorityLevel', item.level)
                          setForm('authorityName', item.name)
                          setIsAuthority(false)
                        }}
                        key={index}
                        className="input_drop_list"
                      >
                        {item.name}
                      </div>
                    ))}
                  </div>
                  {/* )} */}
                </div>
              </>
            ) : (
              <div className="text-center text-lg">No Academic History</div>
            )}
          </div>
        </>
      )}
      <div className="table-action card_body sharp flex flex-wrap">
        {loading ? (
          <button className="custom_btn">
            <i className="bi bi-opencollective loading"></i>
            Processing...
          </button>
        ) : (
          <>
            <button
              className="custom_btn mr-3 success"
              onClick={approveVerification}
            >
              Approve
            </button>
            <button className="custom_btn" onClick={setDisplay}>
              Reject
            </button>
            <Link
              href="/team/users/onverification"
              className="custom_btn ml-auto "
            >
              Verifying Table
            </Link>
          </>
        )}
      </div>
      {displayBox && (
        <div className="fixed bg-black/50  w-full h-full flex items-center justify-center z-40 top-0 left-0">
          <div className="flex max-w-[1300px]">
            <div className="w-0 sm:w-[290px]"></div>
            <div className="card_body flex-1 border border-[var(--border)]">
              <div className="mb-2">
                Write an email to {bioUserForm.bioUserUsername} why this
                verification is not approved
              </div>
              <QuillEditor
                contentValue={content}
                onChange={(content) => setContent(content)}
              />
              <div className="table-action flex flex-wrap">
                <button className="custom_btn" onClick={sendEmail}>
                  Send Email
                </button>
                <button
                  className="custom_btn"
                  onClick={() => setDisplayBox((e) => !e)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default VerificationDetails
