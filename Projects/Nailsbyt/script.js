const galleryTrack = document.getElementById("galleryTrack");
const scrollButtons = document.querySelectorAll("[data-direction]");
const bookingForm = document.getElementById("bookingForm");
const formResponse = document.getElementById("formResponse");
const bookingDateInput = document.getElementById("bookingDate");
const bookingTimeSelect = document.getElementById("bookingTime");
const timeAvailabilityNote = document.getElementById("timeAvailabilityNote");
const calendarTrigger = document.getElementById("calendarTrigger");
const calendarValue = document.getElementById("calendarValue");
const calendarPanel = document.getElementById("calendarPanel");
const calendarMonth = document.getElementById("calendarMonth");
const calendarGrid = document.getElementById("calendarGrid");
const calendarPrev = document.getElementById("calendarPrev");
const calendarNext = document.getElementById("calendarNext");
const inspoUpload = document.getElementById("inspoUpload");
const photoStatus = document.getElementById("photoStatus");
const ownerLoginForm = document.getElementById("ownerLoginForm");
const ownerPasswordInput = document.getElementById("ownerPassword");
const loginResponse = document.getElementById("loginResponse");
const ownerLogout = document.getElementById("ownerLogout");
const ownerBookingQueue = document.getElementById("ownerBookingQueue");
const ownerDayDetails = document.getElementById("ownerDayDetails");
const ownerCalendarGrid = document.getElementById("ownerCalendarGrid");
const ownerCalendarMonth = document.getElementById("ownerCalendarMonth");
const ownerCalendarPrev = document.getElementById("ownerCalendarPrev");
const ownerCalendarNext = document.getElementById("ownerCalendarNext");
const ownerStatPending = document.getElementById("ownerStatPending");
const ownerStatDeposit = document.getElementById("ownerStatDeposit");
const ownerStatReady = document.getElementById("ownerStatReady");
const ownerStatConfirmed = document.getElementById("ownerStatConfirmed");
const ownerDashboardResponse = document.getElementById("ownerDashboardResponse");

const OWNER_AUTH_KEY = "nailsbyt-owner-auth";
const BOOKINGS_STORAGE_KEY = "nailsbyt-bookings-v2";
const OWNER_PASSWORD = "Password123";
const DEPOSIT_LINK = "https://example.com/nailsbyt-deposit";
const STUDIO_LOCATION = "Nails By T Studio";
const STANDARD_SLOT_LABELS = ["9:00 AM", "2:00 PM", "7:00 PM"];
const TIME_LABEL_TO_INPUT = {
  "9:00 AM": "09:00",
  "2:00 PM": "14:00",
  "7:00 PM": "19:00",
};
const STATUS_LABELS = {
  pending_review: "Needs review",
  deposit_requested: "Deposit sent",
  deposit_paid: "Ready to confirm",
  confirmed: "Confirmed",
};
const STATUS_CLASSES = {
  pending_review: "is-pending",
  deposit_requested: "is-deposit",
  deposit_paid: "is-ready",
  confirmed: "is-confirmed",
};
const SERVICE_DURATIONS = {
  "Gloss Refresh": 90,
  "Signature Sculpt": 120,
  "Freestyle Deluxe": 150,
  "Acrylic Base": 120,
  "Polygel Base": 120,
  "Gel-X Base": 120,
  "Fill Appointment": 90,
};

const monthFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
});

const selectedDateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const longDateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const submittedAtFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const today = new Date();
today.setHours(0, 0, 0, 0);

let calendarViewDate = bookingDateInput?.value
  ? parseDateValue(bookingDateInput.value)
  : getNextAvailableDate(today);
let ownerCalendarViewDate = new Date(today.getFullYear(), today.getMonth(), 1);
let ownerSelectedDate = "";
let ownerPendingCancellationId = "";

function getOwnerAuthState() {
  try {
    return window.localStorage.getItem(OWNER_AUTH_KEY) === "true";
  } catch (error) {
    return false;
  }
}

function setOwnerAuthState(isLoggedIn) {
  try {
    if (isLoggedIn) {
      window.localStorage.setItem(OWNER_AUTH_KEY, "true");
      return;
    }

    window.localStorage.removeItem(OWNER_AUTH_KEY);
  } catch (error) {
    // Ignore storage errors and keep the interface usable.
  }
}

function readJsonStorage(key, fallbackValue) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallbackValue;
    return JSON.parse(raw);
  } catch (error) {
    return fallbackValue;
  }
}

function loadBookings() {
  const stored = readJsonStorage(BOOKINGS_STORAGE_KEY, []);
  if (!Array.isArray(stored)) return [];

  return stored
    .map(normalizeBooking)
    .sort((bookingA, bookingB) => {
      const dateCompare = bookingA.date.localeCompare(bookingB.date);
      if (dateCompare !== 0) return dateCompare;

      const timeCompare = getTimeOrder(bookingA) - getTimeOrder(bookingB);
      if (timeCompare !== 0) return timeCompare;

      return String(bookingA.createdAt || "").localeCompare(String(bookingB.createdAt || ""));
    });
}

