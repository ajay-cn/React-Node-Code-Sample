module.exports.msg = function (code) {
  const codeArr = {
    /* For Global Use */
    "MSG001": "Invalid request data!",
    "MSG002": "Something went wrong! Please try again.",
    "MSG003": "Unauthorized user!",
    "MSG004": "Registration complete",
    "MSG005": "User logged in successfully!",
    "MSG006": "Record Found successfully!",
    "MSG007": "Record Not Found!",
    "MSG008": "Invalid email or password",
    "MSG009": "Account already exist with same Email.",
    "MSG039": "Feedback added successfully.",
    "MSG040": "Temp Profile Created Successfully.",
    "MSG041": "Temp Profile Approved Successfully.",
    "MSG043": "Note Saved Successfully.",
    "MSG044": "Notes Details Fetched Successfully.",
    "MSG045": "Data archived successfully.",
    "MSG046": "Note Updated Successfully.",
    "MSG047": "Note deleted successfully.",
    "MSG049": "Data deleted successfully.",
    "MSG051": "Thanks for your feedback, your Client Success Manager will reach out with next steps.",
    "MSG054": "Unable To Modify Profile Image.",
    "MSG055": "Image modified successfully.",
    "MSG056": "File name updated successfully.",
  }

  return (typeof codeArr[code] !== "undefined" ? codeArr[code] : "");
}