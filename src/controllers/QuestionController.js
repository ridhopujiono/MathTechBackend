const { Question, QuestionTag } = require("@models"); // Import model Question
const bodyParser = require("body-parser");
const uploadImageFromBase64 = require("../utils/uploadImageFromBase64");
const { Tag } = require("@models");

class QuestionController {
  static async getTagId(request, data) {
    let idTags = [];
    // Buat array request menjadi lowercase.
    request = request.map((r) => r.toLowerCase());

    data.forEach((d) => {
      if (request.includes(d.tag_name.toLowerCase())) {
        idTags.push(d.id);
      }
    });

    // Buat array untuk menyimpan tag yang tidak ada di database.
    let missingTags = [];

    // Periksa apakah setiap tag dalam request ada di database.
    request.forEach(async (r) => {
      if (!data.some((d) => d.tag_name.toLowerCase() === r.toLowerCase())) {
        missingTags.push(r);
      }
    });

    // Buat tag baru untuk setiap tag yang hilang di database.
    if (missingTags.length > 0) {
      const newTags = await Tag.bulkCreate(
        missingTags.map((r) => ({ tag_name: r })),
        { fields: ["tag_name"] }
      );

      // Tambahkan ID tag baru ke array idTags.
      newTags.forEach((t) => {
        idTags.push(t.id);
      });
    }

    // Return array idTags.
    return idTags;
  }

  // Post question
  static async addQuestionByUserId(req, res) {
    const { user_id, title, body, tags } = req.body;
    try {
      const html = await uploadImageFromBase64.upload(body);
      const tag_list = await Tag.findAll({});
      const getIds = await QuestionController.getTagId(tags, tag_list);

      const question = await Question.create({
        user_id,
        title,
        body: html,
        like: 0,
        dislike: 0,
        view_count: 0,
        vote_count: 0,
      });
      // Insert array getIds ke tabel QuestionTags
      try {
        for (let i = 0; i < getIds.length; i++) {
          await QuestionTag.create({
            question_id: question.id,
            tag_id: getIds[i],
          });
        }
        return res.json({
          code: 201,
          success: true,
          message: "Question Added",
        });
      } catch (err) {
        return res.status(500).json({
          error: err.message,
        });
      }

      return res.status(201).json({
        code: 201,
        success: true,
        message: "Question Added",
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = QuestionController;
