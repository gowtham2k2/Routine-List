var loginBtn = document.getElementById("loginBtn");
var loginForm = document.getElementById("loginForm");
var cancelLogin = document.getElementById("cancelLoginBtn");

loginBtn.addEventListener("click", () => {
  loginForm.removeAttribute("hidden");
});

cancelLogin.addEventListener("click", () => {
  loginForm.setAttribute("hidden", true);
});
