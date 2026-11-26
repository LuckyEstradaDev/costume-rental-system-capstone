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
    return UserModel.find({role: {$in: ["admin", "staff"]}})
      .select("firstName lastName email phoneNumber gender dateOfBirth address role deactivated profilePicture");
  }
  async getCustomers() {
    return UserModel.find({role: "user"})
      .select("firstName lastName email phoneNumber deactivated profilePicture")
      .sort({createdAt: -1}).lean();
  }

  async getCustomer(id: string) {
    return UserModel.findOne({_id: id, role: "user"})
      .select("firstName middleName lastName email phoneNumber gender dateOfBirth age address createdAt deactivated profilePicture")
      .lean();
  }

  async setAccountStatus(id: string, deactivated: boolean) {
    return UserModel.findOneAndUpdate({_id: id, role: {$in: ["user", "staff"]}},
      {$set: {deactivated}}, {new: true}).select("_id deactivated");
  }

  async isStaff(id: string) {
    return UserModel.exists({_id: id, role: "staff"});
  }
}
