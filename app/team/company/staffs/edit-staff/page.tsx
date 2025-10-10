"use client";
import Link from "next/link";
import { appendForm } from "@/lib/helpers";
import { validateInputs } from "@/lib/validation";
import { useState, useEffect } from "react";
import StaffStore from "@/src/zustand/team/Staff";
import { MessageStore } from "@/src/zustand/msgStore";
import PositionStore from "@/src/zustand/team/Position";
import { Staff } from "@/src/interface/team/interface";
import { Position } from "@/src/interface/team/interface";

const EditStaff: React.FC = () => {
  const url = "/users/staffs/";
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const { setMessage } = MessageStore();
  const [isPositionList, setPositionList] = useState(false);
  const [position, setPosition] = useState("Select Position");
  const { formData, setForm, getItems, postItem, results, updateItem } =
    StaffStore();
  const { getPositions, positionResults } = PositionStore();

  const handleSelect = (value: Position) => {
    setForm("level", value.level);
    setForm("position", value.position);
    setForm("role", value.role);
    setForm("salary", value.salary);
    setForm("duties", value.duties);
    setPositionList(false);
    setPosition(value.position);
  };

  useEffect(() => {
    const query = window.location.search;
    const itemId = new URLSearchParams(query).get("id");
    const name = new URLSearchParams(query).get("name");

    const initialize = async () => {
      if (positionResults.length === 0) {
        await getPositions("/company/positions", setMessage);
      }

      if (itemId !== null) {
        setId(itemId);
        setName(String(name));
        setIsEditing(true);
        const existingItem = results.find((item) => item._id === itemId);
        if (existingItem) {
          populateFields(existingItem);
        } else {
          await getItems(`${url}`, setMessage);
          const fetchedItems = StaffStore.getState().results.find(
            (item) => item._id === itemId
          );
          if (fetchedItems) {
            populateFields(fetchedItems);
          } else {
            console.warn("Place with the specified ID was not found.");
            return;
          }
        }
      } else {
        setId("");
        setIsEditing(false);
        setName("");
      }
    };

    initialize();
  }, [results, getItems]);

  const populateFields = (item: Staff) => {
    setForm("level", item.level);
    setForm("username", item.username);
    setForm("firstName", item.firstName);
    setForm("middleName", item.middleName);
    setForm("lastName", item.lastName);
    setForm("countryFlag", item.countryFlag);
    setForm("country", item.country);
    setForm("state", item.state);
    setForm("area", item.area);
    setForm("stateId", item.stateId);
    setForm("salary", item.salary);
    setForm("position", item.position);
    setForm("duties", item.duties);
    setForm("role", item.role);
    setPosition(item.position);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: "role",
        value: formData.role,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: "Role",
      },
      {
        name: "level",
        value: formData.level,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: "Level",
      },
      {
        name: "salary",
        value: formData.salary,
        rules: { blank: false, maxSize: 3 },
        field: "Salary",
      },
      {
        name: "position",
        value: formData.position,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: "Position",
      },
      {
        name: "duties",
        value: formData.duties,
        rules: { blank: false },
        field: "Duties",
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
      updateItem(`${url}${id}/`, data, setMessage);
    } else {
      await postItem(url, data, setMessage);
    }
  };

  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">{isEditing && `Update Staff `}</div>
        <div className="grid-2 grid-lay">
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Staff Username
            </label>
            <div className="form-input">{name}</div>
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Staff Salary
            </label>
            {formData.salary ? (
              <div className="form-input">{formData.salary}</div>
            ) : (
              <div className="form-input">No Staff Salary</div>
            )}
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Staff Position
            </label>
            {formData.position ? (
              <div className="form-input">{formData.position}</div>
            ) : (
              <div className="form-input">No Staff Position</div>
            )}
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Staff Level
            </label>
            {formData.level ? (
              <div className="form-input">{formData.level}</div>
            ) : (
              <div className="form-input">No Staff Level</div>
            )}
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Staff Role
            </label>
            {formData.role ? (
              <div className="form-input">{formData.role}</div>
            ) : (
              <div className="form-input">No Staff Role</div>
            )}
          </div>

          <div className="flex flex-col relative">
            <label className="label" htmlFor="">
              Position
            </label>
            <div
              onClick={() => setPositionList((e) => !e)}
              className="form-input cursor-pointer"
            >
              {position}
              <i
                className={`bi bi-caret-down-fill ml-auto ${
                  isPositionList ? "active" : ""
                } `}
              ></i>
            </div>
            {isPositionList && (
              <div className="input_drop">
                {positionResults.map((item, index) => (
                  <div
                    onClick={() => handleSelect(item)}
                    key={index}
                    className="input_drop_list"
                  >
                    {item.position}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="table-action flex">
          {isLoading ? (
            <button className="custom_btn">
              <i className="bi bi-opencollective loading"></i>
              Processing...
            </button>
          ) : (
            <>
              <button className="custom_btn" onClick={handleSubmit}>
                Update Staff
              </button>
              <Link href="/team/company" className="custom_btn ml-auto ">
                Staff Table
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default EditStaff;
