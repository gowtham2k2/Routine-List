var loginBtn = document.getElementById("loginBtn");
var signUpBtn = document.getElementById("signUpBtn");
var loginForm = document.getElementById("loginForm");
var signUpForm = document.getElementById("signUpForm");
var cancelFormBtn = document.querySelectorAll(".cancel-form-btn");

loginBtn.addEventListener("click", () => {
  loginForm.removeAttribute("hidden");
});

cancelFormBtn.forEach((element) => {
  element.addEventListener("click", () => {
    loginForm.setAttribute("hidden", true);
    signUpForm.setAttribute("hidden", true);
  });
});
signUpBtn.addEventListener("click", () => {
  signUpForm.removeAttribute("hidden");
});
