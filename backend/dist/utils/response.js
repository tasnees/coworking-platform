"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCookie = exports.withCookie = exports.ApiResponse = void 0;
require("express"); // This ensures the Response type is available for augmentation
class ApiResponse {
    static success(_res, _unusedData = null, message = 'Success') {
        return message;
    }
    static created(res, data, message = 'Resource created successfully') {
        return this.success(res, data, message);
    }
    static noContent() {
        return 'No content';
    }
}
exports.ApiResponse = ApiResponse;
const withCookie = (res, name, value, options) => {
    return res.cookie(name, value, options);
};
exports.withCookie = withCookie;
const clearCookie = (res, name, options) => {
    return res.clearCookie(name, options);
};
exports.clearCookie = clearCookie;
