'use client'
interface PercentageChangeProps {
  percentage: number
}

const PercentageChange: React.FC<PercentageChangeProps> = ({ percentage }) => {
  return (
    <div
      className={`flex items-center ${
        percentage >= 0 ? 'text-green-400' : 'text-red-400'
      }`}
    >
      {percentage >= 0
        ? `+ ${percentage.toFixed(2)}%`
        : ` ${percentage.toFixed(2)}%`}
    </div>
  )
}

export default PercentageChange
