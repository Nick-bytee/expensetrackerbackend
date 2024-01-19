let form = document.getElementById("addForm");
var table = document.getElementById("table");
document.addEventListener("submit", additem);
const backendAPI = "https://expensetracker-poj7.onrender.com";

var editID;
var token = localStorage.getItem("token");

function createli(parsedData) {
  checkPremium(parsedData.isPremium);
  if (document.getElementById("formdata").value === "Save") {
    return saveUpdatedItem();
  } else {
    table.innerHTML = "";
    for (let i = 0; i < parsedData.expenses.length; i++) {
      var item = parsedData.expenses[i];
      //creating a li element
      var li = document.createElement("li");
      li.className = "list-group-item d-flex";

      //creating table element
      var tr = document.createElement("tr");
      var th = document.createElement("th");
      th.scope = "row";
      th.innerText = i + 1;
      tr.appendChild(th);

      //creating td elements
      var td = document.createElement("td");
      var td2 = document.createElement("td");
      var td3 = document.createElement("td");

      td.appendChild(document.createTextNode(item.category));
      td2.appendChild(document.createTextNode(item.description));
      td3.appendChild(document.createTextNode(item.amount));

      tr.appendChild(td);
      tr.appendChild(td2);
      tr.appendChild(td3);

      //creating delelte button with className
      var deletebtn = document.createElement("button");
      var icon = document.createElement("i");
      icon.className = "fa-solid fa-trash";
      icon.style.color = "#000000";
      icon.style.height = "24px";
      icon.style.width = "24px";
      deletebtn.appendChild(icon);
      deletebtn.className = "btn delete";

      //function to delete item
      deletebtn.addEventListener(
        "click",
        (function (itemID) {
          return function () {
            deleteItem(itemID);
          };
        })(item._id)
      );

      //adding buttons to li element
      tr.appendChild(deletebtn);

      table.append(tr);
    }
  }
}

