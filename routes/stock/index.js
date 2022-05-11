const stockTable = require("./table");

const treatRoute = async ({ endpoint, method, body, params, query }) => {
	switch (method) {
		case "GET":
			if (params.id) {
				return stockTable.find(params.id);
			}
			return stockTable.list({ raw: true });
		case "POST":
			return stockTable.create(body);
		case "PUT":
			let package;
			package = await stockTable.find(params.id);
			if (!package) {
				return new Error();
			}
			return stockTable.update(params.id, body);
		case "DELETE":
			return stockTable.remove(params.id);
		default:
			return;
	}
};

module.exports = treatRoute;
