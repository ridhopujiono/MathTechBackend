const { Question, Tag, QuestionTag, User, Profile } = require("@models"); // Import model Question
const cheerio = require("cheerio");
class HomeController {
  static async getAll(req, res) {
    try {
      /**
       *   "question_id": "1",
      "uploader": "Novi",
      "profile_picture": "https://i.ibb.co/MZw9H7S/man.png",
      "title": "Adding more columns to MySQL table or implode/?",
      "body": "Using Postgres's LTREE type, I am building a very simple hierarchical tree-like structure of posts and their respective comments. From the design point of view, the posts and comments are identical ...",
      "tags": [
        {
          "tag_name": "database"
        },
        {
          "tag_name": "postgres"
        }
      ],
      "like": 12,
      "dislike": 2,
      "answer_total": 4,
      "viewer_total": 3000,
      "posted_at": "12-02-2023"
    },
       */
      const data = await Question.findAll({
        attributes: [
          "title",
          "body",
          "like",
          "dislike",
          "view_count",
          "created_at",
        ],
        include: [
          {
            model: User,
            attributes: ["name"],
            include: [
              {
                model: Profile,
                attributes: ["profile_picture"],
              },
            ],
          },
          {
            model: Tag,
            as: "tag",
          },
        ],
      });
      const transformedData = data.map((d) => {
        const match = d.body.match(/<body>(.*?)<\/body>/s);
        // const $ = cheerio.load(match[1]);

        // Mengambil tag pertama beserta isinya
        // const tagPertama = $.root().children().first().toString();
        return {
          question_id: d.id,
          uploader: d.User.name,
          profile_picture: d.User.Profile.profile_picture,
          title: d.title,
          body: match[1],
          tags: d.tag.map((t) => {
            return {
              tag_name: t.tag_name,
            };
          }),
          like: d.like,
          dislike: d.dislike,
          answer_total: 0,
          viewer_total: 0,
          posted_at: d.created_at,
        };
      });
      return res.json({
        code: 200,
        success: true,
        message: "Questions Fetched",
        data: transformedData,
      });
    } catch (err) {
      return res.status(500).json({
        error: err.message,
      });
    }
  }
  catch(error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = HomeController;
