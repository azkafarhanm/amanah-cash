export function transactionRouteIds(request: Request) {
  const segments = new URL(request.url).pathname.split("/").filter(Boolean);
  const studentsIndex = segments.indexOf("students");
  const transactionsIndex = segments.indexOf("transactions");
  return {
    studentId: studentsIndex >= 0 ? decodeURIComponent(segments[studentsIndex + 1] ?? "") : "",
    transactionId: transactionsIndex >= 0 ? decodeURIComponent(segments[transactionsIndex + 1] ?? "") : ""
  };
}
