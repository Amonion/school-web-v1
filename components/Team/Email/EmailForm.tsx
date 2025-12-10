'use client'
import QuillEditor from '@/components/Team/Editor/QuillEditor'
import EmailStore, { Email } from '@/src/zustand/notification/Email'
import { MessageStore } from '@/src/zustand/notification/Message'
import { UserStore } from '@/src/zustand/user/User'
import _debounce from 'lodash/debounce'
import { useRef } from 'react'

const EmailForm: React.FC = () => {
  const {
    emailForm,
    loading,
    searchedEmails,
    searchEmail,
    setForm,
    setShowEmailForm,
  } = EmailStore()
  const { setMessage } = MessageStore()
  const { selectedUsers, sendUsersEmail } = UserStore()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearchEmail = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (value.trim().length > 0) {
        searchEmail(
          `/emails/search?name=${value}&title=${value}&content=${value}&page_size=20`
        )
      } else {
        UserStore.setState({ searchedUsers: [] })
      }
    },
    1000
  )

  const sendEmail = async () => {
    if (selectedUsers.length === 0) {
      setMessage('Please select at least one user to send email to.', false)
      return
    }
    const usersIds = selectedUsers.map((user) => user._id)
    const form = new FormData()
    form.append('usersIds', JSON.stringify(usersIds))
    sendUsersEmail(`/messages/send/${emailForm._id}`, form, setMessage)
  }

  const selectEmail = (email: Email) => {
    EmailStore.setState({ emailForm: email, searchedEmails: [] })
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div
      onClick={() => setShowEmailForm(false)}
      className="fixed bg-black/50  w-full h-full flex items-center justify-center z-40 top-0 left-0"
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
        }}
        className="flex max-w-[1300px]"
      >
        <div className="card_body sharp overflow-auto max-h-[100vh] flex-1 flex flex-col border border-[var(--border)]">
          <div className="relative mb-2">
            <div className={`input_wrap ml-auto active `}>
              <input
                ref={inputRef}
                type="search"
                onChange={handleSearchEmail}
                className={`transparent-input flex-1 `}
                placeholder="Search users"
              />
              {loading ? (
                <i className="bi bi-opencollective common-icon loading"></i>
              ) : (
                <i className="bi bi-search common-icon cursor-pointer"></i>
              )}
            </div>

            {searchedEmails.length > 0 && (
              <div
                className={`dropdownList ${
                  searchedEmails.length > 0
                    ? 'overflow-auto'
                    : 'overflow-hidden h-0'
                }`}
              >
                {searchedEmails.map((item, index) => (
                  <div
                    onClick={() => selectEmail(item)}
                    key={index}
                    className="input_drop_list"
                  >
                    {item.title}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="form-input">{emailForm.title}</div>
          <QuillEditor
            contentValue={emailForm.content}
            placeHolder="Write your letter here"
            onChange={(content) => setForm('content', content)}
          />
          <div className="flex items-center">
            <button className="custom_btn success mr-auto" onClick={sendEmail}>
              Send Email
            </button>

            <button
              className="custom_btn"
              onClick={() => setShowEmailForm(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailForm
