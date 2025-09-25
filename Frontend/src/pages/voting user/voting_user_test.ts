const form = document.getElementById("userForm") as HTMLFormElement;
const cancelBtn = document.getElementById("cancelBtn") as HTMLButtonElement;
const dobInput = document.getElementById("dob") as HTMLInputElement;

// Handle form submit
form.addEventListener("submit", (e: Event) => {
  e.preventDefault();
  alert("User information submitted successfully!");
  form.reset();
});

// Handle cancel button
cancelBtn.addEventListener("click", () => {
  const confirmCancel = confirm("Are you sure you want to cancel? All entered data will be lost.");
  if (confirmCancel) {
    form.reset();
  }
});

// Set max date for DOB to today
const today = new Date().toISOString().split("T")[0];
dobInput.setAttribute("max", today);
