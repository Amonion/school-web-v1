"use client";
import { useEffect } from "react";
import { MessageStore } from "@/src/zustand/msgStore";
import InterestStore from "@/src/zustand/team/Interest";
import UserStore from "@/src/zustand/users/User";
const Interest = () => {
  const { setMessage } = MessageStore();
  const { getUsers } = UserStore();
  const { getInterests, resetForm, interestResults, toggleChecked } =
    InterestStore();

  useEffect(() => {
    getInterests(`/company/interests`, setMessage);
    getUsers(`/users`, setMessage);
    resetForm();
  }, []);

  return (
    <div className="welcome_slide">
      <div className="title">SELECT </div>
      <div className="text-sm">YOUR</div>
      <div className="intro_title">SOCIAL INTERESTS</div>

      <div className="flex mb-5 flex-wrap w-full max-h-[400px] overflow-x-auto">
        {interestResults.map((item, index) => (
          <div
            onClick={() => toggleChecked(index)}
            key={index}
            className="custom_btn line neutral"
          >
            <div className={`checkbox ${item.isChecked ? "active" : ""}`}>
              {item.isChecked && (
                <i className="bi bi-check text-white text-lg"></i>
              )}
            </div>
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Interest;
