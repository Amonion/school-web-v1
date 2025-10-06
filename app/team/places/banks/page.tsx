"use client";
import Link from "next/link";
import Image from "next/image";
import BankStore from "@/src/zustand/team/Bank";
import { useState, useEffect, useRef } from "react";
import { MessageStore } from "@/src/zustand/msgStore";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/src/zustand/authStore";
import Pagination from "@/components/Team/Pagination";

const Banks: React.FC = () => {
  const url = "/places/banks";
  const {
    getBanks,
    banks,
    isAllChecked,
    toggleActive,
    toggleAllSelected,
    toggleChecked,
    selectedItems,
    massDelete,
    loadingBanks,
    reshuffleResults,
    deleteItem,
    count,
  } = BankStore();

  const { user } = useAuthStore.getState();
  const [currentPage, setCurrentPage] = useState(1);
  const [country, setCountry] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [page_size] = useState(20);
  const [sort] = useState("-dateCreated");
  const prevPage = useRef(currentPage);
  const { setMessage } = MessageStore();
  const pathname = usePathname();

  useEffect(() => {
    reshuffleResults();
  }, [pathname]);

  useEffect(() => {
    reshuffleResults();
    const query = window.location.search;
    const el = String(new URLSearchParams(query).get("country"));
    const id = String(new URLSearchParams(query).get("id"));
    if (el && id) {
      setCountry(el);
      setId(id);
      const params = `?country=${el}&page_size=${page_size}&page=${currentPage}`;
      getBanks(`${url}${params}`, setMessage);
    }
    prevPage.current = currentPage;
  }, [pathname, banks.length, currentPage]);

  const deletePlace = async (id: string, index: number) => {
    toggleActive(index);
    const params = `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`;
    await deleteItem(`${url}${id}/${params}`, setMessage);
  };

  const DeleteItems = async () => {
    if (selectedItems.length === 0) {
      setMessage("Please select at least one email to delete", false);
      return;
    }
    await massDelete(`${url}mass-delete/`, url, selectedItems, setMessage);
  };
  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">Table of Banks</div>
        <div className="overflow-auto mb-5">
          {banks.length > 0 ? (
            <table className="">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Picture</th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Country</th>
                </tr>
              </thead>
              <tbody>
                {banks.map((item, index) => (
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
                            href={`/team/places/banks/create-bank?id=${item._id}&name=${item.name}&country=${country}&pId=${id}`}
                          >
                            Edit Bank
                          </Link>

                          <div
                            className="card_list_item"
                            onClick={() => deletePlace(item._id, index)}
                          >
                            Delete State
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      {item.picture ? (
                        <Image
                          alt={`email of ${item.picture}`}
                          src={String(item.picture)}
                          width={0}
                          sizes="100vw"
                          height={0}
                          style={{ width: "50px", height: "auto" }}
                        />
                      ) : (
                        <span>N/A</span>
                      )}
                    </td>

                    <td>{item.name}</td>
                    <td>{item.username}</td>
                    <td>{item.country}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="relative flex justify-center">
              <div className="not_found_text">No Bank Found</div>
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
        <div className="table_action">
          {loadingBanks ? (
            <button className="custom_btn ">
              <i className="bi bi-opencollective loading"></i>

              <div>Processing...</div>
            </button>
          ) : (
            <>
              {banks.length > 0 && (
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

                  {user?.level !== null &&
                    user?.level !== undefined &&
                    user.level > 15 && (
                      <button className="custom_btn line" onClick={DeleteItems}>
                        <i className="bi bi-trash text-lg mr-2"></i>
                        Delete
                      </button>
                    )}
                </>
              )}
              <Link
                href={`/team/places/banks/create-bank?pId=${id}&country=${country}`}
                className="custom_btn ml-auto"
              >
                Create Bank
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

export default Banks;
