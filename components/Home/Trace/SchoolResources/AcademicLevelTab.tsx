"use client";
import { MessageStore, NavStore } from "@/src/zustand/msgStore";
import { useEffect, useState } from "react";
import AcademicStore from "@/src/zustand/team/Academic";
import { addQuery } from "@/lib/helpers";
import { motion } from "framer-motion";
import CountryStore from "@/src/zustand/team/Country";

export default function AcademicLevelTab() {
  const {
    academicResults,
    selectedItems,
    allAcademics,
    setAll,
    getAcademics,
    toggleChecked,
    reshuffleResults,
  } = AcademicStore();
  const { selectedCountries } = CountryStore();
  const { setMessage } = MessageStore();
  const { setQuery, query } = NavStore();
  const [url, setUrl] = useState("");
  const [isActive, setActive] = useState(false);
  const field = "schoolLevelName";

  useEffect(() => {
    if (selectedCountries.length === 0) {
      reshuffleResults();
    } else if (selectedCountries.length === 1) {
      const countryNames = selectedCountries.map((country) => country.country);
      getAcademics(
        `/places/academic-levels/?page_size=100&ordering=level&country[in]=${encodeURIComponent(
          countryNames.join(",")
        )}`,
        setMessage
      );
    }
  }, [selectedCountries]);

  useEffect(() => {
    const uniqueLevels = new Set();
    selectedItems.forEach((el) => uniqueLevels.add(el.levelName));

    const newUrl = Array.from(uniqueLevels).join(",");
    setUrl(`${field}=${newUrl}&`);

    if (selectedItems.length === 0) {
      setUrl("");
    }
  }, [selectedItems]);

  useEffect(() => {
    const newUrl = addQuery(query, field, url);
    setQuery(newUrl);
  }, [url]);

  return (
    <div className="search_set">
      <div onClick={() => setActive((e) => !e)} className="search_set_title">
        Academic Level{" "}
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
        {academicResults.length === 0 ? (
          <div className="flex items-center h-10 justify-center flex-wrap w-full">
            <i
              className={`bi  bi-opencollective loading  text-md text-[var(--custom-color)]`}
            ></i>
          </div>
        ) : (
          <div className="flex items-center overflow-auto pb-2 custom-scrollbar">
            <div
              onClick={() => setAll()}
              className="checkbox_container text-nowrap"
            >
              <div className={`check_box mr-2 ${allAcademics ? "active" : ""}`}>
                {allAcademics && <i className="bi bi-check"></i>}
              </div>
              All
            </div>

            {academicResults.map((item, index) => (
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
                {item.levelName}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