document.getElementById("rzp-button").onclick = async function (e) {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `${backendAPI}/purchase/purchaseMembership`,
      {
        headers: {
          Auth: token,
        },
      }
    );
    console.log(response);

    var options = {
      key: response.data.key_id,
      order_id: response.data.order.id,
      handler: async function (response) {
        alert("Transaction Successful");
        // checkPremium(true)
        try {
          await axios.post(
            `${backendAPI}/purchase/updateTransactionStatus`,
            {
              order_id: options.order_id,
              paymentId: response.razorpay_payment_id,
              status: true,
            },
            {
              headers: {
                Auth: token,
              },
            }
          );
          checkPremium(true);
        } catch (error) {
          console.log(error);
        }
      },
    };

    const rzp1 = new Razorpay(options);
    rzp1.open();
    e.preventDefault();

    rzp1.on("payment.failed", async function (response) {
      try {
        axios.post(
          `${backendAPI}/purchase/updateTransactionStatus`,
          {
            order_id: response.error.metadata.order_id,
            paymentId: response.error.metadata.payment_id,
            status: false,
          },
          {
            headers: {
              Auth: token,
            },
          }
        );
        alert(response.error.description);
      } catch (err) {
        console.log(err);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

async function additem(a) {
  a.preventDefault();
  const token = localStorage.getItem("token");
  if (document.getElementById("formdata").value === "Save") {
    return saveUpdatedItem();
  } else {
    //getting items to add
    var amount = document.getElementById("amount").value + " ";
    var description = document.getElementById("desc").value + " ";
    var category =
      document.getElementById("category").options[
        document.getElementById("category").selectedIndex
      ].textContent;

    //adding items to local storage
    let my_obj = {
      amnt: amount,
      desc: description,
      cate: category,
      token: token,
    };
    try {
      await axios.post(`${backendAPI}/expense/addExpense`, my_obj, {
        headers: { Auth: token },
      });

      const data = await axios.get(`${backendAPI}/expense/getExpenses`, {
        headers: {
          Auth: token,
        },
      });
      createli(data.data);
      leaderBoardFunction();
    } catch (err) {
      console.log(err);
    }

    //resetting form fields
    document.getElementById("amount").value = "";
    document.getElementById("desc").value = "";
    document.getElementById("category").selectedIndex = 0;
  }
}

async function deleteItem(id) {
  const token = localStorage.getItem("token");
  if (confirm("Are You Sure You want to delete this item?")) {
    try {
      await axios.delete(`${backendAPI}/expense/deleteExpense/${id}`, {
        headers: {
          Auth: token,
        },
      });

      const data = await axios.get(`${backendAPI}/expense/getExpenses`, {
        headers: {
          Auth: token,
        },
      });
      createli(data.data);
      leaderBoardFunction();
    } catch (err) {
      console.log(err);
    }
  }
}

async function saveUpdatedItem() {
  let obj = {
    id: editID,
    amount: document.getElementById("amount").value,
    description: document.getElementById("desc").value,
    category:
      document.getElementById("category").options[
        document.getElementById("category").selectedIndex
      ].textContent,
  };
  const form = document.getElementById("addForm");
  form.children.innerHTML = "";
  try {
    await axios.put(`${backendAPI}/expense/updateExpense/${editID}`, obj);

    document.getElementById("formdata").value = "Add Expense";

    const data = await axios.get(`${backendAPI}/expense/getExpenses`, {
      headers: {
        Auth: token,
      },
    });
    createli(data.data);
    leaderBoardFunction();
  } catch (err) {
    console.log(err);
  }
}

function checkPremium(isPremium) {
  if (isPremium) {
    parent = document.getElementById("rzp-button").parentElement;
    parent.style.display = "none";
    const ul = document.createElement("ul");
    showleaderboard();
    const report = document.getElementById("reports");
    report.style.opacity = "1";
    report.className = "nav-link px-0 align-middle";

    const history = document.getElementById("history");
    history.style.opacity = "1";
    history.className = "nav-link px-0 align-middle";
  }
}

function showleaderboard() {
  const leaderboardButton = document.getElementById("leaderboard-toggle");
  leaderboardButton.style.display = "flex";
}

window.addEventListener("DOMContentLoaded", getData);

async function getData() {
  const rowsPerPage = localStorage.getItem("rowsPerPage");
  let rows = 10;
  if (rowsPerPage) {
    rows = rowsPerPage;
    const row = document.getElementById("rowsperpage");
    row.value = rows;
  }
  const params = new URLSearchParams(window.location.search);
  const page = params.get("page") || 1;
  axios
    .get(`${backendAPI}/expense/getExpenses?page=${page}&count=${rows}`, {
      headers: {
        Auth: token,
      },
    })
    .then((data) => {
      document.getElementById("span").innerHTML = data.data.userName;
      // checkPremium(data.data.isPremium)
      createli(data.data);
      pagination(data.data);
    })
    .catch((err) => console.log(err));
}

//LeaderBoard File
const showLeaderboardButton = document.getElementById("show-leaderboard");
showLeaderboardButton.addEventListener("click", leaderBoardFunction);

async function leaderBoardFunction(e) {
  //check for premium user
  try {
    const data = await axios.get(`${backendAPI}/expense/getExpenses`, {
      headers: {
        Auth: token,
      },
    });
    console.log(data);
    if (data.data.isPremium) {
      const image = document.getElementById("image");
      if (image.name === "hidden") {
        return showLeaderBoardIcon(image);
      }
      image.name = "hidden";
      image.className = "fa-solid fa-eye-slash fa-lg";
      document.getElementById("leaderboard").style.display = "flex";
      const token = document.getElementById("token");
      const result = await axios.get(`${backendAPI}/expense/leaderboard`, {
        headers: {
          Auth: token,
        },
      });
      createleaderBoard(result.data);
    }
  } catch (err) {
    console.log(err);
  }
}

function showLeaderBoardIcon(image) {
  image.className = "fa-solid fa-list fa-lg";
  image.name = "original";
  document.getElementById("leaderboard").style.display = "none";
}

function createleaderBoard(data) {
  const table = document.getElementById("leaderboardTable");
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

    //creating td elements
    var td = document.createElement("td");
    var td2 = document.createElement("td");

    td.appendChild(document.createTextNode(item.name));
    td2.appendChild(document.createTextNode(item.totalAmount));

    tr.appendChild(td);
    tr.appendChild(td2);

    // items.appendChild(li)
    table.append(tr);
  }
}

function pagination({
  hasNextPage,
  nextPage,
  hasPreviousPage,
  previousPage,
  lastPage,
  currentPage,
}) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  if (hasPreviousPage) {
    const btn2 = document.createElement("li");
    const a = document.createElement("a");
    btn2.className = "page-item";
    btn2.appendChild(a);
    a.className = "page-link";
    a.innerHTML = previousPage;
    a.style.cursor = "pointer";
    a.addEventListener("click", () => getProducts(previousPage));
    pagination.appendChild(btn2);
  }
  const btn1 = document.createElement("li");
  const a = document.createElement("a");
  btn1.className = "page-item active";
  btn1.appendChild(a);
  a.className = "page-link";
  a.innerHTML = currentPage;
  a.style.cursor = "pointer";
  a.addEventListener("click", () => getProducts(currentPage));
  pagination.appendChild(btn1);

  if (hasNextPage) {
    const btn3 = document.createElement("li");
    const a = document.createElement("a");
    btn3.className = "page-item";
    btn3.appendChild(a);
    a.className = "page-link";
    a.innerHTML = nextPage;
    a.style.cursor = "pointer";
    a.addEventListener("click", () => getProducts(nextPage));
    pagination.appendChild(btn3);
  }
}

async function getProducts(page) {
  const rowsPerPage = localStorage.getItem("rowsPerPage");
  let rows = 10;
  if (rowsPerPage) {
    rows = rowsPerPage;
  }
  try {
    const data = await axios.get(
      `${backendAPI}/expense/getExpenses?page=${page}&count=${rows}`,
      {
        headers: {
          Auth: token,
        },
      }
    );
    checkPremium(data.data.isPremium);
    createli(data.data);
    pagination(data.data);
  } catch (err) {
    console.log(err);
  }
}

const select = document.getElementById("rowsperpage");
select.addEventListener("change", () => {
  const selectedElement = event.target.value;
  localStorage.setItem("rowsPerPage", selectedElement);
  getData();
});

const signOut = document.getElementById("signOut");
signOut.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "./signIn.html";
});
