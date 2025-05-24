import { UserService } from "@/features/users/user-service";
import { wrapAsync } from "@/http/lib/http-wrap-async";
import { jwt } from "@/http/lib/jwt";

export function createUser(userService: UserService) {
  return wrapAsync(async (req, res) => {
    const result = await userService.createUser(req.body);
    if (result === null) {
      return res.status(400).json({ message: "Invalid e-mail or password." });
    }
    res.status(201).json({ token: jwt.sign(result.id) });
  });
}
