const submitButton = document.getElementById("submit");
document.addEventListener("submit", resetPassword);
const backendAPI = "https://expensetracker-poj7.onrender.com";

async function resetPassword(e) {
  e.preventDefault();
  const email = document.getElementById("e-mail").value;
  const myObj = {
    email: email,
  };
  try {
    const data = await axios.post(
      `${backendAPI}/password/forgotPassword`,
      myObj
    );
    const message = document.getElementById("message");
    message.innerHTML = data.data.message;
    message.style.color = "green";
  } catch (err) {
    console.log(err);
  }
}
