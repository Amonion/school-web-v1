"use client";
import { useEffect, useState } from "react";

import { NavStore } from "@/src/zustand/msgStore";
import { addQuery, formatDateToDDMMYY } from "@/lib/helpers";
import CountryTab from "./CountryTab";
import AcademicLevelTab from "../SchoolResources/AcademicLevelTab";
// import SchoolTab from "./QuestionResources/SchoolTab";

export default function QuestionTab() {
  const { query, setQuery } = NavStore();
  const [url, setUrl] = useState("");
  const [field] = useState("publishedAt");
  const [dateFrom, setDateFrom] = useState<string | null>();
  const [dateTo, setDateTo] = useState<string | null>();

  const updateDateTo = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    setDateTo(value);
    setUrl(`${field}=${dateFrom},${value}&`);
  };

  const updateDateFrom = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    setDateFrom(value);
    setUrl(`${field}=${value},${dateTo}&`);
  };

  useEffect(() => {
    const newUrl = addQuery(query, field, url);
    setQuery(newUrl);
  }, [url]);

  return (
    <div>
      <CountryTab />
      <AcademicLevelTab />
      {/* <SchoolTab /> */}

      <div className="search_set">
        <div className="search_set_title">
          Select Date{" "}
          <div
            onClick={() => {
              setDateFrom(null);
              setDateTo(null);
            }}
            className={`search_btn ml-auto`}
          >
            Clear
          </div>
        </div>
        <div className="flex items-center overflow-auto pb-2 custom-scrollbar">
          <div className="flex flex-1 flex-wrap">
            <div className="flex flex-col mr-7">
              <label className="label" htmlFor="">
                Date From
              </label>
              <div className="flex justify-between">
                <div className="form-input sm w-input mr-2">
                  {dateFrom
                    ? `${formatDateToDDMMYY(new Date(dateFrom))}`
                    : `dd/mm/yy`}
                </div>

                <label
                  className="ml-auto rounded-[5px] relative cursor-pointer flex justify-center items-center px-1 h-10 bg-[var(--border-background)]"
                  htmlFor="date"
                >
                  <i className="cursor-pointer bi bi-calendar-week absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"></i>
                  <input
                    id="date"
                    className="sm opacity-0 w-8"
                    name="dob"
                    type="date"
                    onChange={updateDateFrom}
                  />
                </label>
              </div>
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Date To
              </label>
              <div className="flex justify-between">
                <div className="form-input sm w-input mr-2">
                  {dateTo
                    ? `${formatDateToDDMMYY(new Date(dateTo))}`
                    : `dd/mm/yy`}
                </div>

                <label
                  className="ml-auto rounded-[5px] relative cursor-pointer flex justify-center items-center px-1 h-10 bg-[var(--border-background)]"
                  htmlFor="date"
                >
                  <i className="cursor-pointer bi bi-calendar-week absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"></i>
                  <input
                    id="date"
                    className="sm opacity-0 w-8"
                    name="dob"
                    type="date"
                    onChange={updateDateTo}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
