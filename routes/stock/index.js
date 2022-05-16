const stockTable = require("./table");
let id = "";
let amount = -1;

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
			if (id === body.id && amount === body.amount) {
				return new Error();
			}
			id = body.id;
			amount = body.amount;
			
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
