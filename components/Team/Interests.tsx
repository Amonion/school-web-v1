"use client";
import Link from "next/link";
import { appendForm } from "@/lib/helpers";
import { validateInputs } from "@/lib/validation";
import { useState, useEffect } from "react";
import InterestStore from "@/src/zustand/team/Company";
import { MessageStore } from "@/src/zustand/msgStore";
import { Company } from "@/src/interface/team/interface";

const CreateInterest: React.FC = () => {
  const url = "/company/interests";
  const {
    formData,
    setForm,
    getItems,
    loading,
    postItem,
    results,
    updateItem,
  } = InterestStore();

  const [isEditing, setIsEditing] = useState(false);
  const [id, setId] = useState<string | null>("");
  const { setMessage } = MessageStore();

  useEffect(() => {
    const initialize = async () => {
      const existingItem = results[0];
      if (existingItem) {
        setId(existingItem._id);
        setIsEditing(true);
        populateFields(existingItem);
      } else {
        await getItems(`${url}`, setMessage);
        const existingItem = results[0];
        if (existingItem) {
          setIsEditing(true);
          setId(existingItem._id);
          populateFields(existingItem);
        } else {
          console.warn("Place with the specified ID was not found.");
        }
      }
    };

    initialize();
  }, [results]);

  const populateFields = (item: Company) => {
    setForm("name", item.name);
    setForm("domain", item.domain);
    setForm("email", item.email);
    setForm("phone", item.phone);
    setForm("headquaters", item.headquaters);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(name as keyof typeof formData, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: "email",
        value: formData.email,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: "Email field",
      },
      {
        name: "name",
        value: formData.name,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: "Name field",
      },
      {
        name: "headquaters",
        value: formData.headquaters,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: "Headquaters field",
      },
      {
        name: "phone",
        value: formData.phone,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: "Phone Id",
      },
      {
        name: "domain",
        value: formData.domain,
        rules: { blank: false, maxLength: 1000 },
        field: "Domain field",
      },
    ];
    const { messages } = validateInputs(inputsToValidate);
    const getFirstNonEmptyMessage = (
      messages: Record<string, string>
    ): string | null => {
      for (const key in messages) {
        if (messages[key].trim() !== "") {
          return messages[key];
        }
      }
      return null;
    };

    const firstNonEmptyMessage = getFirstNonEmptyMessage(messages);
    if (firstNonEmptyMessage) {
      setMessage(firstNonEmptyMessage, false);
      return;
    }
    e.preventDefault();
    const data = appendForm(inputsToValidate);
    if (isEditing) {
      updateItem(`${url}${id}`, data, setMessage);
    } else {
      postItem(`${url}`, data, setMessage);
    }
  };

  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">Update Company</div>

        <div className="grid-2 grid-lay">
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Name
            </label>
            <input
              className="form-input"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter name"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Domain
            </label>
            <input
              className="form-input"
              name="domain"
              value={formData.domain}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter domain"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Email
            </label>
            <input
              className="form-input"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter email"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Phone
            </label>
            <input
              className="form-input"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter phone"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Headquaters
            </label>
            <input
              className="form-input"
              name="headquaters"
              value={formData.headquaters}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter headquaters"
            />
          </div>
        </div>

        <div className="table-action flex flex-wrap">
          {loading ? (
            <button className="custom_btn">
              <i className="bi bi-opencollective loading"></i>
              Processing...
            </button>
          ) : (
            <>
              <button className="custom_btn" onClick={handleSubmit}>
                Submit
              </button>
              <Link href="/team/company" className="custom_btn ">
                Staff Table
              </Link>
              <Link href="/team/company/branches" className="custom_btn">
                Branches Table
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateInterest;
