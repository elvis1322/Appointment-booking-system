import { useState, useEffect } from "react";
import {Container,Typography,Paper,Button,Box,
  Alert,FormControl,InputLabel,Select,MenuItem,CircularProgress,} from "@mui/material";

import { useNavigate } from "react-router-dom";

import Calendar from "../../components/Calendar";
import TimeSlots from "../../components/TimeSlots";

import {
  createAppointment,
  getBookedSlots,
} from "../../api/appointmentApi";

import type { BookedSlot } from "../../api/appointmentApi";

import { createOrder } from "../../api/orderApi";
import { getServices, getEmployees, getWorkingHours, getDaysOff } from "../../api/staffApi";

import type { Service, Employee, WorkingHour, DayOff } from "../../types/staff.types";

import axios from "axios";

import { useTranslation } from "react-i18next";

export default function BookingPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [workerId, setWorkerId] = useState<string>("");
  const [serviceId, setServiceId] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);

  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [daysOff, setDaysOff] = useState<DayOff[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  useEffect(() => {
    getServices()
      .then(setServices)
      .catch(() => setServices([]))
      .finally(() => setLoadingServices(false));
  }, []);

  useEffect(() => {
    getEmployees()
      .then(setEmployees)
      .catch(() => setEmployees([]))
      .finally(() => setLoadingEmployees(false));
  }, []);

  
  useEffect(() => {
    setWorkerId("");
    setTime("");
    setDate("");
  }, [serviceId]);

  useEffect(() => {
    if (!date) {
      setBookedSlots([]);
      return;
    }

    setLoadingSlots(true);
    setTime("");

    Promise.all([
      getBookedSlots(date).catch(() => []),
      getServices().catch(() => services),
      getEmployees().catch(() => employees),
      workerId ? getWorkingHours(workerId).catch(() => []) : Promise.resolve([]),
      workerId ? getDaysOff(workerId).catch(() => []) : Promise.resolve([]),
    ])
      .then(([slots, freshServices, freshEmployees, wh, doff]) => {
        setBookedSlots(slots);
        setServices(freshServices);
        setEmployees(freshEmployees);
        if (workerId) {
          setWorkingHours(wh);
          setDaysOff(doff);
        }
      })
      .finally(() => setLoadingSlots(false));
  }, [date]);

  useEffect(() => {
    if (!workerId) {
      setWorkingHours([]);
      setDaysOff([]);
      return;
    }

    setTime("");
    setLoadingSchedule(true);
    Promise.all([
      getWorkingHours(workerId).catch(() => []),
      getDaysOff(workerId).catch(() => []),
      getServices().catch(() => services),
      getEmployees().catch(() => employees),
    ])
      .then(([wh, doff, freshServices, freshEmployees]) => {
        setWorkingHours(wh);
        setDaysOff(doff);
        setServices(freshServices);
        setEmployees(freshEmployees);
      })
      .finally(() => setLoadingSchedule(false));
  }, [workerId]);

  const selectedService = services.find(
    (s) => s.id === serviceId
  );

  const durationMinutes = selectedService?.durationMinutes ?? 30;
  let buffer = 4;
  if (durationMinutes >= 45) buffer = 10;
  else if (durationMinutes > 30) buffer = 8;
  const intervalMinutes = durationMinutes + buffer;

 
  const normalizeTime = (t: string): string => {
    if (!t) return "00:00:00";
    const parts = t.replace(/\..+$/, "").split(":");
    const hh = (parts[0] ?? "00").padStart(2, "0");
    const mm = (parts[1] ?? "00").padStart(2, "0");
    const ss = (parts[2] ?? "00").padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  let isUnavailable = false;
  let employeeStartTime = "09:00:00";
  let employeeEndTime = "17:00:00";

  if (date && workerId) {
    const [year, month, day] = date.split("-").map(Number);
    const selectedDateObj = new Date(year, month - 1, day);
    const dayOfWeek = selectedDateObj.getDay();

    const isDayOff = daysOff.some(d => d.date === date);
    const wh = workingHours.find(w => w.dayOfWeek === dayOfWeek);

    if (isDayOff || !wh) {
      isUnavailable = true;
    } else {
      employeeStartTime = normalizeTime(wh.startTime);
      employeeEndTime = normalizeTime(wh.endTime);
    }
  }

  const handleBook = async (payNow: boolean = true) => {
    if (!date || !time || !workerId) {
      setError(t("booking.errorMissingFields", "Please fill all required fields."));
      return;
    }

    if (!serviceId) {
      setError(t("booking.errorMissingService", "Please select a service."));
      return;
    }

    
    const selectedDateTime = new Date(`${date}T${time}:00`);
    const now = new Date();

    if (selectedDateTime.getTime() <= now.getTime()) {
      setError(
        t("booking.errorPastTime", "You cannot book in the past.") ||
          "You cannot book in the past."
      );
      return;
    }

    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      const durationMinutes =
        selectedService?.durationMinutes ?? 60;

      const startTime = new Date(
        `${date}T${time}:00`
      );

      const endTime = new Date(
        startTime.getTime() +
          durationMinutes * 60 * 1000
      );

      const formatLocalDate = (d: Date) => {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      };

      const appointment = await createAppointment({
        startTime: formatLocalDate(startTime),
        endTime: formatLocalDate(endTime),
        serviceId,
        EmployeeId: workerId,
      });

      const price = selectedService?.price ?? 0;

      const order = await createOrder({
        appointmentId: appointment.id,
        totalAmount: price,
      });

      setSuccess(true);

      setTimeout(() => {
        if (payNow) {
          navigate(`/payment/${order.id}`);
        } else {
          navigate("/my-bookings");
        }
      }, 1500);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg: string = err.response?.data?.message || '';
        if (msg.toLowerCase().includes('already have an appointment')) {
          setError(t('booking.conflictError', 'You already have an appointment at this time.'));
        } else if (msg) {
          setError(msg);
        } else {
          setError(t('booking.errorBusy', 'The selected time slot is busy.'));
        }
      } else {
        setError(t('booking.errorBookingFailed', 'Failed to book the appointment.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          border: "1px solid rgba(255, 255, 255, 0.05)",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.37)",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0))",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* HEADER */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h4"
            color="primary"
            sx={{ fontWeight: 800 }}
          >
            {t("booking.title")}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
          >
            {t("booking.subtitle")}
          </Typography>
        </Box>

        {/* ERROR / SUCCESS */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {t("booking.success")}
          </Alert>
        )}

        {/* FORM */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* SERVICE */}
          <FormControl fullWidth>
            <InputLabel>
              {t("booking.selectService")}
            </InputLabel>

            <Select
              value={serviceId}
              label={t("booking.selectService")}
              onChange={(e) =>
                setServiceId(e.target.value)
              }
              disabled={loadingServices}
            >
              {loadingServices ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                </MenuItem>
              ) : services.length === 0 ? (
                <MenuItem disabled>
                  {t("booking.noServices")}
                </MenuItem>
              ) : (
                services
                  .filter((s) => s.isActive)
                  .map((s) => (
                    <MenuItem
                      key={s.id}
                      value={s.id}
                    >
                      {s.name} —{" "}
                      {s.durationMinutes}{" "}
                      {t("booking.minutes")} — €
                      {s.price.toFixed(2)}
                    </MenuItem>
                  ))
              )}
            </Select>
          </FormControl>

          {/* WORKER — filtered by selected service */}
          {(() => {
            const filtered = !serviceId
              ? []
              : employees.filter((e) => {
                  if (!e.isActive) return false;
                  return e.serviceIds?.includes(serviceId);
                });

            return (
              <FormControl fullWidth disabled={!serviceId || loadingEmployees}>
                <InputLabel>{t("booking.selectProfessional")}</InputLabel>
                <Select
                  value={workerId}
                  label={t("booking.selectProfessional")}
                  onChange={(e) => {
                    setWorkerId(e.target.value);
                    setDate("");
                    setTime("");
                  }}
                >
                  {loadingEmployees ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : !serviceId ? (
                    <MenuItem disabled>
                      {t('booking.selectServiceFirst', 'Select a service first')}
                    </MenuItem>
                  ) : filtered.length === 0 ? (
                    <MenuItem disabled>
                      {t('booking.noStaffAvailable', 'No staff available for this service')}
                    </MenuItem>
                  ) : (
                    filtered.map((e) => (
                      <MenuItem key={e.id} value={e.id}>
                        {e.firstName} {e.lastName}
                        {e.jobTitle ? ` — ${e.jobTitle}` : ""}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            );
          })()}

          {/* DATE */}
          <Calendar
            date={date}
            setDate={setDate}
          />

          {/* TIME */}
          {loadingSlots || loadingSchedule ? (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress size={28} />
            </Box>
          ) : !workerId ? (
            <Alert severity="info">
              {t('booking.selectEmployeeFirst', 'Please select a professional to see available times.')}
            </Alert>
          ) : !date ? (
            <Alert severity="info">
              {t('booking.selectDateFirst', 'Please select a date to see available times.')}
            </Alert>
          ) : (
            <TimeSlots
              time={time}
              setTime={setTime}
              bookedSlots={bookedSlots}
              selectedDate={date}
              intervalMinutes={intervalMinutes}
              isUnavailable={isUnavailable}
              employeeStartTime={employeeStartTime}
              employeeEndTime={employeeEndTime}
            />
          )}
        </Box>

        {/* SUMMARY */}
        {selectedService && date && time && (
          <Paper
            elevation={0}
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              bgcolor:
                "rgba(25,118,210,0.06)",
              border:
                "1px solid rgba(25,118,210,0.15)",
            }}
          >
            <Typography
              variant="subtitle2"
              color="primary"
              sx={{ fontWeight: 700 }}
            >
              {t("booking.summaryTitle")}
            </Typography>

            <Typography variant="body2">
              {t("booking.service")}:{" "}
              {selectedService.name}
            </Typography>

            <Typography variant="body2">
              {t("booking.duration")}:{" "}
              {selectedService.durationMinutes}{" "}
              {t("booking.minutes")}
            </Typography>

            <Typography variant="body2">
              {t("booking.date")}:{" "}
              {new Date(
                `${date}T${time}:00`
              ).toLocaleDateString(
                i18n.language === "sq"
                  ? "sq-AL"
                  : i18n.language === "de"
                  ? "de-DE"
                  : "en-US",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </Typography>

            <Typography variant="body2">
              {t("booking.time")}: {time}
            </Typography>

            <Typography
              variant="h6"
              sx={{ mt: 1, fontWeight: 800 }}
              color="primary"
            >
              {t("booking.total")}: €
              {selectedService.price.toFixed(2)}
            </Typography>
          </Paper>
        )}

        {/* BUTTONS */}
        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => handleBook(true)}
            disabled={submitting || success}
            sx={{
              py: 1.8,
              borderRadius: 3,
              fontWeight: 800,
              boxShadow:
                "0 4px 15px rgba(25,118,210,0.4)",
              "&:hover": {
                boxShadow:
                  "0 6px 20px rgba(25,118,210,0.6)",
              },
            }}
          >
            {submitting ? (
              <CircularProgress size={26} color="inherit" />
            ) : (
              t("booking.confirmBtn")
            )}
          </Button>

          <Button
            variant="contained"
            fullWidth
            size="large"
            color="error"
            onClick={() => handleBook(false)}
            disabled={submitting || success}
            sx={{
              py: 1.8,
              borderRadius: 3,
              fontWeight: 800,
              boxShadow:
                "0 4px 15px rgba(211,47,47,0.4)",
              "&:hover": {
                boxShadow:
                  "0 6px 20px rgba(211,47,47,0.6)",
              },
            }}
          >
            {submitting ? (
              <CircularProgress size={26} color="inherit" />
            ) : (
              t("payment.payLater")
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}