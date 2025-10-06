"use client";
import { useEffect } from "react";
import { NavStore } from "@/src/zustand/msgStore";
import { addQuery } from "@/lib/helpers";
import UserInfoStore from "@/src/zustand/users/UserInfo";
import SchoolTab from "../SchoolResources/SchoolTab";

export default function PeopleTab() {
  const { query, setQuery } = NavStore();
  const {
    allVerification,
    verificationUrl,
    verifications,
    allSexes,
    sexes,
    sexUrl,
  } = UserInfoStore();

  const field = "gender";
  const field1 = "isVerified";

  const selectAll = () => {
    UserInfoStore.setState((prev) => {
      const updatedItems = prev.sexes.map((item) => ({
        ...item,
        isChecked: false,
      }));
      return {
        allSexes: !prev.allSexes,
        sexes: updatedItems,
      };
    });
  };

  const selectGender = (index: number) => {
    UserInfoStore.setState((prev) => {
      const updatedItems = prev.sexes.map((item, i) =>
        i === index ? { ...item, isChecked: !item.isChecked } : item
      );
      return {
        sexes: updatedItems,
      };
    });
  };

  const selectAllVerification = () => {
    UserInfoStore.setState((prev) => {
      const updatedItems = prev.verifications.map((item) => ({
        ...item,
        isChecked: false,
      }));
      return {
        allVerification: !prev.allVerification,
        verifications: updatedItems,
      };
    });
  };

  const selectVerification = (index: number) => {
    UserInfoStore.setState((prev) => {
      const updatedItems = prev.verifications.map((item, i) =>
        i === index ? { ...item, isChecked: !item.isChecked } : item
      );
      return {
        verifications: updatedItems,
      };
    });
  };

  useEffect(() => {
    const num = sexes.filter((item) => item.isChecked).length;
    UserInfoStore.setState({
      allSexes: num === 2 || num === 0 ? true : false,
    });

    const uniqueLevels = new Set();
    sexes.forEach((el) => {
      if (el.isChecked) {
        uniqueLevels.add(el.name);
      }
    });

    if (num === 2 || num === 0) {
      UserInfoStore.setState({
        sexUrl: "",
      });
    } else {
      const newUrl = Array.from(uniqueLevels).join(",");
      UserInfoStore.setState({
        sexUrl: `${field}=${newUrl}&`,
      });
    }
  }, [sexes]);

  useEffect(() => {
    const num = verifications.filter((item) => item.isChecked).length;
    UserInfoStore.setState({
      allVerification: num === 2 || num === 0 ? true : false,
    });

    const uniqueLevels = new Set();
    verifications.forEach((el) => {
      if (el.isChecked) {
        uniqueLevels.add(el.value);
      }
    });

    if (num === 2 || num === 0) {
      UserInfoStore.setState({
        verificationUrl: "",
      });
    } else {
      const newUrl = Array.from(uniqueLevels).join(",");
      UserInfoStore.setState({
        verificationUrl: `${field1}=${newUrl}&`,
      });
    }
  }, [verifications]);

  useEffect(() => {
    const newUrl = addQuery(query, field, sexUrl);
    setQuery(newUrl);
  }, [sexUrl]);

  useEffect(() => {
    const newUrl = addQuery(query, field1, verificationUrl);
    setQuery(newUrl);
  }, [verificationUrl]);

  return (
    <div>
      <div className="search_set">
        <div className="search_set_title">Verification</div>
        <div className="flex items-center overflow-auto pb-2 custom-scrollbar">
          <div
            onClick={() => selectAllVerification()}
            className="checkbox_container text-nowrap"
          >
            <div
              className={`check_box mr-2 ${allVerification ? "active" : ""}`}
            >
              {allVerification && <i className="bi bi-check"></i>}
            </div>
            All
          </div>
          {verifications.map((item, index) => (
            <div
              onClick={() => selectVerification(index)}
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
      </div>
      <div className="search_set">
        <div className="search_set_title">Gender</div>
        <div className="flex items-center overflow-auto pb-2 custom-scrollbar">
          <div
            onClick={() => selectAll()}
            className="checkbox_container text-nowrap"
          >
            <div className={`check_box mr-2 ${allSexes ? "active" : ""}`}>
              {allSexes && <i className="bi bi-check"></i>}
            </div>
            All
          </div>
          {sexes.map((item, index) => (
            <div
              onClick={() => selectGender(index)}
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
      </div>
      <SchoolTab />
      {/* <AcademicLevelTab /> */}
      {/* <OriginPlaceTab />
      <StudyPlaceTab />
      <AcademicLevelTab />
      <CountryTab /> */}
    </div>
  );
}
