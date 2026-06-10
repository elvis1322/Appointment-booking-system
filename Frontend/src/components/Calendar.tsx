import { TextField } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";

type Props = {
  date: string;
  setDate: (value: string) => void;
};

export default function Calendar({
  date,
  setDate,
}: Props) {
  const { t } = useTranslation();

  const [focused, setFocused] =
    useState(false);

  const theme = useTheme();

  const isDark =
    theme.palette.mode === "dark";

  return (
    <TextField
      fullWidth
      margin="normal"
      type={
        focused || date
          ? "date"
          : "text"
      }
      label={t(
        "booking.appointmentDate"
      )}
      value={date}
      onChange={(e) =>
        setDate(e.target.value)
      }
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      slotProps={{
        inputLabel: {
          shrink: focused || !!date,
        },
        htmlInput: {
          min: new Date()
            .toISOString()
            .split("T")[0],
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root":
          {
            borderRadius: 3,
            transition:
              "all 0.2s ease",

            backgroundColor: isDark
              ? "rgba(255,255,255,0.03)"
              : "#fff",

            "& fieldset": {
              borderColor: isDark
                ? "rgba(255,255,255,0.12)"
                : "rgba(0,0,0,0.15)",
            },

            "&:hover fieldset": {
              borderColor:
                theme.palette.primary.main,
            },

            "&.Mui-focused fieldset":
              {
                borderWidth: 2,
                borderColor:
                  theme.palette.primary.main,
              },
          },

        "& input": {
          color: isDark
            ? "#fff"
            : "#111",
          colorScheme: isDark
            ? "dark"
            : "light",
        },

        "& label": {
          color: isDark
            ? "rgba(255,255,255,0.7)"
            : "rgba(0,0,0,0.6)",
        },

        "& label.Mui-focused": {
          color:
            theme.palette.primary.main,
        },

        "& input::-webkit-calendar-picker-indicator":
          {
            cursor: "pointer",
            filter: isDark
              ? "brightness(0) invert(1)"
              : "none",
          },
      }}
    />
  );
}