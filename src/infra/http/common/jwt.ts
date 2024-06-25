import jsonwebtoken from "jsonwebtoken";

import { cfg } from "@/infra/common";

const jwt = {
  sign(id: string): string {
    return jsonwebtoken.sign({ id }, cfg.jwtSecret, {
      expiresIn: "1h",
    });
  },
  verify(token: string) {
    const decoded = jsonwebtoken.verify(token, cfg.jwtSecret) as { id: string };
    return decoded.id;
  },
};

export default jwt;
