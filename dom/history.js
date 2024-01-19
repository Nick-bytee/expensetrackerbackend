window.addEventListener("DOMContentLoaded", showHistory);
const backendAPI = "https://expensetracker-poj7.onrender.com";

async function showHistory() {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `${backendAPI}/expense/getDownloadHistory`,
      { headers: { Auth: token } }
    );
    if (response.data.isPremium) {
      showData(response.data.data);
      document.getElementById("span").innerHTML = response.data.userName;
      premiumFunction();
    } else {
      window.alert("You are not a premium user");
    }
  } catch (err) {
    console.log(err);
  }
}

function premiumFunction() {
  parent = document.getElementById("rzp-button").parentElement;
  parent.style.display = "none";
}

function showData(data) {
  const table = document.getElementById("downloadsTable");
  let td = document.createElement("td");
  table.innerHTML = "";
  for (let i = 0; i < data.length; i++) {
    var item = data[i];

    //creating a li element
    var li = document.createElement("li");
    li.className = "list-group-item d-flex";

    //creating table element
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    th.scope = "row";
    th.innerText = i + 1;
    tr.appendChild(th);

    //creating delelte button with className
    const downloadButton = document.createElement("button");
    const a = document.createElement("a");
    a.href = item.fileURL;
    const img = document.createElement("i");
    img.className = "fa-solid fa-download";
    img.style.color = "black";
    a.appendChild(img);
    downloadButton.appendChild(a);
    downloadButton.style.display = "contents";

    //creating td elements
    const date = document.createElement("td");
    const fileName = document.createElement("td");

    date.innerHTML = item.createdAt.split("T")[0];
    fileName.innerHTML = item.fileName;

    tr.appendChild(date);
    tr.appendChild(fileName);
    tr.appendChild(downloadButton);

    // items.appendChild(li)
    table.append(tr);
  }
}

const signOut = document.getElementById("signOut");
signOut.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "./signIn.html";
});
