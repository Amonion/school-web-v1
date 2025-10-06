"use client";
import { appendForm } from "@/lib/helpers";
import { validateInputs } from "@/lib/validation";
import { useState, useEffect } from "react";
import AreaStore from "@/src/zustand/team/Area";
import { MessageStore } from "@/src/zustand/msgStore";
import { Area } from "@/src/interface/team/interface";

const CreateArea: React.FC = () => {
  const url = "/places/";
  let itemId: string | null = null;
  const [isEditing, setIsEditing] = useState(false);
  const [id, setId] = useState<string | null>("");
  // const [name, setName] = useState("");
  const { setMessage } = MessageStore();
  const {
    area,
    loadingArea,
    resetForm,
    form,
    postItem,
    setItemForm,
    getOneArea,
    updateItem,
  } = AreaStore();

  useEffect(() => {
    resetForm();
  }, []);

  useEffect(() => {
    const query = window.location.search;
    itemId = new URLSearchParams(query).get("id");
    setId(itemId);
    const stateId = new URLSearchParams(query).get("stateId");

    const initialize = async () => {
      if (stateId !== null) {
        await getOneArea(`${url}${stateId}`, setMessage, true);
      } else if (itemId !== null) {
        setIsEditing(true);
        setId(itemId);
        const existingItem = area.find((item) => item.id === itemId);
        if (existingItem) {
          populateFields(existingItem);
        } else {
          await getOneArea(`${url}${itemId}`, setMessage, false);
        }
      } else {
        setId(null);
        setIsEditing(false);
        // setName("");
      }
    };

    initialize();
  }, [itemId]);

  const populateFields = (item: Area) => {
    setItemForm("state", item.state);
    setItemForm("area", item.area);
    setItemForm("zipCode", item.zipCode);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setItemForm(name as keyof typeof form, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = !isEditing
      ? [
          {
            name: "country",
            value: form.country,
            rules: { blank: true, maxLength: 1000 },
            field: "Country field",
          },
          {
            name: "continent",
            value: form.continent,
            rules: { blank: true, maxLength: 1000 },
            field: "Continent field",
          },
          {
            name: "countryFlag",
            value: form.countryFlag,
            rules: { blank: true, minLength: 3, maxLength: 1000 },
            field: "countryFlag field",
          },
          {
            name: "countryCode",
            value: form.countryCode,
            rules: { blank: false, maxLength: 1000 },
            field: "Country code",
          },
          {
            name: "countrySymbol",
            value: form.countrySymbol,
            rules: { blank: false, maxLength: 1000 },
            field: "Country symbol",
          },
          {
            name: "currency",
            value: form.currency,
            rules: { blank: false, maxLength: 1000 },
            field: "Currency",
          },
          {
            name: "currencySymbol",
            value: form.currencySymbol,
            rules: { blank: false, maxLength: 1000 },
            field: "Currency symbol",
          },
          {
            name: "state",
            value: form.state,
            rules: { blank: false, maxLength: 1000 },
            field: "State field",
          },
          {
            name: "stateCapital",
            value: form.stateCapital,
            rules: { blank: false, maxLength: 1000 },
            field: "Capital field",
          },
          {
            name: "area",
            value: form.area,
            rules: { blank: false, maxLength: 1000 },
            field: "Area",
          },
          {
            name: "zipCode",
            value: form.zipCode,
            rules: { blank: false, maxLength: 1000 },
            field: "Zip code",
          },
          {
            name: "source",
            value: "State",
            rules: { blank: false, maxLength: 1000 },
            field: "State ",
          },
          {
            name: "stateLogo",
            value: form.stateLogo,
            rules: { blank: false, maxSize: 5 },
            field: "State Logo",
          },
        ]
      : [
          {
            name: "area",
            value: form.area,
            rules: { blank: false, minLength: 3, maxLength: 1000 },
            field: "Area",
          },
          {
            name: "source",
            value: "Area",
            rules: { blank: false, minLength: 3, maxLength: 1000 },
            field: "area",
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
      await postItem(`${url}`, data, setMessage);
    }
  };

  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">
          {isEditing ? `Update Area` : `Create Area`}
        </div>

        <div className="grid-2 grid-lay">
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Area
            </label>
            <input
              className="form-input"
              name="area"
              value={form.area}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter area"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Zip Code
            </label>
            <input
              className="form-input"
              name="zipCode"
              value={form.zipCode}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter zip code"
            />
          </div>
        </div>

        <div className="table-action flex flex-wrap">
          {loadingArea ? (
            <button className="custom_btn">
              <i className="bi bi-opencollective loading"></i>
              Processing...
            </button>
          ) : (
            <>
              <button className="custom_btn" onClick={handleSubmit}>
                {isEditing ? `Update Area` : `Create Area`}
              </button>
              {/* <Link href="/team/places/states" className="custom_btn ml-auto ">
                States Table
              </Link> */}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateArea;