function saveBookings(bookings) {
  try {
    window.localStorage.setItem(
      BOOKINGS_STORAGE_KEY,
      JSON.stringify(bookings.map(normalizeBooking)),
    );
  } catch (error) {
    // Ignore storage errors and keep the interface usable.
  }
}

function normalizeBooking(booking) {
  const requestedTime = String(
    booking?.requestedTime || booking?.time || booking?.preferredTime || "",
  );

  return {
    id: String(booking?.id || ""),
    status: booking?.status || "pending_review",
    name: String(booking?.name || ""),
    service: String(booking?.service || ""),
    date: String(booking?.date || ""),
    requestedTime,
    calendarTime:
      typeof booking?.calendarTime === "string"
        ? booking.calendarTime
        : STANDARD_SLOT_LABELS.includes(requestedTime)
          ? labelToTimeInput(requestedTime)
          : "",
    email: String(booking?.email || ""),
    instagram: String(booking?.instagram || ""),
    notes: String(booking?.notes || ""),
    inspoCount: Number(booking?.inspoCount || 0),
    inspoFiles: Array.isArray(booking?.inspoFiles) ? booking.inspoFiles : [],
    inspoPreviews: Array.isArray(booking?.inspoPreviews) ? booking.inspoPreviews : [],
    createdAt: booking?.createdAt || "",
    depositRequestedAt: booking?.depositRequestedAt || "",
    depositPaidAt: booking?.depositPaidAt || "",
    confirmedAt: booking?.confirmedAt || "",
    firstConfirmedAt: booking?.firstConfirmedAt || "",
  };
}

function getNextAvailableDate(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);

  while (next.getDay() === 0 || next.getDay() === 1) {
    next.setDate(next.getDate() + 1);
  }

  return next;
}

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateValue(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function isBookableDate(date) {
  const compare = new Date(date);
  compare.setHours(0, 0, 0, 0);
  const day = compare.getDay();
  return compare >= today && day >= 2 && day <= 6;
}

function closeCalendar() {
  if (!calendarPanel || !calendarTrigger) return;
  calendarPanel.hidden = true;
  calendarTrigger.setAttribute("aria-expanded", "false");
}

function updatePhotoStatus() {
  if (!inspoUpload || !photoStatus) return;

  const count = inspoUpload.files?.length ?? 0;
  photoStatus.textContent =
    count > 0
      ? `${count} inspo photo${count === 1 ? "" : "s"} added.`
      : "Add at least 1 inspo photo before sending your request.";
}

function createInspoPreview(file) {
  return new Promise((resolve) => {
    if (!file?.type?.startsWith("image/")) {
      resolve({ name: file?.name || "inspo", dataUrl: "" });
      return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      const image = new Image();

      image.addEventListener("load", () => {
        const longestSide = Math.max(image.width, image.height) || 1;
        const scale = Math.min(1, 420 / longestSide);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");

        if (!context) {
          resolve({ name: file.name, dataUrl: String(reader.result || "") });
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve({
          name: file.name,
          dataUrl: canvas.toDataURL("image/jpeg", 0.72),
        });
      });

      image.addEventListener("error", () => {
        resolve({ name: file.name, dataUrl: String(reader.result || "") });
      });

      image.src = String(reader.result || "");
    });

    reader.addEventListener("error", () => {
      resolve({ name: file.name, dataUrl: "" });
    });

    reader.readAsDataURL(file);
  });
}

async function buildInspoPreviews(files) {
  const previewFiles = files.slice(0, 3);
  return Promise.all(previewFiles.map((file) => createInspoPreview(file)));
}

function updateCalendarValue(date) {
  if (!calendarValue || !bookingDateInput) return;

  if (!date) {
    bookingDateInput.value = "";
    calendarValue.textContent = "Choose Tuesday-Saturday";
    syncTimeAvailability();
    return;
  }

  bookingDateInput.value = formatDateValue(date);
  calendarValue.textContent = selectedDateFormatter.format(date);
  syncTimeAvailability();
}

function renderCalendar() {
  if (!calendarMonth || !calendarGrid) return;

  const monthStart = new Date(
    calendarViewDate.getFullYear(),
    calendarViewDate.getMonth(),
    1,
  );
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());

  calendarMonth.textContent = monthFormatter.format(monthStart);
  calendarGrid.innerHTML = "";

  for (let index = 0; index < 42; index += 1) {
    const cellDate = new Date(gridStart);
    cellDate.setDate(gridStart.getDate() + index);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.textContent = String(cellDate.getDate());

    const inCurrentMonth = cellDate.getMonth() === monthStart.getMonth();
    const allowed = isBookableDate(cellDate);
    const isSelected =
      bookingDateInput?.value && formatDateValue(cellDate) === bookingDateInput.value;
    const isToday = formatDateValue(cellDate) === formatDateValue(today);
    const isBlockedWeekday = cellDate.getDay() === 0 || cellDate.getDay() === 1;

    if (!inCurrentMonth) button.classList.add("is-outside");
    if (!allowed) {
      button.disabled = true;
      button.classList.add("is-blocked");
    }
    if (isSelected) button.classList.add("is-selected");
    if (isToday) button.classList.add("is-today");
    if (isBlockedWeekday) {
      button.setAttribute("aria-label", `${cellDate.toDateString()} unavailable`);
    }

    if (allowed) {
      button.addEventListener("click", () => {
        updateCalendarValue(cellDate);
        calendarViewDate = new Date(
          cellDate.getFullYear(),
          cellDate.getMonth(),
          1,
        );
        renderCalendar();
        closeCalendar();
      });
    }

    calendarGrid.appendChild(button);
  }
}

