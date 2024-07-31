const router = require("express").Router();
const {
  Login,
  Register,
  addContact,
  queryUsers,
  getContacts,
  checkAuth,
  createGroup
} = require("../controllers/user");
const { Auth } = require("../services/auth");

router.post("/login", Login);
router.post("/signup", Register);
router.post("/addContact", Auth, addContact);
router.post("/queryUsers", Auth, queryUsers);
router.post("/getContacts", Auth, getContacts);
router.post("/auth", checkAuth);
router.post("/createGroup", Auth, createGroup);

module.exports = router;
