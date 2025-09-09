// components/CalendarRangePicker.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react';

type CalendarRangePickerProps = {
  startDate?: Date;
  endDate?: Date;
  onChange?: (start: Date, end: Date) => void;
};

const CalendarRangePicker = ({
  startDate: initialStart,
  endDate: initialEnd,
  onChange,
}: CalendarRangePickerProps) => {
  const [open, setOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(initialStart || new Date());
  const [startDate, setStartDate] = useState<Date | null>(initialStart || null);
  const [endDate, setEndDate] = useState<Date | null>(initialEnd || null);
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);

  useEffect(() => {
    if (startDate && endDate) {
      onChange?.(startDate, endDate);
    }
  }, [startDate, endDate, onChange]);

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: { day: number; isCurrentMonth: boolean; date: Date }[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -(startingDayOfWeek - i - 1));
      days.push({
        day: prevDate.getDate(),
        isCurrentMonth: false,
        date: prevDate,
      });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(year, month, day),
      });
    }
    const remaining = 42 - days.length;
    for (let day = 1; day <= remaining; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ day, isCurrentMonth: false, date: nextDate });
    }
    return days;
  };

  const navigateMonth = (dir: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + dir);
      return newDate;
    });
  };

  const isSameDay = (a: Date | null, b: Date | null) =>
    a?.toDateString() === b?.toDateString();
  const isInRange = (date: Date) =>
    startDate && endDate ? date >= startDate && date <= endDate : false;

  const handleDateClick = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;

    if (!isSelectingRange) {
      setIsSelectingRange(true);
      setTempStartDate(date);
      setStartDate(date);
      setEndDate(null);
    } else {
      if (date < (tempStartDate as Date)) {
        setStartDate(date);
        setEndDate(tempStartDate);
      } else {
        setEndDate(date);
      }
      setIsSelectingRange(false);
      setTempStartDate(null);
      setOpen(false); // close popover when range is selected
    }
  };

  const formatRange = () => {
    if (startDate && endDate) {
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    }
    if (startDate) return startDate.toLocaleDateString();
    return 'Select Date Range';
  };

  const days = getDaysInMonth(currentDate);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-4 w-[320px]">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map((d) => (
            <div
              key={d}
              className="text-center text-sm font-medium text-gray-600 py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map(({ day, isCurrentMonth, date }, i) => {
            const isStart = isSameDay(date, startDate);
            const isEnd = isSameDay(date, endDate);
            const inRange = isInRange(date);

            let className =
              'w-10 h-10 flex items-center justify-center text-sm rounded cursor-pointer ';
            if (!isCurrentMonth) {
              className += 'text-gray-300 ';
            } else if (isStart || isEnd) {
              className += 'bg-blue-500 text-white ';
            } else if (inRange) {
              className += 'bg-blue-100 text-blue-800 ';
            } else {
              className += 'text-gray-700 hover:bg-gray-100 ';
            }

            return (
              <button
                key={i}
                onClick={() => handleDateClick(date, isCurrentMonth)}
                className={className}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="mt-2 text-xs text-gray-500 text-center">
          {isSelectingRange ? 'Select end date' : 'Select date range'}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CalendarRangePicker;
