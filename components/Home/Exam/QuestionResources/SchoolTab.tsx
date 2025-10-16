"use client";
import { MessageStore, NavStore } from "@/src/zustand/msgStore";
import { useEffect, useState } from "react";
import SchoolStore from "@/src/zustand/team/School";
import { motion } from "framer-motion";
import CountryStore from "@/src/zustand/users/CountryStudy";
import { addQuery } from "@/lib/helpers";

export default function SchoolTab() {
  const {
    schoolResults,
    allSchools,
    setAllSchools,
    getSchools,
    toggleChecked,
    loading,
    selectedSchools,
  } = SchoolStore();
  const { query, setQuery } = NavStore();
  const { selectedCountries, allCountries } = CountryStore();
  const { setMessage } = MessageStore();
  const [isActive, setActive] = useState(false);
  const [url, setUrl] = useState("");
  const field = "examSchoolName";

  useEffect(() => {
    let country = "";
    const uniqueLevels = new Set();
    selectedCountries.forEach((el) => uniqueLevels.add(el.country));
    const newUrl = Array.from(uniqueLevels).join(",");

    if (selectedCountries.length === 0 && allCountries) {
      country = ``;
    } else {
      country = `&country=${newUrl}`;
    }

    if (isActive) {
      getSchools(`/schools/?page_size=100${country}`, setMessage);
    }
  }, [isActive, selectedCountries]);

  useEffect(() => {
    const uniqueLevels = new Set();
    selectedSchools.forEach((el) => uniqueLevels.add(el.name));
    const newUrl = Array.from(uniqueLevels).join(",");

    setUrl(`${field}=${newUrl}&`);
    if (selectedSchools.length === 0) {
      setUrl("");
    }
  }, [selectedSchools]);

  useEffect(() => {
    const newCountryUrl = addQuery(query, field, url);
    setQuery(newCountryUrl);
  }, [url]);

  return (
    <div className="search_set">
      <div onClick={() => setActive((e) => !e)} className="search_set_title">
        Schools{" "}
        <i
          className={`bi bi-caret-down-fill ml-auto ${
            isActive ? "active" : ""
          }`}
        ></i>
      </div>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isActive ? "auto" : 0, opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center h-10 justify-center flex-wrap w-full">
            <i
              className={`bi  bi-opencollective loading  text-md text-[var(--custom-color)]`}
            ></i>
          </div>
        ) : (
          <div className="flex items-center overflow-auto pb-2 custom-scrollbar">
            <div
              onClick={() => setAllSchools()}
              className="checkbox_container text-nowrap"
            >
              <div className={`check_box mr-2 ${allSchools ? "active" : ""}`}>
                {allSchools && <i className="bi bi-check"></i>}
              </div>
              All
            </div>

            {schoolResults.map((item, index) => (
              <div
                onClick={() => toggleChecked(index)}
                key={index}
                className="checkbox_container text-nowrap"
              >
                <div
                  className={`check_box mr-2 ${item.isChecked ? "active" : ""}`}
                >
                  {item.isChecked && <i className="bi bi-check"></i>}
                </div>
                {item.name}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
