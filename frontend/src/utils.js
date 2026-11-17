export const CONDITION_LABELS = {
  NEW: "New",
  LIKE_NEW: "Like new",
  GOOD: "Good",
  FAIR: "Fair",
};

export const money = (value) => `₹${Number(value).toLocaleString("en-IN")}`;

export const dateText = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
