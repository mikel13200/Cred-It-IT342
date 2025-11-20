export async function applyStandard(accountId) {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/apply-standard/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account_id: accountId }),
    });

    if (!response.ok) {
      throw new Error("Failed to apply Standard grading system");
    }

    return await response.json();
  } catch (error) {
    console.error("Error applying grading system:", error);
    throw error;
  }
}

export async function applyReverse(accountId) {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/apply-reverse/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account_id: accountId }),
    });


    if (!response.ok) {
      throw new Error("Failed to apply Reverse grading system");
    }

    return await response.json();
  } catch (error) {
    console.error("Error applying reverse grading system:", error);
    throw error;
  }
}
