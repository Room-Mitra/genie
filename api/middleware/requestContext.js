// middleware/requestContext.js
import { createNamespace } from "cls-hooked";
import { randomUUID } from "crypto";

const ns = createNamespace("request");

export function requestContext(req, res, next) {
  ns.bindEmitter(req);
  ns.bindEmitter(res);

  ns.run(() => {
    const reqId = req.headers["x-request-id"] || randomUUID();
    ns.set("reqId", reqId);
    req.id = reqId;                 // single source of truth
    res.setHeader("X-Request-Id", reqId);
    next();
  });
}

export function getReqId() {
  return ns.get("reqId");
}
