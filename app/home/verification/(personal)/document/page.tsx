'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { appendForm } from '@/lib/helpers'
import { BioUserStore, IDDocs } from '@/src/zustand/user/BioUser'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import DocumentStore from '@/src/zustand/place/Document'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { validateInputs } from '@/lib/validation'
import PictureDisplay from '@/components/Home/Media/PictureDisplay'
import { useRouter } from 'next/navigation'

export default function Document() {
  const [docs, setDocs] = useState<IDDocs[]>([])
  const { bioUserForm, setForm, updateMyBioUser, loading } = BioUserStore()
  const { user, bioUser } = AuthStore()
  const { documents, getDocuments } = DocumentStore()
  const { setMessage } = MessageStore()
  const url = '/biousers/'
  const { setAlert } = AlartStore()
  const router = useRouter()

  useEffect(() => {
    getDocuments('/documents/', setMessage)
  }, [])

  useEffect(() => {
    setForm('documents', bioUser?.documents)
  }, [bioUser])

  useEffect(() => {
    const tempDoc: IDDocs[] = []
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i]
      const el = bioUserForm.documents.find((e) => e.docId === doc._id)

      if (!el) {
        tempDoc.push({
          name: doc.name,
          doc: '',
          tempDoc: '',
          docId: doc._id,
        })
      } else {
        tempDoc.push(el)
      }
    }

    if (tempDoc.length > 0) {
      setDocs(tempDoc)
    }
  }, [documents])

  const uploadCert = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    id: string,
    name: string
  ) => {
    const file = e.target.files ? e.target.files[0] : null
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      handleSubmit(file, id, name)

      setDocs((prev) => {
        const updated = [...prev]
        updated[index] = {
          ...updated[index],
          doc: file,
          tempDoc: imageUrl,
        }
        return updated
      })
    }
  }

  const submitData = async (data: FormData) => {
    updateMyBioUser(`${url}${bioUser?._id}`, data, setMessage, () =>
      router.replace(`/home/verification/public`)
    )
  }

  const handleSubmit = async (file: File, id: string, name: string) => {
    const inputsToValidate = [
      {
        name: 'doc',
        value: file,
        rules: { blank: true, maxSize: 10 },
        field: 'Document',
      },
      {
        name: 'id',
        value: id,
        rules: { blank: true },
        field: 'ID',
      },
      {
        name: 'name',
        value: name,
        rules: { blank: true, maxSize: 10 },
        field: 'Name',
      },
      {
        name: 'isDocument',
        value: true,
        rules: { blank: true },
        field: 'Document',
      },
      {
        name: 'action',
        value: 'Document',
        rules: { blank: true },
        field: 'Document',
      },
      {
        name: 'ID',
        value: String(user?._id),
        rules: { blank: true },
        field: 'ID ',
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

    setAlert(
      'Warning',
      'You will need to contact support to edit this information after verification is approved!',
      true,
      () => submitData(data)
    )
  }

  return (
    <>
      {docs.length > 0 ? (
        <div className="round_box">
          <div className="grid-2 grid-lay items-end">
            {docs.map((item, index) => (
              <div key={index} className="flex flex-col items-center h-full">
                <label
                  className="label text-center mt-auto mb-2 text-lg"
                  htmlFor=""
                >
                  {item.name}
                </label>
                {item.tempDoc ? (
                  <Image
                    className="max-w-[120px] mb-5"
                    alt={`email of ${item.name}`}
                    src={String(item.tempDoc)}
                    width={0}
                    sizes="100vw"
                    height={0}
                    style={{ width: '100%', height: 'auto' }}
                  />
                ) : item.doc ? (
                  <div
                    className="max-w-[120px] mb-5 rounded-[10px]"
                    style={{ width: '100%', height: 'auto' }}
                  >
                    <PictureDisplay source={String(item.doc)} />
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
                      item.doc && bioUser?.isVerified ? 'disabled' : 'neutral'
                    } `}
                  >
                    <input
                      className="input-file"
                      name="file"
                      disabled={
                        String(item.doc) !== '' &&
                        bioUser !== null &&
                        bioUser.isVerified
                      }
                      accept="image/*"
                      onChange={(e) =>
                        uploadCert(e, index, item.docId, item.name)
                      }
                      type="file"
                      id={`cert${index}`}
                    />
                    Upload
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative flex justify-center">
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
