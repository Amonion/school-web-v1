"use client";
import Link from "next/link";
import Image from "next/image";
import CourseStore from "@/src/zustand/team/Courses";
import { Course } from "@/src/interface/team/interface";
import { useState, useEffect, useRef } from "react";
import { MessageStore } from "@/src/zustand/msgStore";
import { usePathname } from "next/navigation";
import Pagination from "@/components/Team/Pagination";
import { formatDateToDDMMYY, formatTimeTo12Hour } from "@/lib/helpers";
const Courses: React.FC = () => {
  let itemId: string | null = null;
  const url = "schools/courses/";
  const {
    getCourses,
    // massDelete,
    // deleteItem,
    count,
    courses,
    toggleAllSelected,
    toggleChecked,
    selectedItems,
    isAllChecked,
    loading,
    toggleActive,
    reshuffleResults,
  } = CourseStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [page_size] = useState(20);
  const [sort] = useState("-createdAt");
  const prevPage = useRef(currentPage);
  const { setMessage } = MessageStore();
  const pathname = usePathname();
  const [name, setName] = useState("");
  const [id, setId] = useState<string | null>("");
  const [sId, setSId] = useState<string | null>("");
  const [fId, setFId] = useState<string | null>("");
  useEffect(() => {
    reshuffleResults();
  }, [pathname]);

  useEffect(() => {
    const query = window.location.search;
    itemId = new URLSearchParams(query).get("id");
    const el = String(new URLSearchParams(query).get("name"));
    const sId = String(new URLSearchParams(query).get("schoolId"));
    const fId = String(new URLSearchParams(query).get("facultyId"));
    setFId(fId);
    setSId(sId);
    setId(itemId);
    setName(el);
    if (itemId !== null || itemId !== "") {
      const school = `&departmentId=${itemId}`;
      const params = `?page_size=${page_size}&page=${currentPage}&ordering=${sort}${school}`;
      getCourses(`${url}${params}`, setMessage);
    } else {
      const params = `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`;
      getCourses(`${url}${params}`, setMessage);
    }
    prevPage.current = currentPage;
  }, [getCourses, courses.length, currentPage]);

  const deleteSchool = async (item: Course) => {
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
        <div className="custom_sm_title">Table of Courses</div>
        <div className="overflow-auto mb-5">
          {courses.length > 0 ? (
            <table className="">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Picture</th>
                  <th>Department</th>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Semester</th>
                  <th>Unit</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((item, index) => (
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
                            href={`/team/schools/courses/create-course?id=${item._id}&name=${item.name}&dId=${id}&fId=${fId}&sId=${sId}&dName=${name}`}
                          >
                            Edit Course
                          </Link>
                          <div
                            onClick={() => deleteSchool(item)}
                            className="card_list_item"
                          >
                            Delete Course
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
                    <td>{item.department}</td>
                    <td>{item.name}</td>
                    <td>{item.courseCode}</td>
                    <td>{item.semester}</td>
                    <td>{item.load}</td>
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
              <div className="not_found_text">No Courses Found</div>
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
              {courses.length > 0 && (
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
                href={`/team/schools/courses/create-course/?dId=${id}&fId=${fId}&sId=${sId}&dName=${name}`}
                className="custom_btn ml-auto"
              >
                Create Course
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

export default Courses;
