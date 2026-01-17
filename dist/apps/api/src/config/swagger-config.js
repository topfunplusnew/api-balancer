const swaggerUi = require("swagger-ui-express");
const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
/**
 * 加载OpenAPI规范
 */
const loadOpenApiSpec = () => {
    const swaggerDir = path.join(__dirname, "../../swagger");
    const mainDocPath = path.join(swaggerDir, "openapi.yaml");
    // 读取主文档
    const swaggerSpec = yaml.load(fs.readFileSync(mainDocPath, "utf8"));
    return swaggerSpec;
};
const swaggerSpecs = loadOpenApiSpec();
module.exports = {
    swaggerUi,
    swaggerSpecs,
};
