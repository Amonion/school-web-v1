"use client";
import Link from "next/link";
import { formatTimeTo12Hour, formatDateToDDMMYY } from "@/lib/helpers";
import { useState, useEffect } from "react";
import ObjectiveStore from "@/src/zustand/team/Objective";
import { MessageStore } from "@/src/zustand/msgStore";
import { Objective, Option, Paper } from "@/src/interface/team/interface";
import apiRequest from "@/lib/axios";
import Pagination from "@/components/Team/Pagination";
import Tiptap from "./Editor/TextEditor";
interface ObjectiveProps {
  urlProp: string;
}
const CreateExamQuestions: React.FC<ObjectiveProps> = ({ urlProp }) => {
  const url = "/competitions/leagues/objectives/";
  const {
    getObjectives,
    loading,
    postItem,
    resetForm,
    count,
    fetchQuestions,
    objectiveResults,
  } = ObjectiveStore();
  const [publishedAt, setPublishedAt] = useState<Date | null>(null);
  const [id, setId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [page_size, setSize] = useState<number | null>(10);
  const [sort] = useState("createdAt");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const [type, setType] = useState("Objective");
  const [leagueId, setLeagueId] = useState<string>("");
  const [paperId, setPaperId] = useState<string>("");
  const [duration, setDuration] = useState(0);
  const { setMessage } = MessageStore();
  const [optionsPerQuestion, setOptionPerQuestion] = useState(1);
  const [options, setOptions] = useState<Option[]>([]);
  const [questions, addQuestion] = useState<Objective[]>([]);
  const [deletedIDs, addIDs] = useState<string[]>([]);
  const [isEditingOption, setIsEditingOption] = useState(false);
  const [questionText, setQuestion] = useState<string>("");
  const [editingIndex, setEditingIndex] = useState<number>(0);
  const [addedIndex, setAddedIndex] = useState<number>(0);
  const optionsLabel = ["A", "B", "C", "D", "E", "F"];

  interface FetchResponse {
    exam: ExamData;
    message: string;
  }

  interface ExamData {
    count: number;
    page_size: number;
    data: Paper;
    placeId: string;
    _id: string;
    examId: string;
    optionsPerQuestion: number;
    questionsPerPage: number;
    duration: number;
    publishedAt: Date | null;
    title: string;
    type: string;
    subtitle: string;
    instruction: string;
  }

  useEffect(() => {
    const query = window.location.search;
    const id = new URLSearchParams(query).get("id");
    const getLeague = async () => {
      const response = await apiRequest<FetchResponse>(
        `/competitions/${urlProp}/${id}`
      );
      if (response?.data) {
        const size = response.data.exam.questionsPerPage;
        if (size) {
          setSize(size);
        }
        await getObjectives(
          `${url}?paperId=${id}&ordering=${sort}&page_size=${size}`,
          setMessage
        );

        const item = response.data.exam;
        setOptionPerQuestion(item.optionsPerQuestion);
        setTitle(item.title);
        setLeagueId(item.examId);
        setPaperId(item._id);
        setInstruction(item.instruction);
        setSubtitle(item.subtitle);
        setDuration(item.duration);
        setPublishedAt(item.publishedAt);
        const newOptions = Array.from(
          { length: item.optionsPerQuestion },
          (_, index) => ({
            index: index + 1,
            value: "",
            isSelected: false,
            isClicked: false,
          })
        );
        setOptions(newOptions);
        const items = ObjectiveStore.getState().objectiveResults;
        addQuestion([]);
        for (let i = 0; i < items.length; i++) {
          const el = items[i];
          addQuestion((prevQuestions) => [...prevQuestions, el]);
        }
        setType(item.type);
      }
    };

    getLeague();
    resetForm();
  }, []);

  useEffect(() => {
    const items = ObjectiveStore.getState().objectiveResults;

    addQuestion([]);
    for (let i = 0; i < items.length; i++) {
      const el = items[i];
      addQuestion((prevQuestions) => [...prevQuestions, el]);
    }
    setAddedIndex(0);
  }, [objectiveResults]);

  useEffect(() => {
    fetchQuestions(
      `${url}?paperId=${paperId}&ordering=${sort}&page_size=${page_size}&page=${currentPage}`
    );
  }, [currentPage]);

  const editOptions = (
    options: Option[],
    question: string,
    id: string,
    index: number
  ) => {
    setOptions(options);
    setQuestion(question);
    setIsEditingOption(true);
    setId(id);
    setEditingIndex(index);
  };

  const resetQuestion = (num: number) => {
    if (type === "Objective") {
      const newOptions = Array.from({ length: num }, (_, index) => ({
        index: index + 1,
        value: "",
        isSelected: false,
        isClicked: false,
      }));
      setOptions(newOptions);
    }
    setQuestion("");
  };

  const removeQuestion = (id: string) => {
    addQuestion((prev) => prev.filter((q) => q._id !== id));
    addIDs((prevDeletedIDs) => [...prevDeletedIDs, id]);
  };

  const handleSelect = (selectedIndex: number) => {
    setOptions((prevOptions) =>
      prevOptions.map((option) => ({
        ...option,
        isSelected: option.index === selectedIndex,
      }))
    );
  };

  const handleOptionChange = (index: number, newValue: string) => {
    setOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.index === index ? { ...option, value: newValue } : option
      )
    );
  };

  const handleQuestionIndex = (optionArray: Option[]) => {
    const question: Objective = {
      options: optionArray,
      _id: id,
      index: count + addedIndex,
      question: questionText.trim(),
      isSelected: false,
      isClicked: false,
    };
    addQuestion((prevQuestions) => [...prevQuestions, question]);
    setAddedIndex(addedIndex + 1);
  };

  const handleAddQuestion = () => {
    if (isEditingOption) {
      const updatedQuestion: Objective = {
        _id: id,
        options: options,
        index: editingIndex,
        question: questionText,
        isSelected: false,
        isClicked: false,
      };
      addQuestion((prevQuestions) =>
        prevQuestions.map((question) =>
          question._id === id ? updatedQuestion : question
        )
      );

      resetQuestion(optionsPerQuestion);
      setIsEditingOption(false);
      setAddedIndex(editingIndex);
    } else {
      if (questionText.trim() === ``) {
        setMessage(`Please type in your question to continue`, false);
        return;
      }
      if (type === "Objective") {
        let selected = false;
        const optionArray = [];
        for (let i = 0; i < options.length; i++) {
          const el = options[i];
          if (el.value.trim() === "") {
            setMessage(`Option number ${i + 1} cannot be empty`, false);
            return;
          }
          if (el.isSelected) {
            selected = true;
          }
          el.value.trim();
          optionArray.push(el);
        }
        if (!selected) {
          setMessage(
            `One of the options must be marked as a correct answer to continue`,
            false
          );
          return;
        }

        handleQuestionIndex(optionArray);
      } else {
        handleQuestionIndex([]);
      }
      resetQuestion(optionsPerQuestion);
    }
  };

  const handleSubmit = async () => {
    if (addedIndex === 0 && deletedIDs.length === 0) {
      setMessage("You have not added any new question to submit.", false);
      return;
    }
    interface Quest {
      options: Option[];
      index: number;
      paperId: string;
      _id: string;
      leagueId: string;
      question: string;
      isSelected: boolean;
    }
    const questArray: Quest[] = [];
    questions.forEach((item) => {
      const obj = {
        options: item.options,
        index: item.index,
        paperId: paperId,
        leagueId: leagueId,
        question: item.question,
        _id: item._id,
        isSelected: item.isSelected,
      };
      questArray.push(obj);
    });

    const form = new FormData();
    form.append("questions", JSON.stringify(questArray));
    form.append("leagueId", leagueId);
    form.append("deletedIDs", JSON.stringify(deletedIDs));
    postItem(
      `${url}?paperId=${paperId}&page_size=${page_size}&page=${currentPage}ordering=${sort}`,
      form,
      setMessage
    );
  };

  return (
    <>
      <div className="card_body">
        <div className="paper_head">
          <div className="paper_title">{title}</div>
          <div className="paper_subtitle">{subtitle}</div>
          <div className=" mb-2">{instruction}</div>

          <div className="flex justify-center flex-wrap">
            <div className="paper_info">Duration: {duration}min</div>
            <div className="paper_info">
              Type:&nbsp;
              {type}
            </div>
            <div className="paper_info">
              Time: {formatTimeTo12Hour(publishedAt)}
            </div>
            <div className="paper_info">
              Date: {formatDateToDDMMYY(publishedAt)}
            </div>
          </div>
        </div>

        {questions.map((question, index) => (
          <div key={index} className="questions">
            <div className="each_question">
              {page_size && (
                <div className="question_num">
                  {(currentPage - 1) * page_size + index + 1}
                </div>
              )}
              <div className="question_bd flex-grow">
                <div className="question">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: question.question,
                    }}
                  ></div>
                </div>
                {question.options.map((item, int) => (
                  <div key={int} className="each_option">
                    <div className="option_num">{optionsLabel[int]})</div>
                    <div className="option_num">{item.value}</div>
                  </div>
                ))}
                <div className="flex w-full justify-end text-[var(--custom-color)]">
                  <i
                    onClick={() => removeQuestion(question._id)}
                    className="bi bi-trash cursor-pointer text-lg"
                  ></i>
                  <i
                    onClick={() =>
                      editOptions(
                        question.options,
                        question.question,
                        question._id,
                        question.index
                      )
                    }
                    className="bi bi-pencil-square cursor-pointer text-lg ml-3"
                  ></i>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center">
          <div>Results {count}</div>
          {page_size && (
            <Pagination
              currentPage={currentPage}
              totalItems={count}
              pageSize={page_size}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        {type === "Objective" && (
          <div className="mb-3">
            {optionsPerQuestion > 0 && (
              <div className="">
                {options.map((item, index) => (
                  <div key={index}>
                    <label className="flex flex-col" htmlFor="">
                      Option {optionsLabel[index]}
                    </label>
                    <div className="flex">
                      <input
                        className="form-input"
                        name="subtitle"
                        value={item.value}
                        onChange={(e) =>
                          handleOptionChange(item.index, e.target.value)
                        }
                        type="text"
                        placeholder="Enter subtitle"
                      />
                      <div
                        onClick={() => handleSelect(item.index)}
                        className={`${
                          item.isSelected ? "bg-[var(--custom-color)]" : ""
                        } option_ticker`}
                      >
                        {item.isSelected && (
                          <i className="bi bi-check-lg text-white text-2xl"></i>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <label className="label" htmlFor="">
          Write Question
        </label>
        <Tiptap
          value={questionText}
          onChange={(content) => setQuestion(content)}
        />

        <div className="flex flex-wrap">
          <button className="custom_btn" onClick={handleAddQuestion}>
            Add Question
          </button>
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
              <Link
                href="/team/competitions/exams"
                className="custom_btn ml-auto "
              >
                Exams Table
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateExamQuestions;
