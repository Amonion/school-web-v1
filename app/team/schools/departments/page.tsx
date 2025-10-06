"use client";
import Link from "next/link";
import Image from "next/image";
import DepartmentStore from "@/src/zustand/team/Department";
import { Department } from "@/src/interface/team/interface";
import { useState, useEffect, useRef } from "react";
import { truncateString } from "@/lib/helpers";
import { MessageStore } from "@/src/zustand/msgStore";
import { usePathname } from "next/navigation";
import Pagination from "@/components/Team/Pagination";
import { formatDateToDDMMYY, formatTimeTo12Hour } from "@/lib/helpers";
const Departments: React.FC = () => {
  let itemId: string | null = null;
  const url = "schools/departments/";
  const {
    getDepartments,
    // massDelete,
    // deleteItem,
    count,
    departments,
    toggleAllSelected,
    toggleChecked,
    selectedItems,
    isAllChecked,
    loading,
    toggleActive,
    reshuffleResults,
  } = DepartmentStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [page_size] = useState(20);
  const [sort] = useState("-createdAt");
  const prevPage = useRef(currentPage);
  const { setMessage } = MessageStore();
  const pathname = usePathname();
  const [name, setName] = useState("");
  const [facultyUsername, setFacultyUsername] = useState("");
  const [id, setId] = useState<string | null>("");
  const [sId, setSId] = useState<string | null>("");
  useEffect(() => {
    reshuffleResults();
  }, [pathname]);

  useEffect(() => {
    const query = window.location.search;
    itemId = new URLSearchParams(query).get("id");
    const el = String(new URLSearchParams(query).get("name"));
    const sId = String(new URLSearchParams(query).get("schoolId"));
    const facultyUsername = String(
      new URLSearchParams(query).get("facultyUsername")
    );
    setFacultyUsername(facultyUsername);
    setSId(sId);
    setId(itemId);
    setName(el);
    if (itemId !== null || itemId !== "") {
      const school = `&facultyId=${itemId}`;
      const params = `?page_size=${page_size}&page=${currentPage}&ordering=${sort}${school}`;
      getDepartments(`${url}${params}`, setMessage);
    } else {
      const params = `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`;
      getDepartments(`${url}${params}`, setMessage);
    }
    prevPage.current = currentPage;
  }, [currentPage]);

  const deleteSchool = async (item: Department) => {
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
        <div className="custom_sm_title">Table of Department</div>
        <div className="overflow-auto mb-5">
          {departments.length > 0 ? (
            <table className="">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Picture</th>
                  <th>Faculty</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((item, index) => (
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
                            href={`/team/schools/departments/create-department?id=${item._id}&name=${item.name}&facultyUsername=${facultyUsername}`}
                          >
                            Edit Department
                          </Link>
                          <Link
                            className="card_list_item"
                            href={`/team/schools/courses/?id=${item._id}&name=${item.name}&facultyId=${id}&schoolId=${sId}`}
                          >
                            Courses
                          </Link>
                          <Link
                            className="card_list_item"
                            href={`/team/schools/courses/create-course?id=${item._id}&name=${item.name}&facultyId=${id}&schoolId=${sId}`}
                          >
                            Create Courses
                          </Link>
                          <div
                            onClick={() => deleteSchool(item)}
                            className="card_list_item"
                          >
                            Delete Department
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
                    <td>{item.faculty}</td>
                    <td>{item.name}</td>
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
              <div className="not_found_text">No Department Found</div>
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
              {departments.length > 0 && (
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
                href={`/team/schools/departments/create-department/?facultyId=${id}&faculty=${name}&schoolId=${sId}&facultyUsername=${facultyUsername}`}
                className="custom_btn ml-auto"
              >
                Create Department
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

export default Departments;
