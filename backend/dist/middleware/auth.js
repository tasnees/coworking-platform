"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = exports.default = void 0;
// Re-export the new auth middleware
var auth_new_1 = require("./auth_new");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return auth_new_1.authMiddleware; } });
Object.defineProperty(exports, "requireRoles", { enumerable: true, get: function () { return auth_new_1.requireRoles; } });
