const API_URL = "http://localhost:8000/api/departments";

export const addDepartment = async (
  formData: {
    departmentName: string;
    description: string;
    headOfDepartment: string;
  },
  token: string
) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add department");
    }

    return { success: true, message: "Department added successfully!" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
