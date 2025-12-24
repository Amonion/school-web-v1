const FirstExamMessage = () => {
  return (
    <>
      <div className="flex-1 px-3 pt-5 pb-[55px] text-[var(--text-primary)]">
        <div
          className={`items-center pb-1 mb-5 relative border-b border-b-border dark:border-b-dark-border`}
        >
          <div className="text-[var(--text-secondary)] text-center text-xl mb-2">
            Important Notice Before You Begin
          </div>
          <div className="leading-[20px] text-center">
            Please read the online-test policy carefully before you begin this
            exercise, if you are comfortable you can click the play button at
            the bottom left to start. Else, simply exit this page.
          </div>
        </div>
        <div className="sm:bg-[var(--primary)] sm:p-3">
          <div className="text-justify sm:text-lg">
            In our effort to create a simple and academic platform where exam
            canditiates can test/practice with available past questions, we
            record every exercise performed by users, whether casual or formal.
            We do this simply to improve user experience, therefore we hope you
            are prepared for this test before you start. Once you begin and
            decides to end by any means, your progress will be scored as though
            you have completed the exercise.{' '}
            <div className="text-[var(--custom)]">
              Above all, feel free to prepare for as many exams as available on
              this platform, thanks.
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default FirstExamMessage
