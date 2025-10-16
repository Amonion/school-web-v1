const CountdownTimer = ({
  durationInSeconds = 1,
  isActive,
  isLastResults,
  setDisplayResult,
  isInteracting,
  startCountdown,
  isLoading,
  submit,
  total,
  answered,
  timeLeft,
}) => {
  const radius = 18
  const circumference = 2 * Math.PI * radius

  const progress = (timeLeft / durationInSeconds) * circumference
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="fixed z-30 w-full sm:pb-[20px] sm:bottom-0 bottom-[60px] left-0">
      <div className="custom_container">
        <div className="flex w-full justify-between">
          <div className="w-[300px] hidden sm:block"></div>

          <div className="flex-1 px-[10px] items-end flex justify-between pb-[2px]">
            {isActive ? (
              <div className="flex relative flex-col items-center">
                <div className="relative w-[40px] h-[40px] flex justify-center items-center">
                  <svg className="absolute" width="42" height="42">
                    <circle
                      cx="21"
                      cy="21"
                      r={radius}
                      stroke="white"
                      strokeWidth="5"
                      fill="none"
                    />
                    <circle
                      cx="21"
                      cy="21"
                      r={radius}
                      stroke="var(--custom)"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={progress}
                      strokeLinecap="round"
                      transform="rotate(-90 21 21)"
                      style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                  </svg>

                  <div className="absolute text-white flex justify-center items-center text-sm bg-[var(--custom)] rounded-full w-[36px] h-[36px]">
                    {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                  </div>
                  <div className="absolute text-[var(--text-secondary)] left-[50%] text-lg right-[-50%] translate-x-[-50%] top-[-25px]">
                    {answered}/{total}
                  </div>
                </div>
              </div>
            ) : isLastResults ? (
              <div onClick={setDisplayResult} className="test_circle">
                <i className="bi bi-table"></i>
              </div>
            ) : (
              <></>
            )}

            {isLoading ? (
              <div onClick={submit} className={`test_circle  `}>
                <i className="bi bi-opencollective animate-spin"></i>
              </div>
            ) : (
              <div>
                {isActive && (
                  <div
                    onClick={submit}
                    className={`test_circle mb-2 transition-transform duration-500 `}
                  >
                    <i className="bi bi-send"></i>
                  </div>
                )}
                {!isLastResults && (
                  <div
                    onClick={startCountdown}
                    className={`test_circle transition-transform duration-500 ${
                      isInteracting ? 'opacity-100' : 'opacity-0 hidden'
                    }`}
                  >
                    {isActive ? (
                      <i className="bi bi-stop-fill"></i>
                    ) : (
                      <i className="bi bi-play-fill"></i>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="w-[300px] hidden md:block"></div>
        </div>
      </div>
    </div>
  )
}

export default CountdownTimer
