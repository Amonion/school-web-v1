"use client";
import { NavStore } from "@/src/zustand/msgStore";
import { useEffect, useState } from "react";
import _debounce from "lodash/debounce";
import { Get } from "@/lib/api";
import QuestionCard from "./QuestionCard";
import { Exam } from "@/src/interface/team/interface";

export default function QuestionList() {
  const { query, searchedText, tab } = NavStore();
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState<Exam[]>();
  const url = "/competitions/exams/find";

  useEffect(() => {
    const findItems = _debounce(async () => {
      setLoading(true);
      const response = await Get(
        `${url}/?${query}title=${searchedText}&name=${searchedText}&instruction=${searchedText}&subtitle=${searchedText}`
      );
      if (response?.data) {
        setExams(response?.data as unknown as Exam[]);
        setLoading(false);
      } else {
        setLoading(false);
      }
    }, 2000);

    if (tab === "questions") {
      findItems();
    }

    return () => {
      findItems.cancel();
    };
  }, [searchedText, tab]);

  useEffect(() => {
    return () => setExams([]);
  }, []);

  return (
    <div className="flex flex-col w-full">
      {loading && (
        <div className="flex items-center h-10 justify-center flex-wrap w-full">
          <i
            className={`bi  bi-opencollective loading  text-md text-[var(--custom-color)]`}
          ></i>
        </div>
      )}
      {exams &&
        exams.length > 0 &&
        exams.map((item, index) => <QuestionCard key={index} exam={item} />)}
    </div>
  );
}
