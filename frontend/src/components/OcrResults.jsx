export default function OcrResults({ ocrData }) {
  if (!ocrData) return null;

  return (
    <div className="mt-12 bg-white p-6 rounded-xl shadow-md max-w-5xl w-full">
      <h3 className="text-lg font-semibold mb-4">Extracted Information</h3>
      <p><strong>Student Name:</strong> {ocrData.student_name || "N/A"}</p>
      <p><strong>School Name:</strong> {ocrData.school_name || "N/A"}</p>
      <div className="overflow-x-auto">
        <table className="mt-4 w-full text-sm border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {["Code", "Description", "Semester", "School Year", "Units", "Grade", "Remarks"].map((h) => (
                <th key={h} className="border px-2 py-1">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ocrData.entries.map((e, i) => (
              <tr key={i} className="even:bg-gray-50">
                <td className="border px-2 py-1">{e.subject_code}</td>
                <td className="border px-2 py-1">{e.subject_description}</td>
                <td className="border px-2 py-1">{e.semester}</td>
                <td className="border px-2 py-1">{e.school_year_offered}</td>
                <td className="border px-2 py-1">{e.total_academic_units}</td>
                <td className="border px-2 py-1">{e.final_grade}</td>
                <td className="border px-2 py-1">{e.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
