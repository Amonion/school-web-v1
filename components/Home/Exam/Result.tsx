import { formatDate, formatTimeTo12Hour } from '@/lib/helpers'
import { UserExam } from '@/src/zustand/exam/UserExam'

interface ExamResultProps {
  setDisplayResult: () => void
  exam: UserExam
}
const ExamResult: React.FC<ExamResultProps> = ({ setDisplayResult, exam }) => {
  return (
    <div className="fixed z-50 w-full overflow-auto top-0 left-0 flex justify-center">
      <div className="custom_container">
        <div className="flex h-[100vh] w-full justify-between items-center">
          <div className="w-[300px] hidden sm:block"></div>
          <div className="flex flex-1 justify-center mb-5 ">
            <table className="xs max-w-[600px] border border-[var(--border)] bg-[var(--primary)]">
              <thead>
                <tr className="text-[var(--text-secondary)]">
                  <td>SN</td>
                  <td>Property</td>
                  <td>Value</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Date</td>
                  <td>{formatDate(new Date(exam.started))}</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Started</td>
                  <td>{formatTimeTo12Hour(exam.started)}</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>Ended</td>
                  <td>{formatTimeTo12Hour(exam.ended)}</td>
                </tr>
                <tr>
                  <td>4</td>
                  <td>Duration</td>
                  <td>
                    {Math.round((exam.ended - exam.started) / 60000)} mins
                  </td>
                </tr>
                <tr>
                  <td>5</td>
                  <td>Questions</td>
                  <td>{exam.questions}</td>
                </tr>
                <tr>
                  <td>6</td>
                  <td>Answered</td>
                  <td>{exam.attemptedQuestions}</td>
                </tr>
                <tr>
                  <td>7</td>
                  <td>Passed</td>
                  <td>{exam.totalCorrectAnswer}</td>
                </tr>
                <tr>
                  <td>8</td>
                  <td>Speed</td>
                  <td>{exam.rate.toFixed(3)} quests/sec</td>
                </tr>
                <tr>
                  <td>9</td>
                  <td>Accuracy</td>
                  <td>{(exam.accuracy * 100).toFixed(2)} %</td>
                </tr>
                <tr>
                  <td>10</td>
                  <td>Metric</td>
                  <td>{(exam.accuracy * exam.rate).toFixed(5)}</td>
                </tr>
                <tr>
                  <td
                    onClick={setDisplayResult}
                    className="text-center text-white bg-[var(--custom)] cursor-pointer"
                    colSpan={3}
                  >
                    Close Table
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="w-[300px] hidden md:block"></div>
        </div>
      </div>
    </div>
  )
}

export default ExamResult
