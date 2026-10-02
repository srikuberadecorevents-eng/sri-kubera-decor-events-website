import type { BookingStatus } from "@/types";

const labels: Record<BookingStatus, string> = {
  pending: "Pending",
  contacted: "Contacted",
  confirmed: "Confirmed",
  rejected: "Rejected",
};

const classes: Record<BookingStatus, string> = {
  pending: "badge-pending",
  contacted: "badge-contacted",
  confirmed: "badge-confirmed",
  rejected: "badge-rejected",
};

export default function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={classes[status]}>
      {labels[status]}
    </span>
  );
}
