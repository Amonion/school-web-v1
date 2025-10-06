"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import UploadStore from "@/src/zustand/users/Upload";
import { MessageStore, uploadStore } from "@/src/zustand/msgStore";
import { validateInputs } from "@/lib/validation";
import { appendForm } from "@/lib/helpers";
import { useAuthStore } from "@/src/zustand/authStore";

const UploadFile: React.FC = () => {
  const url = "/posts/uploads/";
  const { loading, postItem, setForm, formData, updateItem } = UploadStore();

  const [currentPage] = useState(1);
  const [page_size] = useState<number | null>(10);
  const [sort] = useState("createdAt");
  const [id, setId] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { off } = uploadStore();
  const { setMessage } = MessageStore();
  const { user } = useAuthStore();

  useEffect(() => {
    setId(formData._id);
    if (formData._id !== "") {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(name as keyof typeof formData, value);
  };

  const handleFileChange =
    (key: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : "";
      setForm(key, file);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: "mediaName",
        value: formData.mediaName,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: "Media Name",
      },
      {
        name: "media",
        value: formData.media,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: "Media field",
      },
      {
        name: "username",
        value: String(user?.username),
        rules: { blank: false, minLength: 3, maxLength: 100 },
        field: "Username",
      },
      {
        name: "userId",
        value: String(user?._id),
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: "User Id",
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
      updateItem(
        `${url}${id}?ordering=${sort}&page_size=${page_size}&page=${currentPage}`,
        data,
        setMessage
      );
    } else {
      postItem(
        `${url}?ordering=${sort}&page_size=${page_size}&page=${currentPage}`,
        data,
        setMessage
      );
    }
  };

  return (
    <>
      <div
        onClick={off}
        className="flex justify-center items-center h-[100vh] bg-black bg-opacity-50"
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="card_body "
        >
          <div className="flex mb-10">
            <input
              className="form-input"
              name="mediaName"
              value={formData.mediaName}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter name of file"
            />
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

                <label htmlFor="media" className="custom_btn ">
                  <input
                    className="input-file"
                    type="file"
                    name="media"
                    id="media"
                    accept="image/*"
                    onChange={handleFileChange("media")}
                  />
                  <i className="bi bi-cloud-arrow-up text-2xl mr-2"></i>
                  File
                </label>

                <Link
                  href="/team/competitions/exams/uploads"
                  className="custom_btn ml-auto "
                >
                  Uploads Table
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadFile;
