const Contact = require("../Models/Contact");

exports.createContact = async (req, res) => {
  try {
    const c = new Contact(req.body);
    await c.save();
    res.status(201).json({ message: "Saved" });
  } catch (err) {
    res.status(400).json({ message: "Invalid data" });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const items = await Contact.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
