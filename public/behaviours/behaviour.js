var loginBtn = document.getElementById("loginBtn");
var loginForm = document.getElementById("loginForm");
loginBtn.addEventListener("click", () => {
  loginForm.removeAttribute("hidden");
});
