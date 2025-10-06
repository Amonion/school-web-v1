"use client";
import Link from "next/link";
import Image from "next/image";
import FacultyStore from "@/src/zustand/team/Faculty";
import { Faculty } from "@/src/interface/team/interface";
import { useState, useEffect, useRef } from "react";
import { truncateString } from "@/lib/helpers";
import { MessageStore } from "@/src/zustand/msgStore";
import { usePathname } from "next/navigation";
import Pagination from "@/components/Team/Pagination";
import { formatDateToDDMMYY, formatTimeTo12Hour } from "@/lib/helpers";
const Faculties: React.FC = () => {
  const url = "schools/faculties/";
  let itemId: string | null = null;
  const {
    getFaculties,
    // massDelete,
    // deleteItem,
    count,
    results,
    toggleAllSelected,
    toggleChecked,
    selectedItems,
    isAllChecked,
    loading,
    toggleActive,
    reshuffleResults,
  } = FacultyStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [page_size] = useState(20);
  const [sort] = useState("-createdAt");
  const [name, setName] = useState("");
  const [schoolUsername, setSchoolUsername] = useState("");
  const [id, setId] = useState<string | null>("");
  const prevPage = useRef(currentPage);
  const { setMessage } = MessageStore();
  const pathname = usePathname();

  useEffect(() => {
    reshuffleResults();
  }, [pathname]);

  useEffect(() => {
    const query = window.location.search;
    itemId = new URLSearchParams(query).get("id");
    const el = String(new URLSearchParams(query).get("name"));
    const schoolUsername = String(
      new URLSearchParams(query).get("schoolUsername")
    );
    setId(itemId);
    setName(el);
    setSchoolUsername(schoolUsername);
    if (itemId !== null || itemId !== "") {
      const school = `&schoolId=${itemId}`;
      const params = `?page_size=${page_size}&page=${currentPage}&ordering=${sort}${school}`;
      getFaculties(`${url}${params}`, setMessage);
    } else {
      const params = `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`;
      getFaculties(`${url}${params}`, setMessage);
    }
    prevPage.current = currentPage;
  }, [getFaculties, results.length, currentPage]);

  const deleteSchool = async (item: Faculty) => {
    // const params = `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`;
    // deleteItem(`${url}${item._id}${params}`, setMessage);
    console.log(item);
  };

  const DeleteItems = async () => {
    if (selectedItems.length === 0) {
      setMessage("Please select at least one user to delete", false);
      return;
    }
    // await massDelete(`${url}mass-delete/`, url, selectedItems, setMessage);
  };
  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">Table of {name} Faculties</div>
        <div className="overflow-auto mb-5">
          {results.length > 0 ? (
            <table className="">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Picture</th>
                  <th>Faculty</th>
                  <th>Username</th>
                  <th>Description</th>
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
                            href={`/team/schools/faculties/create-faculty?id=${item._id}&name=${item.name}&schoolUsername=${schoolUsername}`}
                          >
                            Edit Faculty
                          </Link>
                          <Link
                            className="card_list_item"
                            href={`/team/schools/departments/?id=${item._id}&name=${item.name}&schoolId=${id}&facultyUsername=${item.username}`}
                          >
                            Departments
                          </Link>
                          <div
                            onClick={() => deleteSchool(item)}
                            className="card_list_item"
                          >
                            Delete Faculty
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
                    <td>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: truncateString(item.description, 150),
                        }}
                      ></div>
                    </td>
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
              <div className="not_found_text">No Faculty Found</div>
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
                href={`/team/schools/faculties/create-faculty?schoolId=${id}&schoolUsername=${schoolUsername}&school=${name}`}
                className="custom_btn ml-auto"
              >
                Create Faculty
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

export default Faculties;
