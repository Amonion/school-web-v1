import React, { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { format } from 'date-fns'

// Custom CSS to ensure event day backgrounds are applied without curved radius
const customStyles = `
  .react-calendar__tile--hasEvents {
    background-color: #D48AAE !important;
    color: #fff !important;
  }
  .react-calendar__tile--hasEvents:hover {
    background-color: #bfdbfe !important;
  }
`

// Sample event data (replace with your actual data source, e.g., API fetch)
const sampleEvents = [
  {
    date: new Date(2025, 8, 5),
    title: 'Parent-Teacher Meeting',
    description: 'Discuss student progress',
  },
  {
    date: new Date(2025, 8, 5),
    title: 'Student play day sport',
    description: 'Discuss student progress',
  },
  {
    date: new Date(2025, 8, 10),
    title: 'School Holiday',
    description: 'Labor Day',
  },
  {
    date: new Date(2025, 8, 15),
    title: 'Exam Week Starts',
    description: 'Mid-term exams',
  },
  {
    date: new Date(2025, 8, 20),
    title: 'Sports Day',
    description: 'Annual school sports event',
  },
]

interface Event {
  date: Date
  title: string
  description: string
}

interface EventCalendarWidgetProps {
  events?: Event[] // Optional prop for events, defaults to sample
}

const EventCalendarWidget: React.FC<EventCalendarWidgetProps> = ({
  events = sampleEvents,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [activeDate, setActiveDate] = useState(new Date())

  // Function to check if a date has events
  const hasEvents = (date: Date) => {
    return events.some(
      (event) =>
        event.date.getFullYear() === date.getFullYear() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getDate() === date.getDate()
    )
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(
      (event) =>
        event.date.getFullYear() === date.getFullYear() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getDate() === date.getDate()
    )
  }

  // Custom tile content for adding a dot
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && hasEvents(date)) {
      return (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[var(--custom)] rounded-full" />
      )
    }
    return null
  }

  // Custom tile class for background color on event days
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && hasEvents(date)) {
      return 'react-calendar__tile--hasEvents'
    }
    return ''
  }

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  return (
    <div className="bg-[var(--primary)] px-3 py-5 rounded-lg max-w-md mx-auto">
      <style>{customStyles}</style>
      <h2 className="text-xl font-semibold mb-4">Upcoming School Events</h2>

      {/* Calendar Component */}
      <Calendar
        onClickDay={(date) => handleDateClick(date)} // use this for selection
        value={selectedDate || new Date()} // highlight current day if nothing is selected
        activeStartDate={activeDate} // control visible month
        onActiveStartDateChange={({ activeStartDate }) =>
          setActiveDate(activeStartDate || new Date())
        }
        tileContent={tileContent}
        tileClassName={tileClassName}
        className="border-none bg-black outline-none"
        next2Label={null}
        prev2Label={null}
      />

      {/* Event Details Panel */}
      {selectedDate && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">
            Events on {format(selectedDate, 'MMMM do, yyyy')}
          </h3>
          {getEventsForDate(selectedDate).length > 0 ? (
            <ul className="space-y-2">
              {getEventsForDate(selectedDate).map((event, index) => (
                <li
                  key={index}
                  className="text-sm mb-3  p-4 bg-[var(--secondary)] rounded-md"
                >
                  <span className="font-bold text-[var(--custom)]">
                    {event.title}
                  </span>
                  : {event.description}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm">No events scheduled for this day.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default EventCalendarWidget
