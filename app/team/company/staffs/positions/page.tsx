"use client";
import Link from "next/link";
import PositionStore from "@/src/zustand/team/Position";
import { useState, useEffect, useRef } from "react";
import { MessageStore } from "@/src/zustand/msgStore";
import { usePathname } from "next/navigation";
import Pagination from "@/components/Team/Pagination";

const Positions: React.FC = () => {
  const url = "/company/positions/";
  const {
    toggleActive,
    toggleChecked,
    getPositions,
    positionResults,
    searchedPositions,
    loading,
    count,
    toggleAllSelected,
    massDelete,
    reshuffleResults,
  } = PositionStore();
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
    if (positionResults.length === 0 || currentPage !== prevPage.current) {
      getPositions(
        `${url}?page_size=${page_size}&page=${currentPage}&ordering=${sort}`,
        setMessage
      );
    }
    prevPage.current = currentPage;
  }, [getPositions, positionResults.length, currentPage]);

  const DeleteItems = async () => {
    if (searchedPositions.length === 0) {
      setMessage("Please select at least one user to delete", false);
      return;
    }
    await massDelete(`${url}mass-delete/`, url, searchedPositions, setMessage);
  };
  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">Table of Positions</div>
        <div className="overflow-auto mb-5">
          <table className="">
            <thead>
              <tr>
                <th>S/N</th>
                <th>Position</th>
                <th>Role</th>
                <th>Salary</th>
                <th>Level</th>
              </tr>
            </thead>
            <tbody>
              {positionResults.map((item, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 1 ? "bg-[var(--white-gray)]" : ""
                  }`}
                >
                  <td>
                    <div className="flex items-center">
                      <div
                        className={`checkbox ${item.isChecked ? "active" : ""}`}
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
                          href={`/team/company/staffs/create-position?id=${item._id}&name=${item.position}`}
                        >
                          Edit Position
                        </Link>
                      </div>
                    )}
                  </td>

                  <td>{item.position}</td>
                  <td>{item.role}</td>
                  <td>{item.salary}</td>
                  <td>{item.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-action flex mb-4 flex-wrap">
          {loading ? (
            <button className="custom_btn ">
              <i className="bi bi-opencollective loading"></i>

              <div>Processing...</div>
            </button>
          ) : (
            <>
              <button className="custom_btn line" onClick={toggleAllSelected}>
                <div
                  className={`checkbox ${
                    searchedPositions.length > 0 ? "active" : ""
                  }`}
                >
                  {searchedPositions.length > 0 && (
                    <i className="bi bi-check text-white text-lg"></i>
                  )}
                </div>
                Select All
              </button>
              <button className="custom_btn line" onClick={DeleteItems}>
                <i className="bi bi-trash text-lg mr-2"></i>
                Delete
              </button>
              <Link
                href="/team/company/staffs/create-position"
                className="custom_btn ml-auto"
              >
                Create Position
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

export default Positions;
