"use client";
import { useEffect } from "react";
import { NavStore } from "@/src/zustand/msgStore";
import { addQuery } from "@/lib/helpers";
import UserInfoStore from "@/src/zustand/users/UserInfo";

export default function AccountTab() {
  const { query, setQuery, setPage } = NavStore();
  const { allVerification, verificationUrl, verifications } = UserInfoStore();

  const field1 = "isVerified";

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
    const newUrl = addQuery(query, field1, verificationUrl);
    setQuery(newUrl);
    setPage(1);
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
    </div>
  );
}
