"use client";
import Link from "next/link";
import Image from "next/image";
import SchoolPaymentStore from "@/src/zustand/team/SchoolPayment";
import { SchoolPayment } from "@/src/interface/team/interface";
import { useState, useEffect, useRef } from "react";
import { MessageStore } from "@/src/zustand/msgStore";
import { usePathname } from "next/navigation";
import Pagination from "@/components/Team/Pagination";
import { formatDateToDDMMYY, formatTimeTo12Hour } from "@/lib/helpers";
const SchoolPayments: React.FC = () => {
  const url = "schools/payments/";
  const {
    getSchoolPayments,
    massDelete,
    deleteItem,
    count,
    results,
    toggleAllSelected,
    toggleChecked,
    selectedItems,
    isAllChecked,
    loading,
    toggleActive,
    reshuffleResults,
  } = SchoolPaymentStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [page_size] = useState(5);
  const [sort] = useState("-createdAt");
  const prevPage = useRef(currentPage);

  const { setMessage } = MessageStore();
  const pathname = usePathname();

  useEffect(() => {
    reshuffleResults();
  }, [pathname]);

  useEffect(() => {
    reshuffleResults();
    if (results.length === 0 || currentPage !== prevPage.current) {
      const params = `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`;
      getSchoolPayments(`${url}${params}`, setMessage);
    }
    prevPage.current = currentPage;
  }, [getSchoolPayments, results.length, currentPage]);

  const deleteSchool = async (item: SchoolPayment) => {
    const params = `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`;
    deleteItem(`${url}${item._id}${params}`, setMessage);
  };

  const DeleteItems = async () => {
    if (selectedItems.length === 0) {
      setMessage("Please select at least one user to delete", false);
      return;
    }
    await massDelete(`${url}mass-delete/`, url, selectedItems, setMessage);
  };
  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">Table of Payments</div>
        <div className="overflow-auto mb-5">
          {results.length > 0 ? (
            <table className="">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Logo</th>
                  <th>School</th>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Charge</th>
                  <th>Date</th>
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
                            href={`/team/schools/payments/create-payment?id=${item._id}&name=${item.name}`}
                          >
                            Edit Payment
                          </Link>
                          <div
                            onClick={() => deleteSchool(item)}
                            className="card_list_item"
                          >
                            Delete Payment
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      {item.schoolLogo ? (
                        <Image
                          alt={`email of ${item.schoolLogo}`}
                          src={String(item.schoolLogo)}
                          width={0}
                          sizes="100vw"
                          height={0}
                          style={{ width: "50px", height: "auto" }}
                        />
                      ) : (
                        <span>N/A</span>
                      )}
                    </td>
                    <td>{item.school}</td>
                    <td>{item.name}</td>
                    <td>{item.amount}</td>
                    <td>{item.charge}</td>
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
              <div className="not_found_text">No School Payment Found</div>
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
          {loading ? (
            <button className="custom_btn ">
              <i className="bi bi-opencollective loading"></i>

              <div>Processing...</div>
            </button>
          ) : (
            <>
              {results.length > 0 && (
                <>
                  <button
                    className="custom_btn line"
                    onClick={toggleAllSelected}
                  >
                    <div className={`checkbox ${isAllChecked ? "active" : ""}`}>
                      {isAllChecked && (
                        <i className="bi bi-check text-white text-lg"></i>
                      )}
                    </div>
                    Select All
                  </button>
                  <button className="custom_btn line" onClick={DeleteItems}>
                    <i className="bi bi-trash text-lg mr-2"></i>
                    Delete
                  </button>
                </>
              )}
              <Link
                href="/team/schools/payments/create-payment"
                className="custom_btn ml-auto"
              >
                Create Payment
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
  );
};

export default SchoolPayments;
