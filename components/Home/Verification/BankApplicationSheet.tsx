'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { capitalizeFirstLetter, formatDateToDDMMYY } from '@/lib/helpers'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { MessageStore } from '@/src/zustand/notification/Message'
import PictureDisplay from '../Media/PictureDisplay'
import { BioUserBankStore } from '@/src/zustand/user/BioUserBank'

const BankApplicationSheet = () => {
  const { bioUser } = AuthStore()
  const {
    isApplicationForm,
    loading,
    selectedBank,
    openBankAccount,
    setApplicationForm,
  } = BioUserBankStore()
  const [birthCert, setBirthCert] = useState('')
  const { setMessage } = MessageStore()
  const [userRegistration, setUserRegistration] = useState('')

  useEffect(() => {
    if (bioUser) {
      const index = bioUser.documents.findIndex(
        (item) => item.name === 'Birth Certificate'
      )
      if (index >= 0) {
        setBirthCert(String(bioUser.documents[index].doc))
      }
    }

    const query = window.location.search
    const user = new URLSearchParams(query).get('user')
    if (user === 'student') {
      setUserRegistration('Student')
    }
  }, [bioUser])

  const handleSubmit = () => {
    if (userRegistration === 'Student' && bioUser) {
      const form = {
        userType: userRegistration,
        bioUserDisplayName: bioUser.bioUserDisplayName,
        bioUserIntro: bioUser.bioUserIntro,
        bioUserId: bioUser._id,
        bioUserMedia: bioUser.bioUserMedia,
        bioUserPicture: bioUser.bioUserPicture,
        bioUserUsername: bioUser.bioUserUsername,
        userRegistration: userRegistration,
      }
      openBankAccount(
        `/bio-user/banks/open/${bioUser._id}`,
        form,
        setMessage,
        () => setApplicationForm(false)
      )
    }
  }

  return (
    <>
      <div className="fixed z-30 flex justify-center bottom-0 left-0 w-full">
        <div className="custom_container">
          <div className="flex w-full relative">
            <div className="w-[270px] xl:w-[300px] hidden sm:flex"></div>
            <div className="sm:ml-5 relative flex-1 md:mr-5 border-l border-l-[var(--border)] border-r border-r-[var(--border)]">
              <div
                className={`${
                  isApplicationForm ? 'absolute ' : 'overflow-hidden relative'
                } flex flex-col flex-1 bottom-[55px] sm:bottom-0  left-0 w-full`}
              >
                {bioUser && (
                  <div
                    className={`bg-[var(--secondary)] flex flex-col w-full commentScrollbar rounded-tl-[15px] rounded-tr-[15px] absolute bottom-0 left-0 h-[70vh]
    transition-transform duration-300 ease-in-out ${
      isApplicationForm ? 'translate-y-0 overflow-hidden' : 'translate-y-full'
    }`}
                  >
                    <div
                      onClick={() => setApplicationForm(!isApplicationForm)}
                      className="w-full cursor-pointer z-20 sticky top-0 left-0 flex flex-col px-3 py-2 rounded-tl-[15px] rounded-tr-[15px] bg-[var(--white)] border border-[var(--border)]"
                    >
                      <div className="h-2 bg-[var(--border)] w-[70px] mx-auto rounded-[10px] cursor-pointer"></div>
                      <div className="flex justify-center pt-1 text-center text-lg">
                        {capitalizeFirstLetter(userRegistration)} Application
                      </div>
                    </div>
                    <div className="flex-1 overflow-auto">
                      <div className="flex flex-col items-center">
                        <Image
                          style={{
                            height: '50px',
                            width: '50px',
                            objectFit: 'cover',
                          }}
                          src={`${selectedBank.picture || '/avatar.png'}`}
                          loading="lazy"
                          sizes="100vw"
                          className="rounded-full object-cover my-2"
                          width={0}
                          height={0}
                          alt={`${selectedBank.username}`}
                        />
                        <div className="flex justify-center text-center mb-1 uppercase text-lg">
                          {selectedBank.name}
                        </div>
                        <div className="text-center text-sm mb-10">
                          To apply to {selectedBank.name}, below are the
                          required bio data you will transfer.
                        </div>
                      </div>
                      <div className="px-2  mb-5">
                        <div className="text-lg text-[var(--custom)] mb-2">
                          Personal Information
                        </div>
                        <div className="grid-2 grid-lay">
                          <div className="">
                            <div className="text-sm">First Name</div>
                            <div className="selected_item text-[var(--text-secondary)]">
                              {bioUser.firstName}
                            </div>
                          </div>

                          <div className="">
                            <div className="text-sm">Middle Name</div>
                            <div className="selected_item text-[var(--text-secondary)]">
                              {bioUser.middleName}
                            </div>
                          </div>

                          <div className="">
                            <div className="text-sm">Last Name</div>
                            <div className="selected_item text-[var(--text-secondary)]">
                              {bioUser.lastName}
                            </div>
                          </div>

                          <div className="">
                            <div className="text-sm">Date of Birth</div>
                            <div className="selected_item text-[var(--text-secondary)]">
                              {formatDateToDDMMYY(bioUser.dateOfBirth)}
                            </div>
                          </div>

                          <div className="">
                            <div className="text-sm">Gender</div>
                            <div className="selected_item text-[var(--text-secondary)]">
                              {bioUser.gender}
                            </div>
                          </div>

                          <div className="">
                            <div className="text-sm">Marital Status</div>
                            <div className="selected_item text-[var(--text-secondary)]">
                              {bioUser.maritalStatus}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-2  mb-5">
                        <div className="text-lg text-[var(--custom)] mb-2">
                          Origin Information
                        </div>
                        <div className="grid-2 grid-lay mx-1">
                          <div className="">
                            <div className="text-sm">Area Name</div>
                            <div className="selected_item text-[var(--text-secondary)]">
                              {bioUser.homeArea}
                            </div>
                          </div>

                          <div className="">
                            <div className="text-sm">State Name</div>
                            <div className="selected_item text-[var(--text-secondary)]">
                              {bioUser.homeState}
                            </div>
                          </div>

                          <div className="">
                            <div className="text-sm">Country Name</div>
                            <div className="selected_item text-[var(--text-secondary)]">
                              {bioUser.homeCountry}
                            </div>
                          </div>

                          <div className="">
                            <div className="text-sm">Continent Name</div>
                            <div className="selected_item text-[var(--text-secondary)]">
                              {bioUser.homeContinent}
                            </div>
                          </div>

                          <div className="">
                            <div className="text-sm">Home Address</div>
                            <div className="selected_item text-[var(--text-secondary)]">
                              {bioUser.homeAddress}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-2  mb-5">
                        <div className="text-lg text-[var(--custom)] mb-2">
                          Residential Information
                        </div>
                        <div className="grid-2 grid-lay mx-1">
                          <div className="">
                            <div className="text-sm">Area Name</div>
                            <div className="selected_item text-[var(--text-secondary)]">
                              {bioUser.residentArea}
                            </div>
                          </div>

                          <div className="">
                            <div className="text-sm">State Name</div>
                            <div className="selected_item text-[var(--text-secondary)]">
                              {bioUser.residentState}
                            </div>
                          </div>

                          <div className="">
                            <div className="text-sm">Country Name</div>
                            <div className="selected_item text-[var(--text-secondary)]">
                              {bioUser.residentCountry}
                            </div>
                          </div>

                          <div className="">
                            <div className="text-sm">Continent Name</div>
                            <div className="selected_item text-[var(--text-secondary)]">
                              {bioUser.residentContinent}
                            </div>
                          </div>

                          <div className="">
                            <div className="text-sm">Phone Address</div>
                            <div className="selected_item text-[var(--text-secondary)]">
                              {bioUser.phone}
                            </div>
                          </div>
                          <div className="">
                            <div className="text-sm">Residential Address</div>
                            <div className="selected_item text-[var(--text-secondary)]">
                              {bioUser.residentAddress}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-2  mb-5">
                        <div className="text-lg text-[var(--custom)] mb-2">
                          Related Information
                        </div>
                        <div className="grid-2 grid-lay mx-1">
                          <div className="">
                            <div className="text-sm">Occupation</div>
                            <div className="selected_item text-[var(--text-secondary)]">
                              {bioUser.occupation}
                            </div>
                          </div>

                          <div className="">
                            <div className="text-sm"> Mother Maiden Name</div>
                            <div className="selected_item text-[var(--text-secondary)]">
                              {bioUser.motherName}
                            </div>
                          </div>

                          <div className="">
                            <div className="text-sm">Next of Kin</div>
                            <div className="selected_item text-[var(--text-secondary)]">
                              {bioUser.nextKinName}
                            </div>
                          </div>

                          <div className="">
                            <div className="text-sm">Next of Kin Phone</div>
                            <div className="selected_item text-[var(--text-secondary)]">
                              {bioUser.nextKinPhoneNumber}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-2  mb-5">
                        <div className="text-lg text-[var(--custom)] mb-2">
                          Birth Certificate
                        </div>
                        <div className="flex flex-col items-center h-full">
                          <div
                            className="max-w-[120px] mb-5 rounded-[10px]"
                            style={{ width: '100%', height: 'auto' }}
                          >
                            {birthCert && (
                              <PictureDisplay source={String(birthCert)} />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="px-2  mb-5">
                        <div className="text-lg text-[var(--custom)] mb-2">
                          Official Public Profile
                        </div>
                        <div className="relative w-full sm:h-64 h-[170px] xs:h-[200px] rounded-xl bg-[var(--secondary)] overflow-hidden mb-5 ">
                          <PictureDisplay
                            source={String(bioUser.bioUserMedia)}
                          />
                        </div>

                        <div className="w-full relative  mb-2 flex items-center justify-center flex-col">
                          <div className="mx-auto  w-24 h-24 overflow-hidden bg-[var(--primary)] rounded-full flex items-center justify-center  border border-[var(--border)] transition">
                            <PictureDisplay
                              source={String(bioUser.bioUserPicture)}
                            />
                          </div>
                        </div>

                        <div className="bg-[var(--primary)] p-3 rounded-[5px]">
                          <div className="mb-5">
                            <label htmlFor="">Username</label>
                            <div className="form-input mb-5">
                              {bioUser.bioUserUsername}
                            </div>
                          </div>

                          <label htmlFor="">Display Name</label>
                          <div className="form-input mb-5">
                            {bioUser.bioUserDisplayName}
                          </div>
                          <label htmlFor="">Intro</label>
                          <div
                            className="form-input mb-5"
                            dangerouslySetInnerHTML={{
                              __html: bioUser.bioUserIntro,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="justify-center flex flex-wrap">
                      {loading ? (
                        <div className={`custom_btn neutral disabled`}>
                          Processing
                        </div>
                      ) : (
                        <>
                          <button
                            className={`custom_btn success mx-2`}
                            onClick={handleSubmit}
                          >
                            Submit
                          </button>
                          <button
                            className={`custom_btn mx-2`}
                            onClick={() => setApplicationForm(false)}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="w-[270px] xl:w-[300px] hidden md:block"></div>
          </div>
        </div>
      </div>
    </>
  )
}

export default BankApplicationSheet
