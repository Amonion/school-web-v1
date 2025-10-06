'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
// import { usePathname } from "next/navigation";
import Pagination from '@/components/Team/Pagination'
import { formatDateToDDMMYY, formatTimeTo12Hour } from '@/lib/helpers'
import SchoolStore, { School } from '@/src/zustand/school/School'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { MessageStore } from '@/src/zustand/notification/Message'

const Schools: React.FC = () => {
  const url = 'schools/'
  const {
    getSchools,
    // massDelete,
    // deleteItem,
    count,
    schoolResults,
    toggleAllSelected,
    toggleChecked,
    // selectedItems,
    // postItem,
    isAllChecked,
    loading,
    toggleActive,
    reshuffleSchools,
  } = SchoolStore()
  const [currentPage, setCurrentPage] = useState(1)
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const prevPage = useRef(currentPage)
  const { user } = AuthStore()
  const { setMessage } = MessageStore()
  // const pathname = usePathname();

  // useEffect(() => {
  //   reshuffleResults();
  // }, [pathname]);

  useEffect(() => {
    reshuffleSchools()
    const query = window.location.search
    const isVerified = new URLSearchParams(query).get('isVerified')
    const isRecorded = new URLSearchParams(query).get('isRecorded')
    const isNew = new URLSearchParams(query).get('isNew')
    const source = isVerified
      ? '&isVerified=true'
      : isRecorded
      ? '&isRecorded=true'
      : isNew
      ? '&isNew=true'
      : ''
    const params = `?page_size=${page_size}&page=${currentPage}&ordering=${sort}${source}`
    getSchools(`${url}${params}`, setMessage)

    prevPage.current = currentPage
  }, [currentPage])

  const deleteSchool = async (item: School) => {
    // const params = `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`;
    // deleteItem(`${url}${item._id}${params}`, setMessage);
    console.log(item)
  }

  // const DeleteItems = async () => {
  //   if (selectedItems.length === 0) {
  //     setMessage("Please select at least one user to delete", false);
  //     return;
  //   }
  //   await massDelete(`${url}mass-delete/`, url, selectedItems, setMessage);
  // };

  // const update = async () => {
  //   if (selectedItems.length === 0) {
  //     setMessage("Please select at least one user to delete", false);
  //     return;
  //   }
  //   await postItem(`${url}update-levels`, {}, setMessage);
  // };

  return (
    <>
      <div className="card_body sharp">
        <div className="custom_sm_title">Table of Schools</div>
        <div className="overflow-auto mb-5">
          {schoolResults.length > 0 ? (
            <table className="">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Owner</th>
                  <th>State</th>
                  <th>Country</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {schoolResults.map((item, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 1 ? 'bg-[var(--white-gray)]' : ''
                    }`}
                  >
                    <td>
                      <div className="flex items-center">
                        <div
                          className={`checkbox ${
                            item.isChecked ? 'active' : ''
                          }`}
                          onClick={() => toggleChecked(index)}
                        >
                          {item.isChecked && (
                            <i className="bi bi-check text-white text-lg"></i>
                          )}
                        </div>
                        {(currentPage - 1) * page_size + index + 1}
                        <i
                          onClick={() => toggleActive(index)}
                          className="bi bi-three-dots-vertical text-lg cursor-pointer"
                        ></i>
                      </div>
                      {item.isActive && (
                        <div className="card_list">
                          <span
                            onClick={() => toggleActive(index)}
                            className="more_close "
                          >
                            X
                          </span>
                          <Link
                            className="card_list_item"
                            href={`/team/schools/create-school?id=${item._id}&name=${item.username}`}
                          >
                            Edit School
                          </Link>

                          <Link
                            className="card_list_item"
                            href={`/team/schools/faculties?id=${item._id}&name=${item.name}&schoolUsername=${item.username}`}
                          >
                            Faculties
                          </Link>

                          {user && user.staffRanking > 19 && (
                            <div
                              onClick={() => deleteSchool(item)}
                              className="card_list_item"
                            >
                              Delete School
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      {item.idCard ? (
                        <Image
                          alt={`email of ${item.idCard}`}
                          src={String(item.idCard)}
                          width={0}
                          sizes="100vw"
                          height={0}
                          style={{ width: '50px', height: 'auto' }}
                        />
                      ) : (
                        <span>N/A</span>
                      )}
                    </td>

                    <td>
                      {item.isApplied ? (
                        <Link
                          className="text-[var(--custom)]"
                          href={`/team/schools/review/${item.username}`}
                        >
                          {item.name}
                        </Link>
                      ) : item.isApproved ? (
                        <Link
                          className="text-[var(--success)]"
                          href={`/team/schools/review/${item.username}`}
                        >
                          {item.name}
                        </Link>
                      ) : (
                        item.name
                      )}
                    </td>
                    <td>{item.ownerUsername}</td>
                    {/* <td>
                      {item.levels &&
                        item.levels[0] &&
                        item.levels[0].levelName}{' '}
                    </td> */}
                    <td>{item.state}</td>
                    <td>{item.country}</td>
                    <td>
                      {formatTimeTo12Hour(item.createdAt)}
                      <br />
                      {formatDateToDDMMYY(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        </div>
        <div className="table_nav">
          {loading ? (
            <button className="custom_btn ">
              <i className="bi bi-opencollective loading"></i>

              <div>Processing...</div>
            </button>
          ) : (
            <>
              <button className="custom_btn line" onClick={toggleAllSelected}>
                <div className={`checkbox ${isAllChecked ? 'active' : ''}`}>
                  {isAllChecked && (
                    <i className="bi bi-check text-white text-lg"></i>
                  )}
                </div>
                Select All
              </button>
              {/* <button className="custom_btn line" onClick={DeleteItems}>
                <i className="bi bi-trash text-lg mr-2"></i>
                Delete
              </button>
              <button className="custom_btn line" onClick={update}>
                Update Schools
              </button> */}
              <Link
                href="/team/schools/create-school"
                className="custom_btn ml-auto"
              >
                Create School
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center">
          <div>Results {count}</div>
          <Pagination
            currentPage={currentPage}
            totalItems={count}
            pageSize={page_size}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </>
  )
}

export default Schools
