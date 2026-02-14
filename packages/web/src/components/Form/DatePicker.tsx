import { EARLIEST_DATE, type Nullable } from "@darkruby/assets-core";
import { endOfToday, startOfDay } from "date-fns";
import { forwardRef, useMemo } from "react";
import DatePickerLib from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DATE_FORMAT } from "../../util/date";

export type DatePickerProps = {
  date: Date;
  time?: boolean;
  disabled?: boolean;
  onChange: (d: Date) => void;
  latest?: Date;
  earliest?: Date;
};

export const DatePicker: React.FC<DatePickerProps> = ({
  date,
  onChange,
  time = true,
  disabled = false,
  latest = endOfToday(),
  earliest = startOfDay(EARLIEST_DATE)
}: DatePickerProps) => {
  const includeDateIntervals = useMemo(
    () => [{ start: earliest, end: latest }],
    [earliest, latest]
  );
  const handleChange = (d: Nullable<Date>) => (d ? onChange(d) : void 0);
  return (
    <DatePickerLib
      closeOnScroll
      selected={date}
      showYearDropdown
      disabled={disabled}
      showTimeSelect={time}
      onChange={handleChange}
      dateFormat={DATE_FORMAT}
      customInput={<DatePickerButton />}
      includeDateIntervals={includeDateIntervals}
    />
  );
};

type DateButtonProps = {
  value?: string;
  onClick?: () => void;
};

const DatePickerButton = forwardRef<HTMLButtonElement, DateButtonProps>(
  ({ value, onClick }, ref) => (
    <button type="button" className="btn btn-dark" onClick={onClick} ref={ref}>
      {value}
    </button>
  )
);
