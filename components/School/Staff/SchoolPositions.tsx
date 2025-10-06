'use client'
import SchoolStore from '@/src/zustand/school/School'
import StaffStore from '@/src/zustand/school/Staff'
import { usePathname } from 'next/navigation'

interface SchoolPositionsProps {
  handleSubmit: () => void
  setDisplayBox: (state: boolean) => void
}

const SchoolPositions: React.FC<SchoolPositionsProps> = ({
  setDisplayBox,
  handleSubmit,
}) => {
  const { schoolData, schoolPositions } = SchoolStore()
  const { loadingOffice } = StaffStore()
  const pathname = usePathname()

  const selectPosition = (id: string, int: number, isChecked: boolean) => {
    if (pathname.includes('/school/students')) {
      SchoolStore.setState((state) => {
        const position = state.schoolPositions.find((item) => item._id === id)
        if (!position) return state
        const arm = position.positionDivisions[int]

        if (!isChecked) {
          const newPosition = {
            index: position.positionsIndex,
            name: position.positionName,
            arm: arm.arm,
          }

          return {
            ...state,
            staffPositions: [newPosition],
          }
        } else {
          return {
            ...state,
            staffPositions: state.staffPositions.filter(
              (item) => item.index !== int
            ),
          }
        }
      })

      SchoolStore.setState((state) => {
        const newPositions = state.schoolPositions.map((item) => {
          if (int >= 0 && int < item.positionDivisions.length) {
            return {
              ...item,
              positionDivisions: item.positionDivisions.map((div, idx) => ({
                ...div,
                isChecked: idx === int && item._id === id ? true : false,
              })),
            }
          }
          if (int < 0) {
            return {
              ...item,
              positionDivisions: item.positionDivisions.slice(0, -1),
            }
          }

          return item
        })

        return {
          schoolPositions: newPositions,
        }
      })
    } else {
      SchoolStore.setState((state) => {
        const position = state.schoolPositions.find((item) => item._id === id)
        if (!position) return state
        const arm = position.positionDivisions[int]

        if (!isChecked) {
          const newPosition = {
            index: position.positionsIndex,
            name: position.positionName,
            arm: arm.arm,
          }

          return {
            ...state,
            staffPositions: [...state.staffPositions, newPosition],
          }
        } else {
          return {
            ...state,
            staffPositions: state.staffPositions.filter(
              (item) => item.index !== int
            ),
          }
        }
      })

      SchoolStore.setState((state) => {
        const newPositions = state.schoolPositions.map((item) => {
          if (item._id !== id) return item
          if (int >= 0 && int < item.positionDivisions.length) {
            return {
              ...item,
              positionDivisions: item.positionDivisions.map((div, idx) =>
                idx === int ? { ...div, isChecked: !div.isChecked } : div
              ),
            }
          }

          if (int < 0) {
            return {
              ...item,
              positionDivisions: item.positionDivisions.slice(0, -1),
            }
          }

          return item
        })

        return {
          schoolPositions: newPositions,
        }
      })
    }
  }

  return (
    <div
      onClick={() => setDisplayBox(false)}
      className="fixed bg-black/50  w-full h-full flex items-center justify-center z-40 top-0 left-0"
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
        }}
        className="flex w-full max-w-[1200px]"
      >
        <div
          onClick={() => setDisplayBox(false)}
          className="w-0 md:w-[290px]"
        ></div>
        <div className="card_body w-full overflow-auto min-h-[300px] max-h-[100vh] sharp flex-1 border border-[var(--border)]">
          <div className="grid xs:grid-cols-2 sm:grid-cols-3 gap-3 mb-10 items-start w-full">
            {schoolData.levels.map((level, int) => (
              <div className="" key={int}>
                <div className="mb-2 text-[var(--text-secondary)] text-lg">
                  {level.levelName} Levels
                </div>

                <div>
                  {Array.from({ length: level.maxLevel }, (_, index) => (
                    <div key={index} className="mb-5">
                      {schoolPositions
                        .filter(
                          (cls) =>
                            cls.positionName === level.levelName &&
                            cls.positionsIndex === index
                        )
                        .map((cls) =>
                          cls.positionDivisions.map((division, x) => (
                            <div
                              onClick={() =>
                                selectPosition(cls._id, x, division.isChecked)
                              }
                              key={x}
                              className={`flex items-start p-1 mb-2 border ${
                                division.isChecked
                                  ? 'border-[var(--custom)]'
                                  : 'border-[var(--border)]'
                              } cursor-pointer rounded-[5px]`}
                            >
                              {level.levelName} {index + 1} {division.arm}
                            </div>
                          ))
                        )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="table-action flex flex-wrap">
            {loadingOffice ? (
              <button className="custom_btn">
                <i className="bi bi-opencollective loading"></i>
                Processing...
              </button>
            ) : (
              <>
                <button
                  className="custom_btn mr-3 success"
                  onClick={handleSubmit}
                >
                  Submit
                </button>

                <button
                  className="custom_btn ml-auto"
                  onClick={() => setDisplayBox(false)}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SchoolPositions
