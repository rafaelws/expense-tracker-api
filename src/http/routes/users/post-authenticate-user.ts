import { UserService } from "@/features/users/user-service";
import { wrapAsync } from "@/lib/http-wrap-async";
import { jwt } from "@/lib/jwt";

export function authenticateUser(userService: UserService) {
  return wrapAsync(async (req, res) => {
    const result = await userService.authenticateUser(req.body);
    if (result === null) {
      return res.status(401).json({ message: "Invalid e-mail or password." });
    }
    res.json({ token: jwt.sign(result.id) });
  });
}
