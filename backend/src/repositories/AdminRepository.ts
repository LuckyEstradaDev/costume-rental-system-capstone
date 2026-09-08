import {UserModel} from "../models/UserModel.js";

export class AdminRepository {
  async getUserCount() {
    const count = await UserModel.countDocuments({role:"user"});
    const aggregate = await UserModel.aggregate([
       {
      $match: {
        role: "user",
      },
    },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: {$sum: 1},
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1,
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ]);

    return {count, aggregate};
  }
  async getAdmins() {
    return await UserModel.find({role: "admin"});
  }
}
