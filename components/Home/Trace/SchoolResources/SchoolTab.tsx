"use client";

import CountryStore from "@/src/zustand/team/Country";
import AcademicLevelTab from "./AcademicLevelTab";
import SchoolPlaceTab from "./SchoolPlaceTab";

export default function SchoolTab() {
  const { selectedCountries } = CountryStore();

  return (
    <div>
      <SchoolPlaceTab />
      {selectedCountries.length === 1 && <AcademicLevelTab />}
    </div>
  );
}
