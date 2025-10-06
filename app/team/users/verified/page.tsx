"use client";
import Link from "next/link";
import Image from "next/image";
import UserStore from "@/src/zustand/team/User";
import { useState, useEffect, useRef } from "react";
import { MessageStore } from "@/src/zustand/msgStore";
import { usePathname } from "next/navigation";
import Pagination from "@/components/Team/Pagination";
import { formatDateToDDMMYY, formatTimeTo12Hour } from "@/lib/helpers";
const UsersOnVerification: React.FC = () => {
  const url = "users/";
  const {
    getItems,
    count,
    results,
    toggleChecked,
    loading,
    toggleActive,
    reshuffleResults,
  } = UserStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [page_size] = useState(20);
  const [sort] = useState("-createdAt");
  const prevPage = useRef(currentPage);
  const { setMessage } = MessageStore();
  const pathname = usePathname();

  useEffect(() => {
    reshuffleResults();
  }, [pathname]);

  useEffect(() => {
    reshuffleResults();
    const params = `?page_size=${page_size}&page=${currentPage}&ordering=${sort}&userStatus=User&isVerified=true`;
    getItems(`${url}${params}`, setMessage);
    prevPage.current = currentPage;
  }, [currentPage]);

  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">Verified Users</div>
        <div className="overflow-auto mb-5">
          {results.length > 0 ? (
            <table className="">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Picture</th>
                  <th>Username</th>
                  <th>Contact</th>
                  <th>Date</th>
                  <th>Country</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 1 ? "bg-[var(--white-gray)]" : ""
                    }`}
                  >
                    <td>
                      <div className="flex items-center">
                        <div
                          className={`checkbox ${
                            item.isChecked ? "active" : ""
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
                    </td>
                    <td>
                      {item.picture ? (
                        <Image
                          alt={`email of ${item.picture}`}
                          src={String(item.picture)}
                          width={0}
                          sizes="100vw"
                          className="object-cover rounded-full"
                          height={0}
                          style={{
                            minWidth: "70px",
                            width: "70px",
                            height: "70px",
                          }}
                        />
                      ) : (
                        <span>N/A</span>
                      )}
                    </td>
                    <td>
                      <Link
                        href={`/team/users/onverification/verification-details/?username=${item.username}`}
                      >
                        {item.username}
                      </Link>
                    </td>
                    <td>
                      <div>{item.email}</div>
                      <div>{item.phone}</div>
                    </td>
                    <td>
                      {formatTimeTo12Hour(item.createdAt)}
                      <br />
                      {formatDateToDDMMYY(item.createdAt)}
                    </td>
                    <td>{item.signupIp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="relative flex justify-center">
              <div className="not_found_text">No User Found</div>
              <Image
                className="max-w-[300px]"
                alt={`no record`}
                src="/images/not-found.png"
                width={0}
                sizes="100vw"
                height={0}
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          )}
        </div>
        <div className="table_nav">
          {loading && (
            <button className="custom_btn ">
              <i className="bi bi-opencollective loading"></i>

              <div>Processing...</div>
            </button>
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
  );
};

export default UsersOnVerification;
