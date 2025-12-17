'use client'
import Image from 'next/image'
import { validateInputs } from '@/lib/validation'
import { appendForm } from '@/lib/helpers'
import { BioUserSchoolInfoStore } from '@/src/zustand/user/BioUserSchoolInfo'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import PictureDisplay from '@/components/Home/Media/PictureDisplay'

export default function Document() {
  const { updateBioUserSchoolInfo, pastSchools, loading } =
    BioUserSchoolInfoStore()
  const { bioUser } = AuthStore()
  const { setMessage } = MessageStore()
  const url = '/biousers-school/'
  const uploadCert = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files ? e.target.files[0] : null
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      handleSubmit(index, file)
      BioUserSchoolInfoStore.setState((prev) => {
        const pastSchools = [...prev.bioUserSchoolForm.pastSchools]
        pastSchools[index] = {
          ...pastSchools[index],
          schoolTempCertificate: imageUrl,
        }
        return {}
      })
    }
  }

  const handleSubmit = async (index: number, file: File) => {
    if (bioUser?.isVerified) {
      setMessage('To update these information, please contact support', false)
      return
    }

    const inputsToValidate = [
      {
        name: 'pastSchools',
        value: JSON.stringify(pastSchools),
        rules: { blank: true, maxSize: 10 },
        field: 'Past Schools',
      },
      {
        name: 'certificate',
        value: file,
        rules: { blank: true, maxSize: 10 },
        field: 'Certificate schools',
      },
      {
        name: 'number',
        value: index,
        rules: { blank: false },
        field: 'Index schools',
      },
      {
        name: 'action',
        value: 'EducationDocument',
        rules: { blank: true },
        field: 'History',
      },
      {
        name: 'isEducationDocument',
        value: true,
        rules: { blank: true },
        field: 'History',
      },
    ]

    const { messages } = validateInputs(inputsToValidate)
    const getFirstNonEmptyMessage = (
      messages: Record<string, string>
    ): string | null => {
      for (const key in messages) {
        if (messages[key].trim() !== '') {
          return messages[key]
        }
      }
      return null
    }

    const firstNonEmptyMessage = getFirstNonEmptyMessage(messages)
    if (firstNonEmptyMessage) {
      setMessage(firstNonEmptyMessage, false)
      return
    }
    const data = appendForm(inputsToValidate)
    updateBioUserSchoolInfo(`${url}schools/${bioUser?._id}`, data, setMessage)
  }

  return (
    <>
      {pastSchools.length > 0 ? (
        <div className="round_box mt-10">
          <div className="grid-2 grid-lay items-end">
            {pastSchools.map((item, index) => (
              <div key={index} className="flex flex-col items-center h-full">
                <label
                  className="label text-center mt-auto mb-2 text-sm"
                  htmlFor=""
                >
                  Certificate for {item.schoolName}
                </label>
                {item.schoolTempCertificate ? (
                  <Image
                    className="max-w-[120px] mb-5"
                    alt={`email of ${item.schoolName}`}
                    src={String(item.schoolTempCertificate)}
                    width={0}
                    sizes="100vw"
                    height={0}
                    style={{ width: '100%', height: 'auto' }}
                  />
                ) : item.schoolCertificate ? (
                  <div
                    className="max-w-[120px] mb-5"
                    style={{ width: '100%', height: 'auto' }}
                  >
                    <PictureDisplay source={String(item.schoolCertificate)} />
                  </div>
                ) : (
                  <Image
                    className="max-w-[120px] mb-5 mt-auto"
                    alt={`no record`}
                    src="/images/Paper.png"
                    width={0}
                    sizes="100vw"
                    height={0}
                    style={{ width: '100%', height: 'auto' }}
                  />
                )}
                {loading ? (
                  <div className="btn">
                    <i className="bi bi-opencollective loading  text-md"></i>
                    <div>Processing...</div>
                  </div>
                ) : (
                  <label
                    htmlFor={`cert${index}`}
                    className={`custom_btn ${
                      item.schoolCertificate && bioUser?.isVerified
                        ? 'disabled'
                        : 'neutral'
                    } `}
                  >
                    <input
                      className="input-file"
                      name="file"
                      accept="image/*"
                      disabled={
                        String(item.schoolCertificate) !== '' &&
                        bioUser?.isVerified
                      }
                      onChange={(e) => uploadCert(e, index)}
                      type="file"
                      id={`cert${index}`}
                    />
                    Upload
                  </label>
                )}
              </div>
            ))}
          </div>

          {/* {loading ? (
            <div className="btn">
              <i className="bi bi-opencollective loading  text-md"></i>
              <div>Processing...</div>
            </div>
          ) : (
            <>
              {!isDocumentEdit ? (
                <div onClick={() => setDocumentEdit(true)} className="btn">
                  Edit this Information
                </div>
              ) : (
                <div className="btn">Submit</div>
              )}
            </>
          )} */}
        </div>
      ) : (
        <div className="relative flex justify-center mt-10">
          <div className="not_found_text">No Schools Found</div>
          <Image
            className="max-w-[300px]"
            alt={`no record`}
            src="/images/not-found.png"
            width={0}
            sizes="100vw"
            height={0}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      )}
    </>
  )
}