function labelToTimeInput(label) {
  if (TIME_LABEL_TO_INPUT[label]) return TIME_LABEL_TO_INPUT[label];

  const match = label.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return "";

  let hour = Number(match[1]);
  const minutes = match[2];
  const suffix = match[3].toUpperCase();

  if (suffix === "PM" && hour !== 12) hour += 12;
  if (suffix === "AM" && hour === 12) hour = 0;

  return `${String(hour).padStart(2, "0")}:${minutes}`;
}

function timeInputToLabel(value) {
  const [hourString, minuteString] = String(value).split(":");
  const hours = Number(hourString);
  const minutes = Number(minuteString);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return "";

  const suffix = hours >= 12 ? "PM" : "AM";
  const twelveHour = hours % 12 || 12;
  return `${twelveHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function getBookingCalendarTimeValue(booking) {
  if (booking.calendarTime) return booking.calendarTime;
  if (STANDARD_SLOT_LABELS.includes(booking.requestedTime)) {
    return labelToTimeInput(booking.requestedTime);
  }

  return "";
}

function getBookingCalendarLabel(booking) {
  const calendarTime = getBookingCalendarTimeValue(booking);
  if (calendarTime) return timeInputToLabel(calendarTime);
  return booking.requestedTime;
}

function getTimeOrder(booking) {
  const label = typeof booking === "string" ? booking : getBookingCalendarLabel(booking);
  const timeValue = labelToTimeInput(label);
  if (!timeValue) return label === "Out of hours request" ? 999 : 888;

  const [hours, minutes] = timeValue.split(":").map(Number);
  return hours * 60 + minutes;
}

function getConfirmedSlotsForDate(dateValue) {
  return loadBookings()
    .filter((booking) => booking.status === "confirmed" && booking.date === dateValue)
    .map((booking) => getBookingCalendarLabel(booking))
    .filter((label) => STANDARD_SLOT_LABELS.includes(label));
}

function syncTimeAvailability() {
  if (!bookingTimeSelect) return;

  const selectedDate = bookingDateInput?.value || "";
  const blocked = selectedDate ? getConfirmedSlotsForDate(selectedDate) : [];
  const blockedSet = new Set(blocked);

  Array.from(bookingTimeSelect.options).forEach((option) => {
    if (!option.value) return;

    const label = option.value;
    if (label === "Out of hours request") {
      option.disabled = false;
      option.textContent = "Out of hours request";
      return;
    }

    const isBlocked = blockedSet.has(label);
    option.disabled = isBlocked;
    option.textContent = isBlocked ? `${label} - booked` : label;
  });

  if (
    bookingTimeSelect.value &&
    Array.from(bookingTimeSelect.options).some(
      (option) => option.value === bookingTimeSelect.value && option.disabled,
    )
  ) {
    bookingTimeSelect.value = "";
  }

  if (!timeAvailabilityNote) return;

  if (!selectedDate) {
    timeAvailabilityNote.textContent =
      "Confirmed appointments automatically grey out unavailable time slots.";
    return;
  }

  if (blocked.length === 0) {
    timeAvailabilityNote.textContent =
      "All standard booking slots are currently open for this date.";
    return;
  }

  if (blocked.length === STANDARD_SLOT_LABELS.length) {
    timeAvailabilityNote.textContent =
      "Standard time slots are fully booked for this date. Out-of-hours requests can still be submitted.";
    return;
  }

  timeAvailabilityNote.textContent = `Booked for this date: ${blocked.join(", ")}.`;
}

function createBookingId() {
  return `bk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getStatusLabel(status) {
  return STATUS_LABELS[status] || "Booking";
}

function getStatusClass(status) {
  return STATUS_CLASSES[status] || "is-pending";
}

function formatDisplayDate(dateValue) {
  if (!dateValue) return "No date selected";
  return longDateFormatter.format(parseDateValue(dateValue));
}

function formatSubmittedAt(value) {
  if (!value) return "Not sent yet";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not sent yet";
  return submittedAtFormatter.format(parsed);
}

function getServiceDuration(service) {
  return SERVICE_DURATIONS[service] || 120;
}

function getBookingStartDate(booking) {
  if (!booking?.date) return null;

  const timeValue = getBookingCalendarTimeValue(booking);
  if (!timeValue) return null;

  const [year, month, day] = booking.date.split("-").map(Number);
  const [hours, minutes] = timeValue.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

function formatCalendarStamp(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}00`;
}

function escapeIcsText(value) {
  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\n", "\\n");
}

function createBookingDescription(booking) {
  return [
    `Client: ${booking.name}`,
    `Email: ${booking.email}`,
    booking.instagram ? `Instagram: ${booking.instagram}` : "",
    `Service: ${booking.service}`,
    `Requested date: ${booking.date}`,
    `Requested time: ${booking.requestedTime}`,
    `Calendar time: ${getBookingCalendarLabel(booking) || "Pending"}`,
    booking.notes ? `Notes: ${booking.notes}` : "",
    booking.inspoFiles?.length
      ? `Inspo files: ${booking.inspoFiles.join(", ")}`
      : `Inspo files: ${booking.inspoCount || 0} attached`,
  ]
    .filter(Boolean)
    .join("\n");
}

function createGoogleCalendarUrl(booking) {
  const startDate = getBookingStartDate(booking);
  if (!startDate) return "#";

  const endDate = new Date(startDate.getTime() + getServiceDuration(booking.service) * 60000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Nails By T • ${booking.service} • ${booking.name}`,
    dates: `${formatCalendarStamp(startDate)}/${formatCalendarStamp(endDate)}`,
    details: createBookingDescription(booking),
    location: STUDIO_LOCATION,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function createAppleCalendarDataUri(booking) {
  const startDate = getBookingStartDate(booking);
  if (!startDate) return "#";

  const endDate = new Date(startDate.getTime() + getServiceDuration(booking.service) * 60000);
  const icsFile = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nails By T//Owner Dashboard//EN",
    "BEGIN:VEVENT",
    `UID:${booking.id}@nailsbyt.local`,
    `DTSTAMP:${formatCalendarStamp(new Date())}`,
    `DTSTART:${formatCalendarStamp(startDate)}`,
    `DTEND:${formatCalendarStamp(endDate)}`,
    `SUMMARY:${escapeIcsText(`Nails By T - ${booking.service} - ${booking.name}`)}`,
    `DESCRIPTION:${escapeIcsText(createBookingDescription(booking))}`,
    `LOCATION:${escapeIcsText(STUDIO_LOCATION)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsFile)}`;
}

function createMailtoUrl(booking, stage) {
  if (!booking?.email) return "#";

  const calendarLabel = getBookingCalendarLabel(booking) || "To be confirmed";
  const subject =
    stage === "deposit"
      ? `Nails By T deposit request for ${booking.date}`
      : stage === "cancellation"
        ? `Nails By T booking cancelled for ${booking.date}`
        : `Nails By T booking confirmed for ${booking.date}`;

  const body =
    stage === "deposit"
      ? [
          `Hi ${booking.name},`,
          "",
          `Your ${booking.service} request for ${formatDisplayDate(booking.date)} at ${calendarLabel} has been reviewed and can be held for you.`,
          "",
          `To secure the appointment, please complete your deposit here: ${DEPOSIT_LINK}`,
          "",
          "Once the deposit is received, your final confirmation will be sent over.",
          "",
          "Nails By T",
        ].join("\n")
      : stage === "cancellation"
        ? [
            `Hi ${booking.name},`,
            "",
            `Your ${booking.service} appointment for ${formatDisplayDate(booking.date)} at ${calendarLabel} has been cancelled.`,
            "",
            "If you would like to rebook, please submit a new request through the booking form.",
            "",
            "Nails By T",
          ].join("\n")
      : [
          `Hi ${booking.name},`,
          "",
          `Your ${booking.service} appointment is now confirmed for ${formatDisplayDate(booking.date)} at ${calendarLabel}.`,
          "",
          "Please arrive on time and bring any final inspo updates before your slot.",
          "",
          "Nails By T",
        ].join("\n");

  return `mailto:${encodeURIComponent(booking.email)}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}

function launchMailto(url) {
  if (!url || url === "#") return;
  window.location.href = url;
}

function getQueueCalendarTimeValue(bookingId, fallbackValue = "") {
  const queueInput = document.getElementById(`queueCalendarTime-${bookingId}`);
  return queueInput?.value || fallbackValue;
}

function hasConfirmedSlotConflict(bookings, booking, timeValue) {
  const label = timeValue ? timeInputToLabel(timeValue) : getBookingCalendarLabel(booking);
  if (!STANDARD_SLOT_LABELS.includes(label)) return false;

  return bookings.some(
    (entry) =>
      entry.id !== booking.id &&
      entry.status === "confirmed" &&
      entry.date === booking.date &&
      getBookingCalendarLabel(entry) === label,
  );
}

function setOwnerMessage(message) {
  if (!ownerDashboardResponse) return;
  ownerDashboardResponse.textContent = message;
}

function getDayBookings(bookings, dateValue) {
  return bookings
    .filter((booking) => booking.status === "confirmed" && booking.date === dateValue)
    .sort((bookingA, bookingB) => getTimeOrder(bookingA) - getTimeOrder(bookingB));
}

function renderOwnerStats(bookings) {
  if (ownerStatPending) {
    ownerStatPending.textContent = String(
      bookings.filter((booking) => booking.status === "pending_review").length,
    );
  }

  if (ownerStatDeposit) {
    ownerStatDeposit.textContent = String(
      bookings.filter((booking) => booking.status === "deposit_requested").length,
    );
  }

  if (ownerStatReady) {
    ownerStatReady.textContent = String(
      bookings.filter((booking) => booking.status === "deposit_paid").length,
    );
  }

  if (ownerStatConfirmed) {
    ownerStatConfirmed.textContent = String(
      bookings.filter((booking) => booking.status === "confirmed").length,
    );
  }
}

function renderQueueCard(booking) {
  let primaryAction = "";
  let secondaryAction = "";
  const queueTimeValue = getBookingCalendarTimeValue(booking);
  const inspoPreviewMarkup = booking.inspoPreviews?.length
    ? `
        <div class="queue-inspo-grid">
          ${booking.inspoPreviews
            .map(
              (preview) => `
                <figure class="queue-inspo-card">
                  <img
                    class="queue-inspo-image"
                    src="${preview.dataUrl}"
                    alt="Inspo photo ${escapeHtml(preview.name || "uploaded by client")}"
                  />
                </figure>
              `,
            )
            .join("")}
        </div>
      `
    : "";

  if (booking.status === "pending_review") {
    primaryAction = `
      <button class="queue-action is-primary" type="button" data-action="approve-slot" data-booking-id="${booking.id}">
        Approve slot + email deposit
      </button>
    `;
  }

  if (booking.status === "deposit_requested") {
    primaryAction = `
      <button class="queue-action is-primary" type="button" data-action="mark-paid" data-booking-id="${booking.id}">
        Mark deposit paid
      </button>
    `;
    secondaryAction = `
      <a class="detail-link" href="${createMailtoUrl(booking, "deposit")}">
        Open deposit email
      </a>
    `;
  }

  if (booking.status === "deposit_paid") {
    primaryAction = `
      <button class="queue-action is-primary" type="button" data-action="confirm-booking" data-booking-id="${booking.id}">
        Final confirm
      </button>
    `;
  }

  return `
    <article class="queue-card ${getStatusClass(booking.status)}">
      <div class="queue-card-head">
        <div>
          <p class="queue-name">${escapeHtml(booking.name)}</p>
          <p class="queue-meta">${escapeHtml(booking.service)} • ${escapeHtml(shortDateFormatter.format(parseDateValue(booking.date)))}</p>
        </div>
        <span class="status-pill ${getStatusClass(booking.status)}">${escapeHtml(getStatusLabel(booking.status))}</span>
      </div>
      <p class="queue-secondary">${escapeHtml(booking.requestedTime)} • ${escapeHtml(booking.email)}</p>
      ${booking.instagram ? `<p class="queue-secondary">${escapeHtml(booking.instagram)}</p>` : ""}
      ${inspoPreviewMarkup}
      <label class="queue-time-field" for="queueCalendarTime-${booking.id}">
        Calendar time
        <input
          class="queue-time-input"
          id="queueCalendarTime-${booking.id}"
          type="time"
          value="${escapeHtml(queueTimeValue)}"
        />
      </label>
      <div class="queue-card-actions">
        ${primaryAction}
        ${secondaryAction}
      </div>
    </article>
  `;
}

function renderOwnerQueue(bookings) {
  if (!ownerBookingQueue) return;

  const groups = [
    {
      title: "Needs first review",
      status: "pending_review",
    },
    {
      title: "Deposit sent",
      status: "deposit_requested",
    },
    {
      title: "Ready for final confirmation",
      status: "deposit_paid",
    },
  ];

  const groupMarkup = groups
    .map((group) => {
      const items = bookings.filter((booking) => booking.status === group.status);
      if (items.length === 0) return "";

      return `
        <section class="queue-group">
          <div class="queue-group-heading">
            <h3>${escapeHtml(group.title)}</h3>
            <span>${items.length}</span>
          </div>
          <div class="queue-group-list">
            ${items.map(renderQueueCard).join("")}
          </div>
        </section>
      `;
    })
    .join("");

  ownerBookingQueue.innerHTML =
    groupMarkup ||
    `
      <div class="queue-empty">
        No unconfirmed bookings yet. New requests from the public form will appear here automatically.
      </div>
    `;
}

function renderOwnerCalendar(bookings) {
  if (!ownerCalendarGrid || !ownerCalendarMonth) return;

  const monthStart = new Date(
    ownerCalendarViewDate.getFullYear(),
    ownerCalendarViewDate.getMonth(),
    1,
  );
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());

  ownerCalendarMonth.textContent = monthFormatter.format(monthStart);
  ownerCalendarGrid.innerHTML = "";

  const confirmedBookings = bookings.filter((booking) => booking.status === "confirmed");

  for (let index = 0; index < 42; index += 1) {
    const cellDate = new Date(gridStart);
    cellDate.setDate(gridStart.getDate() + index);

    const dateValue = formatDateValue(cellDate);
    const cellBookings = confirmedBookings
      .filter((booking) => booking.date === dateValue)
      .sort((bookingA, bookingB) => getTimeOrder(bookingA) - getTimeOrder(bookingB));

    const cell = document.createElement("div");
    cell.className = "owner-calendar-day";
    cell.dataset.action = "select-day";
    cell.dataset.date = dateValue;

    if (cellDate.getMonth() !== monthStart.getMonth()) {
      cell.classList.add("is-outside");
    }

    if (cellDate.getDay() === 0 || cellDate.getDay() === 1) {
      cell.classList.add("is-weekend");
    }

    if (dateValue === formatDateValue(today)) {
      cell.classList.add("is-today");
    }

    if (dateValue === ownerSelectedDate) {
      cell.classList.add("is-selected-day");
    }

    cell.innerHTML = `
      <div class="owner-calendar-day-top">
        <span class="owner-calendar-day-number">${cellDate.getDate()}</span>
        <span class="owner-calendar-day-count">${cellBookings.length ? `${cellBookings.length} booked` : ""}</span>
      </div>
      <div class="owner-calendar-events">
        ${
          cellBookings.length
            ? cellBookings
                .map(
                  (booking) => `
                    <button
                      class="owner-calendar-event"
                      type="button"
                      data-action="select-day"
                      data-date="${booking.date}"
                    >
                      <span class="owner-calendar-event-time">${escapeHtml(getBookingCalendarLabel(booking))}</span>
                      <span class="owner-calendar-event-name">${escapeHtml(booking.name)}</span>
                    </button>
                  `,
                )
                .join("")
            : ""
        }
      </div>
    `;

    ownerCalendarGrid.appendChild(cell);
  }
}

function renderDayDetails(bookings) {
  if (!ownerDayDetails) return;

  if (!ownerSelectedDate) {
    ownerDayDetails.innerHTML = `
      <div class="detail-empty">
        Select a day on the calendar to see each appointment time.
      </div>
    `;
    return;
  }

  const selectedDayBookings = getDayBookings(bookings, ownerSelectedDate);
  const renderBookedSlot = (booking, slotLabel) => `
    <article class="day-slot">
      <div class="day-slot-head">
        <strong class="day-slot-time">${escapeHtml(slotLabel)}</strong>
        <span class="day-slot-state">Booked</span>
      </div>
      <div class="day-slot-info">
        <p class="day-slot-name">${escapeHtml(booking.name)}</p>
        <p class="day-slot-meta">${escapeHtml(booking.service)} • ${escapeHtml(booking.email)}</p>
        <p class="day-slot-meta">${escapeHtml(booking.instagram || "No Instagram provided")}</p>
      </div>
      <div class="day-slot-actions">
        ${
          ownerPendingCancellationId === booking.id
            ? `
              <button class="queue-action is-primary" type="button" data-action="confirm-cancel" data-booking-id="${booking.id}">
                Confirm cancellation
              </button>
            `
            : `
              <button class="queue-action" type="button" data-action="begin-cancel" data-booking-id="${booking.id}">
                Cancel booking
              </button>
            `
        }
      </div>
    </article>
  `;

  const standardSlotsMarkup = STANDARD_SLOT_LABELS.map((slotLabel) => {
    const matchedBooking = selectedDayBookings.find(
      (booking) => getBookingCalendarLabel(booking) === slotLabel,
    );

    if (!matchedBooking) {
      return `
        <article class="day-slot is-empty">
          <div class="day-slot-head">
            <strong class="day-slot-time">${escapeHtml(slotLabel)}</strong>
            <span class="day-slot-state">Empty</span>
          </div>
          <p class="day-slot-empty">Empty</p>
        </article>
      `;
    }

    return renderBookedSlot(matchedBooking, slotLabel);
  }).join("");

  const extraBookings = selectedDayBookings.filter(
    (booking) => !STANDARD_SLOT_LABELS.includes(getBookingCalendarLabel(booking)),
  );

  ownerDayDetails.innerHTML = `
    <div class="day-detail-date">
      <strong>${escapeHtml(formatDisplayDate(ownerSelectedDate))}</strong>
      <p>${selectedDayBookings.length ? `${selectedDayBookings.length} confirmed booking${selectedDayBookings.length === 1 ? "" : "s"}.` : "No confirmed bookings for this date yet."}</p>
    </div>
    <div class="day-slot-list">
      ${standardSlotsMarkup}
    </div>
    ${
      extraBookings.length
        ? `
          <div class="day-extra-list">
            <h3 class="day-extra-heading">Additional times</h3>
            ${extraBookings
              .map(
                (booking) => renderBookedSlot(booking, getBookingCalendarLabel(booking)),
              )
              .join("")}
          </div>
        `
        : ""
    }
  `;
}

function renderOwnerDashboard() {
  if (!ownerBookingQueue && !ownerCalendarGrid && !ownerDayDetails) return;

  const bookings = loadBookings();

  renderOwnerStats(bookings);
  renderOwnerQueue(bookings);
  renderOwnerCalendar(bookings);
  renderDayDetails(bookings);
}

function handleOwnerAction(action, bookingId) {
  if (action === "select-day") {
    ownerSelectedDate = bookingId || "";
    ownerPendingCancellationId = "";
    renderOwnerDashboard();
    return;
  }

  if (!bookingId) return;

  const bookings = loadBookings();
  const currentBooking = bookings.find((booking) => booking.id === bookingId);
  if (!currentBooking) {
    setOwnerMessage("That booking could not be found.");
    renderOwnerDashboard();
    return;
  }

  if (action === "approve-slot") {
    const queueCalendarTime = getQueueCalendarTimeValue(
      bookingId,
      getBookingCalendarTimeValue(currentBooking),
    );

    if (!queueCalendarTime) {
      setOwnerMessage("Add the calendar time for this booking before sending the deposit email.");
      renderOwnerDashboard();
      return;
    }

    if (
      STANDARD_SLOT_LABELS.includes(timeInputToLabel(queueCalendarTime)) &&
      hasConfirmedSlotConflict(bookings, currentBooking, queueCalendarTime)
    ) {
      setOwnerMessage("That standard time slot has already been confirmed for another client.");
      renderOwnerDashboard();
      return;
    }

    const updatedBookings = bookings.map((booking) =>
      booking.id === bookingId
        ? {
            ...booking,
            status: "deposit_requested",
            calendarTime: queueCalendarTime,
            firstConfirmedAt: new Date().toISOString(),
            depositRequestedAt: new Date().toISOString(),
          }
        : booking,
    );
    saveBookings(updatedBookings);
    ownerSelectedDate = currentBooking.date;
    setOwnerMessage(
      "Slot reviewed. Deposit instructions are ready to send to the client's email.",
    );
    renderOwnerDashboard();
    launchMailto(createMailtoUrl(normalizeBooking(updatedBookings.find((booking) => booking.id === bookingId)), "deposit"));
    return;
  }

  if (action === "mark-paid") {
    const updatedBookings = bookings.map((booking) =>
      booking.id === bookingId
        ? {
            ...booking,
            status: "deposit_paid",
            depositPaidAt: new Date().toISOString(),
          }
        : booking,
    );
    saveBookings(updatedBookings);
    ownerSelectedDate = currentBooking.date;
    setOwnerMessage("Deposit marked as paid. The booking is ready for the final confirmation.");
    renderOwnerDashboard();
    return;
  }

  if (action === "confirm-booking") {
    const calendarTimeValue = getQueueCalendarTimeValue(
      bookingId,
      getBookingCalendarTimeValue(currentBooking),
    );

    if (!calendarTimeValue) {
      setOwnerMessage("Choose the final calendar time before confirming this booking.");
      renderOwnerDashboard();
      return;
    }

    if (hasConfirmedSlotConflict(bookings, currentBooking, calendarTimeValue)) {
      setOwnerMessage("That time is already confirmed on the calendar. Pick a different final time.");
      renderOwnerDashboard();
      return;
    }

    const updatedBookings = bookings.map((booking) =>
      booking.id === bookingId
        ? {
            ...booking,
            status: "confirmed",
            calendarTime: calendarTimeValue,
            confirmedAt: new Date().toISOString(),
          }
        : booking,
    );
    saveBookings(updatedBookings);
    ownerSelectedDate = currentBooking.date;
    setOwnerMessage(
      "Appointment confirmed. The client can now be viewed on the owner calendar and the final confirmation email is ready.",
    );
    renderOwnerDashboard();
    syncTimeAvailability();
    launchMailto(createMailtoUrl(normalizeBooking(updatedBookings.find((booking) => booking.id === bookingId)), "confirmed"));
    return;
  }

  if (action === "begin-cancel") {
    ownerPendingCancellationId = bookingId;
    setOwnerMessage("Cancellation email opened. Confirm cancellation to remove this booking from the dashboard.");
    renderOwnerDashboard();
    launchMailto(createMailtoUrl(currentBooking, "cancellation"));
    return;
  }

  if (action === "confirm-cancel") {
    const updatedBookings = bookings.filter((booking) => booking.id !== bookingId);
    saveBookings(updatedBookings);
    ownerPendingCancellationId = "";
    setOwnerMessage("Booking cancelled and removed from saved bookings and the calendar.");
    renderOwnerDashboard();
    syncTimeAvailability();
  }
}

scrollButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!galleryTrack) return;

    const direction = button.dataset.direction === "right" ? 1 : -1;
    const card = galleryTrack.querySelector(".ig-card");
    const step = card ? card.getBoundingClientRect().width + 18 : 320;

    galleryTrack.scrollBy({
      left: step * direction,
      behavior: "smooth",
    });
  });
});

if (document.body?.dataset.requiresAuth === "true" && !getOwnerAuthState()) {
  window.location.replace("login.html");
}

if (calendarTrigger && calendarPanel && calendarPrev && calendarNext) {
  updateCalendarValue(null);
  renderCalendar();

  calendarTrigger.addEventListener("click", () => {
    const isOpen = !calendarPanel.hidden;
    calendarPanel.hidden = isOpen;
    calendarTrigger.setAttribute("aria-expanded", String(!isOpen));
  });

  calendarPrev.addEventListener("click", () => {
    calendarViewDate = new Date(
      calendarViewDate.getFullYear(),
      calendarViewDate.getMonth() - 1,
      1,
    );
    renderCalendar();
  });

  calendarNext.addEventListener("click", () => {
    calendarViewDate = new Date(
      calendarViewDate.getFullYear(),
      calendarViewDate.getMonth() + 1,
      1,
    );
    renderCalendar();
  });

  document.addEventListener("click", (event) => {
    if (!calendarPanel.hidden && !event.target.closest(".calendar-field")) {
      closeCalendar();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCalendar();
  });
}

if (inspoUpload) {
  updatePhotoStatus();
  inspoUpload.addEventListener("change", updatePhotoStatus);
}

if (bookingForm && formResponse) {
  syncTimeAvailability();

  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(bookingForm);
    const uploadedFiles = Array.from(inspoUpload?.files || []);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const instagram = String(formData.get("instagram") || "").trim();
    const service = String(formData.get("service") || "").trim();
    const date = String(formData.get("date") || "").trim();
    const time = String(formData.get("time") || "").trim();
    const notes = String(formData.get("notes") || "").trim();

    if (!date) {
      formResponse.textContent = "Please choose a Tuesday to Saturday appointment date.";
      return;
    }

    const parsedDate = parseDateValue(date);
    if (!isBookableDate(parsedDate)) {
      formResponse.textContent = "Please pick a Tuesday to Saturday appointment date.";
      return;
    }

    if (!inspoUpload?.files?.length) {
      formResponse.textContent = "Please add at least 1 inspo photo before sending your booking.";
      return;
    }

    if (time === "Out of hours request" && !notes) {
      formResponse.textContent =
        "For out-of-hours requests, add your requested date and time in the notes and wait for confirmation.";
      return;
    }

    if (STANDARD_SLOT_LABELS.includes(time) && getConfirmedSlotsForDate(date).includes(time)) {
      formResponse.textContent =
        "That slot has just been confirmed for another client. Choose another available time.";
      syncTimeAvailability();
      return;
    }

    const inspoPreviews = await buildInspoPreviews(uploadedFiles);

    const booking = normalizeBooking({
      id: createBookingId(),
      status: "pending_review",
      name,
      email,
      instagram,
      service,
      date,
      requestedTime: time,
      calendarTime: STANDARD_SLOT_LABELS.includes(time) ? labelToTimeInput(time) : "",
      notes,
      inspoCount: uploadedFiles.length,
      inspoFiles: uploadedFiles.map((file) => file.name),
      inspoPreviews,
      createdAt: new Date().toISOString(),
    });

    const bookings = loadBookings();
    bookings.push(booking);
    saveBookings(bookings);

    const extras = [];
    if (time === "Out of hours request") {
      extras.push("Out-of-hours requests are reviewed manually before a deposit email is sent.");
    }
    if (formatDateValue(parsedDate) === formatDateValue(today)) {
      extras.push("Same-day appointments are +£10.");
    }

    formResponse.textContent = `Request sent for ${name}. Your slot will be reviewed first, and if it can be held, deposit instructions will be sent to ${email}.${extras.length ? ` ${extras.join(" ")}` : ""}`;
    bookingForm.reset();
    updateCalendarValue(null);
    calendarViewDate = getNextAvailableDate(today);
    renderCalendar();
    updatePhotoStatus();
    syncTimeAvailability();
  });
}

if (ownerLoginForm && ownerPasswordInput && loginResponse) {
  if (getOwnerAuthState()) {
    loginResponse.textContent = "You're already signed in. Redirecting to the owner page...";
    window.setTimeout(() => {
      window.location.href = "owner.html";
    }, 250);
  }

  ownerLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const password = ownerPasswordInput.value.trim();

    if (!password) {
      loginResponse.textContent = "Enter the owner password to continue.";
      return;
    }

    if (password !== OWNER_PASSWORD) {
      loginResponse.textContent = "That password doesn't match the owner login.";
      return;
    }

    setOwnerAuthState(true);
    loginResponse.textContent = "Access granted. Redirecting to the owner page...";
    window.setTimeout(() => {
      window.location.href = "owner.html";
    }, 250);
  });
}

if (ownerLogout) {
  ownerLogout.addEventListener("click", () => {
    setOwnerAuthState(false);
    window.location.href = "login.html";
  });
}

if (ownerCalendarPrev && ownerCalendarNext) {
  ownerCalendarPrev.addEventListener("click", () => {
    ownerCalendarViewDate = new Date(
      ownerCalendarViewDate.getFullYear(),
      ownerCalendarViewDate.getMonth() - 1,
      1,
    );
    renderOwnerDashboard();
  });

  ownerCalendarNext.addEventListener("click", () => {
    ownerCalendarViewDate = new Date(
      ownerCalendarViewDate.getFullYear(),
      ownerCalendarViewDate.getMonth() + 1,
      1,
    );
    renderOwnerDashboard();
  });
}

if (ownerBookingQueue) {
  ownerBookingQueue.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-action]");
    if (!trigger) return;
    handleOwnerAction(trigger.dataset.action, trigger.dataset.bookingId || trigger.dataset.date);
  });
}

if (ownerCalendarGrid) {
  ownerCalendarGrid.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-action]");
    if (!trigger) return;
    handleOwnerAction(trigger.dataset.action, trigger.dataset.date || trigger.dataset.bookingId);
  });
}

if (ownerDayDetails) {
  ownerDayDetails.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-action]");
    if (!trigger) return;
    handleOwnerAction(trigger.dataset.action, trigger.dataset.bookingId);
  });
}

if (ownerBookingQueue || ownerCalendarGrid || ownerDayDetails) {
  renderOwnerDashboard();
}

window.addEventListener("storage", (event) => {
  if (event.key === BOOKINGS_STORAGE_KEY) {
    syncTimeAvailability();
    renderOwnerDashboard();
  }

  if (
    event.key === OWNER_AUTH_KEY &&
    document.body?.dataset.requiresAuth === "true" &&
    !getOwnerAuthState()
  ) {
    window.location.replace("login.html");
  }
});
