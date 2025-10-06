"use client";

import CountryStore from "@/src/zustand/team/Country";
import SchoolPlaceTab from "./SchoolPlaceTab";
import AcademicLevelTab from "./AcademicLevelTab";
import SchoolListTab from "./SchoolListTab";

export default function SchoolTab() {
  const { selectedCountries } = CountryStore();

  return (
    <div>
      <SchoolPlaceTab />
      {selectedCountries.length === 1 && <AcademicLevelTab />}
      <SchoolListTab />
    </div>
  );
}
